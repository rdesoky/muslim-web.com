// Dump qtext sura pages from the production server as clean static .html files.
//
// The server renders qtext/sura_NNN.php via PHP, but the output the app consumes
// (through /cgi-bin/js_get_html.pl) is the <body> content only. This script
// fetches the raw rendered page, extracts the <body> content, and writes a
// clean, self-contained .html document for static serving.
//
// Run from repo root:  node tools/build/dump_qtext.mjs
import { writeFileSync } from "node:fs";

const RAW_BASE = "http://quran.muslim-web.com/qtext/sura_";
const OUT = "qtext";
const TIMEOUT_MS = 20000;

async function fetchSura(n) {
  const s = String(n).padStart(3, "0");
  const url = `${RAW_BASE}${s}.php`;
  let out;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    out = (await res.text()).trim();
  } catch (e) {
    console.log(`FAIL ${s}: ${e.message}`);
    return;
  }
  // extract body content
  let body = out;
  const b = body.indexOf("<body>");
  const e = body.indexOf("</body>");
  if (b >= 0 && e >= b) {
    body = body.slice(b + "<body>".length, e);
  }
  body = body.trim();
  if (!body) {
    console.log(`BAD ${s}: empty body`);
    return;
  }
  const doc =
    `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
  writeFileSync(`${OUT}/sura_${s}.html`, doc, "utf8");
  console.log(`ok sura_${s} (${body.length} bytes)`);
}

for (let n = 1; n <= 114; n++) await fetchSura(n);
