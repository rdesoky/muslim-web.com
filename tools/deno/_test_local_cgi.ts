// Headless smoke test for local_cgi.js endpoints using the generated data.
import { readFileSync } from "node:fs";

const tick = () => new Promise((r) => setTimeout(r, 4));

global.window = global;
global.location = { search: "" };
global.document = {
  cookie: "",
  getElementsByTagName: () => [{ appendChild() {}, insertBefore() {} }],
  createElement: () => ({}),
};
global.unescape = (s) => {
  // replicate the legacy browser unescape (%XX and %uXXXX)
  return s.replace(/%u([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/%([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
};

// load the data file
const dataSrc = readFileSync("js/quran/qtext_data.js", "utf8");
(0, eval)(dataSrc);

global.ScriptLoader = { loadJScript() {}, PENDING: 0 };
global.LoadData = function () { throw new Error("orig LoadData should not be called"); };
global.LoadJSON = function () { throw new Error("orig LoadJSON should not be called"); };
global.U = { httpGet() {} };
global.ConvertCP1256ToUnicode = (s) => s;
global.AudioPlayer = undefined;
global.openReciter = undefined;

const shimSrc = readFileSync("js/quran/local_cgi.js", "utf8");
(0, eval)(shimSrc);

let pass = 0, fail = 0;
function eq(name, actual, expect) {
  const ok = JSON.stringify(actual) === JSON.stringify(expect);
  if (ok) { pass++; console.log("PASS", name); }
  else { fail++; console.log("FAIL", name, "-> got", JSON.stringify(actual), "expected", JSON.stringify(expect)); }
}

async function loadJSON(url) {
  return new Promise((resolve) => {
    LoadJSON(url, (data) => resolve(data));
  });
}
async function loadData(url) {
  return new Promise((resolve) => {
    LoadData(url, "window.__got=gDataResponse; resolveCB(); " + "", true);
    window.resolveCB = () => resolve(window.__got);
  });
}

await (async () => {
  // 1. get_aya specific
  {
    const re = await loadJSON("/cgi-bin/get_aya_utf8.js.pl?s=1&a=1");
    await tick();
    eq("get_aya specific sura", re.sura, 0);
    eq("get_aya specific aya", re.aya, 0);
    eq("get_aya text truthy", !!re.text, true);
    eq("get_aya plain", String(re.plain).length > 5, true);
  }

  // 2. get_aya random in sura
  {
    const re = await loadJSON("/cgi-bin/get_aya_utf8.js.pl?s=2&a=0");
    await tick();
    eq("get_aya random sura2", re.sura, 1);
    eq("get_aya random aya in-range", re.aya >= 0 && re.aya < 286, true);
  }

  // 3. get_aya_list
  {
    const re = await loadJSON("/cgi-bin/get_aya_list_utf8.js.pl?s=0&a=0,1,2");
    await tick();
    eq("get_aya_list success", re.success, 1);
    eq("get_aya_list has 3", Object.keys(re.aya_list).length, 3);
  }

  // 4. search (LoadData)
  {
    window.__got = "";
    window.resolveCB = null;
    await loadData("/cgi-bin/search.pl?s=" + escape("بسم الله") + "&ps=5&p=0");
    await tick();
    const xml = window.__got;
    eq("search returns xml", /<search_results/.test(xml), true);
    eq("search total>0", /total="[1-9]/.test(xml), true);
    eq("search has aya child", xml.indexOf("<aya ") > 0, true);
  }

  // 5. get_sura_text range
  {
    window.__got = "";
    await loadData("/cgi-bin/get_sura_text.pl?s=0&f=1&t=2&p=1");
    await tick();
    eq("sura text has aya1 marker", /\(1\)/.test(window.__got), true);
    eq("sura text has aya2 marker", /\(2\)/.test(window.__got), true);
  }

  // 6. login/newuser disabled
  {
    window.__got = "";
    await loadData("/cgi-bin/login.pl?user=x&password=y");
    await tick();
    eq("login disabled success=0", /success="0"/.test(window.__got), true);
  }

  // 7. quran data sanity
  eq("QuranTextData has 114 suras", Object.keys(QuranTextData).length, 114);
  eq("sura 2 has 286 ayat", Object.keys(QuranTextData[2]).length, 286);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();