/**
 * build_static.ts — replaces the PHP runtime (index.php, sura/index.php, js_strings.php, filesver.php).
 *
 * 1. Parses {ar,en}_strings.php $Str arrays into js_strings_ar.js / js_strings_en.js bundles
 *    (same output format as the old js_strings.php: `var _S, gStrings; _S = gStrings = {...}; var GS = ...`).
 * 2. Stamps cache-busting ?v= (mtime based, like filesver.php did) on local css/js URLs
 *    in the static HTML shells (index.html, sura/index.html).
 * 3. Sets gBuildVer in the shells (used by the shells to load the language bundle).
 *
 * Run from the repository root:
 *   deno run --allow-read --allow-write tools/deno/build_static.ts
 *   (or: node tools/deno/build_static.ts)
 *
 * After this migration the *_strings.php files are deleted; the generated
 * js_strings_ar.js / js_strings_en.js bundles are the source of truth.
 * If the PHP string files are restored, this tool regenerates the bundles from them.
 */

import { readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const LANGS = ["ar", "en"];
const HTML_SHELLS = ["index.html", "sura/index.html"];

type StrEntry = string | Record<string, string>;

// ---------------------------------------------------------------------------
// PHP string parsing
// ---------------------------------------------------------------------------

/** Unescape a PHP double-quoted string literal body. */
function phpUnescape(s: string): string {
	if (!s.startsWith("\\")) return s;
	const ch = s[1];
	switch (ch) {
		case "n": return "\n";
		case "t": return "\t";
		case "r": return "\r";
		case '"': return '"';
		case "\\": return "\\";
		case "$": return "$";
		default: return s;
	}
}

/** Read a double-quoted PHP string starting at src[i] (i must point at '"'). */
function readPhpString(src: string, i: number): { value: string; end: number } {
	i++; // skip opening quote
	let value = "";
	while (i < src.length) {
		const ch = src[i];
		if (ch === "\\") {
			value += phpUnescape(src.slice(i, i + 2));
			i += 2;
			continue;
		}
		if (ch === '"') {
			return { value, end: i + 1 };
		}
		value += ch;
		i++;
	}
	throw new Error("Unterminated PHP string literal");
}

function skipWs(src: string, i: number): number {
	while (i < src.length && /\s/.test(src[i])) i++;
	return i;
}

/**
 * Parse a PHP array literal body into a flat object (last-wins, like PHP).
 * Nested arrays (reciters, reciter_filters, sura_names) become objects.
 */
function parsePhpArrayBody(src: string): Record<string, StrEntry> {
	const out: Record<string, StrEntry> = {};

	type Frame = { container: Record<string, string> | null; key?: string };
	const frames: Frame[] = [{ container: null }];

	const attach = (f: Frame, key: string, value: StrEntry) => {
		if (f.container === null) {
			out[key] = value; // top level: last-wins like PHP
		} else {
			f.container[key] = value;
		}
	};

	let i = 0;
	while (i < src.length) {
		const ch = src[i];

		if (/\s/.test(ch)) { i++; continue; }

		if (ch === "/" && src[i + 1] === "*") {
			const end = src.indexOf("*/", i + 2);
			if (end < 0) throw new Error("Unterminated PHP comment");
			i = end + 2;
			continue;
		}

		if (ch === "(") {
			frames.push({ container: {} });
			i++;
			continue;
		}

		if (ch === ")") {
			const f = frames.pop()!;
			if (frames.length === 0) throw new Error("Unbalanced PHP array");
			const parent = frames[frames.length - 1];
			if (f.container !== null) {
				// nested array: attach by key (assoc) or numeric index (plain)
				const sub = f.container;
				const nKey = Object.keys(sub).length;
				const key = f.key ?? String(nKey);
				// attach to parent (may itself be a nested array)
				if (parent.container === null) {
					out[key] = sub;
				} else {
					parent.container[key] = sub;
				}
			}
			i++;
			continue;
		}

		if (ch === ",") { i++; continue; }

		if (ch === '"') {
			const s = readPhpString(src, i);
			i = skipWs(src, s.end);
			const f = frames[frames.length - 1];

			if (src[i] === "=" && src[i + 1] === ">") {
				i = skipWs(src, i + 2);
				// optional "array" keyword before the nested array
				const arrayKw = /^array\s*\(/.exec(src.slice(i, i + 40));
				if (arrayKw) {
					i += arrayKw[0].length - 1; // skip up to "(", i++ lands after it
				}
				if (src[i] === '"') {
					const v = readPhpString(src, i);
					i = v.end;
					attach(f, s.value.trim(), v.value);
				} else if (src[i] === "(") {
					frames.push({ container: {}, key: s.value.trim() });
					i++;
				} else {
					throw new Error(
						`Unexpected token after '=>' in PHP array at ${i}: ${JSON.stringify(src.slice(i - 40, i + 40))}`,
					);
				}
			} else {
				// numeric-array item (sura_names style)
				if (f.container === null) {
					throw new Error("Numeric array item outside a nested array");
				}
				const key = String(Object.keys(f.container).length);
				f.container[key] = s.value;
			}
			continue;
		}

		throw new Error(`Unexpected character '${ch}' in PHP array at ${i}`);
	}

	if (frames.length !== 1) throw new Error("Unbalanced PHP array");
	return out;
}

/** Strip PHP open/close tags, parse `$Str = array( ... );`. */
function parseStringsPhp(file: string): Record<string, StrEntry> {
	const src = readFileSync(file, "utf8");
	const m = src.match(/\$Str\s*=\s*array\s*\(/);
	if (!m) throw new Error(`${file}: $Str = array( not found`);
	const start = m.index! + m[0].length;

	// find the matching ")" — string and comment aware
	let depth = 1;
	let i = start;
	while (i < src.length && depth > 0) {
		const ch = src[i];
		if (ch === '"') {
			const s = readPhpString(src, i);
			i = s.end;
			continue;
		}
		if (ch === "/" && src[i + 1] === "*") {
			const end = src.indexOf("*/", i + 2);
			if (end < 0) throw new Error(`${file}: unterminated comment`);
			i = end + 2;
			continue;
		}
		if (ch === "(") depth++;
		else if (ch === ")") depth--;
		i++;
	}
	if (depth !== 0) throw new Error(`${file}: unbalanced array`);

	const body = src.slice(start, i - 1);
	const parsed = parsePhpArrayBody(body);
	if (Object.keys(parsed).length === 0) {
		throw new Error(`${file}: parsed 0 strings — parser broken?`);
	}
	return parsed;
}

// ---------------------------------------------------------------------------
// JS bundle emission (mirrors the old js_strings.php output)
// ---------------------------------------------------------------------------

function jsKey(key: string): string {
	const trimmed = key.trim();
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(trimmed)
		? trimmed
		: JSON.stringify(trimmed);
}

function emitValue(v: StrEntry, indent = ""): string {
	if (typeof v === "string") return JSON.stringify(v);
	const parts: string[] = [];
	for (const [k, val] of Object.entries(v)) {
		parts.push(`${indent}\t${jsKey(k)}:${emitValue(val, indent + "\t")}`);
	}
	return `{\n${parts.join(",\n")}\n${indent}}`;
}

function emitBundle(str: Record<string, StrEntry>): string {
	const body = emitValue(str);
	return [
		"var _S, gStrings;",
		`_S = gStrings = ${body};`,
		"",
		"var GS = function(sID){",
		"\tif( Defined( gStrings[ sID ] ) ){",
		"\t\treturn gStrings[sID];",
		"\t}",
		'\treturn "[" + sID + "]";',
		"};",
		"",
	].join("\n");
}

// ---------------------------------------------------------------------------
// mtime version stamping (replaces filesver.php)
// ---------------------------------------------------------------------------

function fileDateFromMs(ms: number): string {
	const d = new Date(ms);
	const pad = (n: number) => String(n).padStart(2, "0");
	return (
		`${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
		`.` +
		`${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
	);
}

function fileDate(p: string): string {
	return fileDateFromMs(statSync(p).mtimeMs);
}

function stampFileUrl(url: string, htmlDir: string): string {
	if (/^(https?:)?\/\//.test(url)) return url;
	if (url.startsWith("/cgi-bin/")) return url;
	const bare = url.split("?")[0];
	if (!/(^|\/)(css|js)\//.test(bare) && !/js_strings_(ar|en)\.js$/.test(bare)) {
		return url;
	}
	const rel = bare.replace(/^\//, "");
	const abs = path.resolve(htmlDir, rel);
	if (!existsSync(abs)) {
		console.warn(`  WARNING: ${abs} not found — no version stamped`);
		return url;
	}
	return `${bare}?v=${fileDate(abs)}`;
}

function stampHtml(htmlPath: string, buildVer: string): void {
	let html = readFileSync(htmlPath, "utf8");
	const htmlDir = path.dirname(path.resolve(htmlPath));

	html = html.replace(
		/(href|src)="([^"]+)"/g,
		(m, name: string, url: string) => `${name}="${stampFileUrl(url, htmlDir)}"`,
	);

	// version the css/js URLs that appear inside JS string literals (e.g. ScriptLoader lists)
	html = html.replace(
		/(["'])((?:\.\.\/)*(?:css|js)\/[^"']+)\1/g,
		(m, q: string, url: string) => `${q}${stampFileUrl(url, htmlDir)}${q}`,
	);

	if (!/(var |window\.)gBuildVer = "[^"]*";/.test(html)) {
		console.warn(`  WARNING: ${htmlPath} has no gBuildVer tag`);
	} else {
		html = html.replace(
			/(var |window\.)gBuildVer = "[^"]*";/,
			`$1gBuildVer = "${buildVer}";`,
		);
	}

	writeFileSync(htmlPath, html);
	console.log(`Stamped ${htmlPath} (gBuildVer=${buildVer})`);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main(): void {
	// 1. strings → bundles
	const keySets: Record<string, Set<string>> = {};

	for (const lang of LANGS) {
		const phpFile = path.join(root, `${lang}_strings.php`);
		const bundlePath = path.join(root, `js_strings_${lang}.js`);
		if (!existsSync(phpFile)) {
			if (existsSync(bundlePath)) {
				console.log(`${lang}_strings.php not found — keeping ${bundlePath}`);
				keySets[lang] = new Set();
				continue;
			}
			throw new Error(`Neither ${lang}_strings.php nor js_strings_${lang}.js exists`);
		}
		const str = parseStringsPhp(phpFile);
		keySets[lang] = new Set(Object.keys(str));
		writeFileSync(bundlePath, emitBundle(str));
		console.log(`Wrote js_strings_${lang}.js (${keySets[lang].size} strings)`);
	}

	// cross-language key check (informational)
	const arKeys = keySets["ar"];
	const enKeys = keySets["en"];
	if (arKeys.size && enKeys.size) {
		const onlyAr = [...arKeys].filter((k) => !enKeys.has(k));
		const onlyEn = [...enKeys].filter((k) => !arKeys.has(k));
		if (onlyAr.length || onlyEn.length) {
			console.warn(
				`  WARNING: language key mismatch — only in ar: ${onlyAr.join(", ") || "none"}; only in en: ${onlyEn.join(", ") || "none"}`,
			);
		}
	}

	// 2. version stamping on the HTML shells
	const bundleTimes = LANGS.map((lang) =>
		statSync(path.join(root, `js_strings_${lang}.js`)).mtimeMs,
	);
	const buildVer = fileDateFromMs(Math.max(...bundleTimes));

	for (const rel of HTML_SHELLS) {
		const p = path.join(root, rel);
		if (!existsSync(p)) {
			console.warn(`  WARNING: ${rel} not found — skipped`);
			continue;
		}
		stampHtml(p, buildVer);
	}
}

main();
