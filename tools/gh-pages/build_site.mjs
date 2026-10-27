#!/usr/bin/env node
/**
 * build_site.mjs — assembles the publishable static tree for GitHub Pages.
 *
 * Copies the repository into an output directory (default: `_site`), skipping
 * development-only entries (CI config, editor settings, build tools, server
 * leftovers), and adds a `.nojekyll` marker so Pages serves every file verbatim.
 *
 * Run from the repository root, after the static assets have been built:
 *   node tools/deno/build_static.ts
 *   node tools/gh-pages/build_site.mjs          # writes _site/
 *   node tools/gh-pages/build_site.mjs --out build/pages
 */

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outDir = path.resolve(
	repoRoot,
	outIndex >= 0 && args[outIndex + 1] ? args[outIndex + 1] : "_site",
);

// Top-level entries that must never be published (build inputs / server leftovers).
const EXCLUDED_TOP_LEVEL = new Set([
	".git",
	".github",
	".gitignore",
	".history",
	".idea",
	".kilo",
	".vscode",
	".vstags",
	"_site",
	"cgi-bin",
	"deployment.md",
	"node_modules",
	"tools",
]);

// Safety net: server-side config/scripts/dumps and OS/editor junk anywhere in the tree.
const EXCLUDED_FILE = /^(?:\.htaccess|x\.htaccess|\.DS_Store|Thumbs\.db|Picasa\.ini)$|\.(?:php|pl|sql)$/i;

// Files the site cannot work without; failing loudly beats publishing a broken site.
// CNAME pins the custom domain (quran.muslim-web.com) on every publish — without it
// Pages falls back to https://rdesoky.github.io/muslim-web.com/.
const REQUIRED = [
	"CNAME",
	"index.html",
	"sura/index.html",
	"js_strings_ar.js",
	"js_strings_en.js",
	"js/quran/local_cgi.js",
	"js/quran/qtext_data.js",
	"css/quran/base.css",
	"qtext/sura_001.html",
];

let fileCount = 0;
let byteCount = 0;
const skipped = [];

function isExcluded(rel, name, isDir) {
	if (!rel.includes("/") && EXCLUDED_TOP_LEVEL.has(name.toLowerCase())) return true;
	if (!isDir && EXCLUDED_FILE.test(name)) return true;
	return false;
}

function copyTree(from, to, relDir) {
	for (const entry of readdirSync(from, { withFileTypes: true })) {
		const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
		if (isExcluded(rel, entry.name, entry.isDirectory())) {
			skipped.push(rel);
			continue;
		}
		const src = path.join(from, entry.name);
		const dst = path.join(to, entry.name);
		if (entry.isDirectory()) {
			mkdirSync(dst, { recursive: true });
			copyTree(src, dst, rel);
		} else if (entry.isFile() || entry.isSymbolicLink()) {
			copyFileSync(src, dst);
			fileCount++;
			byteCount += statSync(src).size;
		} else {
			skipped.push(rel);
		}
	}
}

function main() {
	if (outDir === repoRoot) {
		throw new Error(`Refusing to use the repository root as the output directory: ${outDir}`);
	}

	rmSync(outDir, { recursive: true, force: true });
	mkdirSync(outDir, { recursive: true });

	// GitHub Pages runs Jekyll unless this file exists; Jekyll would drop files
	// whose names start with "_" and rewrite/ignore others.
	writeFileSync(path.join(outDir, ".nojekyll"), "");

	copyTree(repoRoot, outDir, "");

	const missing = REQUIRED.filter((rel) => !existsSync(path.join(outDir, rel)));
	if (missing.length) {
		throw new Error(`Site is missing required file(s): ${missing.join(", ")}`);
	}

	const mb = (byteCount / (1024 * 1024)).toFixed(1);
	console.log(
		`Assembled ${fileCount} files (${mb} MB) into ${path.relative(repoRoot, outDir) || "."}`,
	);
	if (skipped.length) {
		const shown = skipped.slice(0, 15).join(", ");
		console.log(
			`  skipped ${skipped.length} entr${skipped.length === 1 ? "y" : "ies"}: ${shown}${skipped.length > 15 ? ", …" : ""}`,
		);
	}
}

main();
