// Mirror tafseer / translation pages into the local static tree so the site can
// serve them itself instead of pointing a base URL at an upstream host.
//
// Pages are stored as tafseer/<SOURCE>/<SSS>/<SSSAAA>.html and are addressed at
// runtime by getTafseerPageURL() (see js/quran/lib.js).
//
// Run from the repo root:
//   node tools/build/mirror_tafseer.mjs                 # fill every source
//   node tools/build/mirror_tafseer.mjs --sources en_yusufali,fr_hamidullah
//   node tools/build/mirror_tafseer.mjs --dry-run       # report what is missing
//
// The upstream serves <SOURCE>/<SSS>/<AAA>.html (three-digit aya); this script
// rewrites that to the on-disk <SSSAAA>.html name. Already-present files are
// skipped, so the script is resumable and safe to re-run.
import { writeFileSync, mkdirSync, existsSync } from "node:fs";

const UPSTREAM = "https://tafseer.muslim-web.com/";

const SOURCES = [
  "KATHEER",
  "TABARY",
  "GALALEEN",
  "KORTOBY",
  "en_yusufali",
  "fr_hamidullah",
  "de_bubenheim",
  "tr_ozturk",
  "id_muntakhab",
  "ms_basmeih",
];

const suraAyaCount = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
  110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45,
  83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
  11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0 || i + 1 >= process.argv.length) return fallback;
  return process.argv[i + 1];
}

const dryRun = process.argv.includes("--dry-run");
const concurrency = Number(arg("concurrency", 16));
const sources = arg("sources", SOURCES.join(",")).split(",").map((s) => s.trim()).filter(Boolean);

for (const source of sources) {
  if (!SOURCES.includes(source)) {
    console.error(`Unknown source "${source}". Known: ${SOURCES.join(", ")}`);
    process.exit(1);
  }
}

const pad = (n, width) => String(n).padStart(width, "0");

// Build the full work list up front so the summary is accurate before writing.
const tasks = [];
for (const source of sources) {
  for (let sura = 1; sura <= suraAyaCount.length; sura++) {
    const suraStr = pad(sura, 3);
    for (let aya = 1; aya <= suraAyaCount[sura - 1]; aya++) {
      const dir = `tafseer/${source}/${suraStr}`;
      const file = `${dir}/${suraStr}${pad(aya, 3)}.html`;
      if (existsSync(file)) continue;
      tasks.push({ source, sura, aya, dir, file });
    }
  }
}

const total = suraAyaCount.reduce((a, b) => a + b, 0);
console.log(
  `${sources.length} source(s) x ${total} ayat: ${tasks.length} file(s) missing` +
    (dryRun ? " (dry run)" : "")
);

if (dryRun) {
  const bySource = {};
  for (const t of tasks) bySource[t.source] = (bySource[t.source] || 0) + 1;
  for (const [source, count] of Object.entries(bySource)) console.log(`  ${source}: ${count}`);
  process.exit(0);
}

let done = 0;
let skipped = 0;
const failures = [];

async function fetchPage(task) {
  const url =
    `${UPSTREAM}${task.source}/${pad(task.sura, 3)}/${pad(task.aya, 3)}.html`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return { status: 404 };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { status: 200, body: await res.text() };
    } catch (e) {
      if (attempt === 3) return { status: 0, error: e.message };
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
}

let cursor = 0;
async function worker() {
  while (cursor < tasks.length) {
    const task = tasks[cursor++];
    const result = await fetchPage(task);
    if (result.status === 200) {
      mkdirSync(task.dir, { recursive: true });
      writeFileSync(task.file, result.body);
      done++;
    } else {
      skipped++;
      failures.push(`${task.source}/${task.sura}:${task.aya} -> ${result.error || result.status}`);
    }
    const seen = done + skipped;
    if (seen % 500 === 0) console.log(`  ${seen}/${tasks.length} (${done} written, ${skipped} unavailable)`);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

console.log(`done: ${done} written, ${skipped} unavailable`);
if (failures.length) {
  console.log("unavailable pages:");
  for (const f of failures.slice(0, 50)) console.log(`  ${f}`);
  if (failures.length > 50) console.log(`  ... and ${failures.length - 50} more`);
}
