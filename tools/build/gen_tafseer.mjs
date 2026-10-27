// Download tafsir JSON for Quran ayat into tafseer/<sura>_<aya>.json.
//
// Run from repo root:  node tools/build/gen_tafseer.mjs
// Optional:            node tools/build/gen_tafseer.mjs --sura 2 --aya 255
//
// Only the first sura/aya of the data set is fetched by default — this is the
// original partial-import stub, kept as-is until the full import is written.
import { writeFileSync, mkdirSync } from "node:fs";

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
  return Number(process.argv[i + 1]);
}

const onlySura = arg("sura", null);
const onlyAya = arg("aya", null);

mkdirSync("tafseer", { recursive: true });

const suras = onlySura ? [onlySura] : suraAyaCount.slice(0, 1).map((_, i) => i + 1);

for (const sura of suras) {
  const ayaCount = suraAyaCount[sura - 1];
  if (!ayaCount) {
    console.error(`Invalid sura ${sura}`);
    process.exitCode = 1;
    continue;
  }
  const ayat = onlyAya ? [onlyAya] : [1];
  for (const aya of ayat) {
    if (aya < 1 || aya > ayaCount) {
      console.error(`Invalid aya ${sura}:${aya} (sura has ${ayaCount} ayat)`);
      process.exitCode = 1;
      continue;
    }
    const suraStr = String(sura).padStart(3, "0");
    const ayaStr = String(aya).padStart(3, "0");
    const url = `https://api.quran.com/v1/quran/tafsirs/${sura}/${aya}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      writeFileSync(`tafseer/${suraStr}_${ayaStr}.json`, text);
      console.log(`ok ${suraStr}_${ayaStr}.json`);
    } catch (e) {
      console.error(`FAIL ${suraStr}_${ayaStr}: ${e.message}`);
      process.exitCode = 1;
    }
  }
}
