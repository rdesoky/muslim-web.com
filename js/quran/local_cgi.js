// local_cgi.js — replaces the Perl/CGI backend with in-browser code.
//
// The original site queried MySQL through /cgi-bin/*.pl scripts. This shim
// intercepts the app's data-loading helpers (LoadData / LoadJSON /
// ScriptLoader.loadJScript / openReciter) and serves the same response
// payloads from bundled static data and localStorage:
//
//   search.pl             -> substring search over QuranTextData (qtext_data.js)
//   get_aya_utf8.js.pl   -> random / by-position aya {text,plain}
//   get_aya_list_utf8.js.pl -> plain aya list for a PageList
//   get_sura_text.pl     -> range text/copy
//   login.pl / newuser.pl / loadmem.pl / savemem.pl -> disabled (migrating to Firebase)
//   counter.js.pl        -> ignored
//   js_get_html.pl?/qtext/sura_NNN.html -> served directly from static qtext pages
//   recite.pl (RealAudio era) -> replaced with modern mp3 range playback
//
// Ordering: this file must be loaded AFTER the scripts that define LoadData
// (lib.js) / LoadJSON (utils.js) / ScriptLoader / openReciter (qlib.js) and
// QData, so it is listed LAST in each page's loadScripts package.

(function () {
  var m = /(?:^|\?|&)lang=(ar|en)/.exec(window.location.search);
  var gLangCookie = null;
  var cookieList = document.cookie.split(";");
  for (var ci = 0; ci < cookieList.length; ci++) {
    var bit = cookieList[ci].split("=");
    if (bit[0].trim() == "lang") gLangCookie = bit[1].trim();
  }
  var LANG = m ? m[1].toLowerCase() : gLangCookie === "en" ? "en" : "ar";

  // -------------------------------------------------------------------------
  // data access
  // -------------------------------------------------------------------------
  function quranSura(sura1) {
    return window.QuranTextData && QuranTextData[sura1];
  }
  function quranAya(sura1, aya1) {
    var s = quranSura(sura1);
    return s && s[aya1];
  }

  // -------------------------------------------------------------------------
  // Arabic normalisation (mirrors update_stext.pl ReplaceAmbChars + toPlain)
  // -------------------------------------------------------------------------
  function normArabic(s) {
    return (s || "")
      .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // tashkeel/tatweel
      .replace(/[^\u0621-\u063A\u0641-\u064A ]/g, " ")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/[ئؤ]/g, "ء")
      .replace(/ى/g, "ي")
      .replace(/\s+/g, " ")
      .trim();
  }
  function cp1256ToUnicode(text) {
    if (typeof ConvertCP1256ToUnicode == "function") {
      return ConvertCP1256ToUnicode(text);
    }
    // fallback: assume already unicode
    return text;
  }

  // -------------------------------------------------------------------------
  // XML helpers (same shape as qutils::XMLout)
  // -------------------------------------------------------------------------
  function xmlEscape(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function xmlout(obj, tagName, contents) {
    tagName = tagName || "option";
    var attrs = "";
    for (var k in obj) {
      if (obj[k] == null || obj[k] === undefined) continue;
      attrs += " " + k + '="' + xmlEscape(obj[k]) + '"';
    }
    return contents && contents.length
      ? "<" + tagName + attrs + ">\n" + contents + "</" + tagName + ">\n"
      : "<" + tagName + attrs + "/>\n";
  }

  // -------------------------------------------------------------------------
  // members endpoints — disabled. Login/logout moves to Firebase; these are
  // only stubbed so the UI degrades gracefully instead of 404ing.
  // -------------------------------------------------------------------------
  function memberDisabled(name) {
    return xmlout({
      success: 0,
      error:
        (name || "member") +
        " is not available in the local build (migrating to Firebase)",
    });
  }

  // -------------------------------------------------------------------------
  // search.pl
  // -------------------------------------------------------------------------
  function localSearch(params) {
    // the search term arrives percent-encoded as CP1256 bytes
    var termBytes = params["s"] ? unescape(params["s"]) : "";
    var term = cp1256ToUnicode(termBytes);
    var normTerm = normArabic(term);
    var page = parseInt(params["p"] || "0", 10) || 0;
    var pageSize = parseInt(params["ps"] || "10", 10) || 10;
    var start = page * pageSize;

    var matches = [];
    if (normTerm.length) {
      for (var sura1 in window.QuranTextData) {
        var sObj = QuranTextData[sura1];
        for (var aya1 in sObj) {
          var rec = sObj[aya1];
          if (rec.p && rec.p.indexOf(normTerm) >= 0) {
            matches.push({ sura_num: parseInt(sura1, 10) - 1, aya_num: parseInt(aya1, 10) - 1, aya_plain_text: rec.p });
          }
        }
      }
    }

    var total = matches.length;
    var pageMatches = matches.slice(start, start + pageSize);
    var results = "";
    for (var i = 0; i < pageMatches.length; i++) {
      results +=
        xmlout(
          {
            id: pageMatches[i].sura_num + ":" + pageMatches[i].aya_num,
            sura_num: pageMatches[i].sura_num,
            aya_num: pageMatches[i].aya_num,
            aya_plain_text: pageMatches[i].aya_plain_text,
            page: "",
          },
          "aya"
        );
    }

    return (
      '<?xml version="1.0" encoding="windows-1256" ?>\n' +
      xmlout(
        {
          success: 1,
          total: total,
          search_for: normTerm,
          search_text: term,
          start: start,
          page_size: pageSize,
          page: page,
          count: pageMatches.length,
        },
        "search_results",
        results
      )
    );
  }

  // -------------------------------------------------------------------------
  // get_sura_text.pl
  // -------------------------------------------------------------------------
  function localSuraText(params) {
    var sura0 = parseInt(params["s"] || "0", 10) || 0;
    var fromAya = parseInt(params["f"] || "1", 10) - 1;
    var toAya = parseInt(params["t"] || "5", 10) - 1;
    var usePlain = parseInt(params["p"] || "0", 10) == 1;
    var sObj = quranSura(sura0 + 1);
    if (!sObj) return "could not connect to database,";

    var out = "";
    for (var ayaNum = fromAya; ayaNum <= toAya; ayaNum++) {
      var rec = sObj[ayaNum + 1];
      if (!rec) continue;
      out += (usePlain ? rec.p || rec.t : rec.t || rec.p) + " (" + (ayaNum + 1) + ") ";
    }
    return out;
  }

  // -------------------------------------------------------------------------
  // get_aya_utf8.js.pl
  // -------------------------------------------------------------------------
  function localGetAya(params) {
    var sura1 = parseInt(params["s"] || "0", 10);
    var aya1 = parseInt(params["a"] || "0", 10);

    var sura, aya, text, plain;

    if (sura1 && aya1) {
      // specific aya
      if (quranAya(sura1, aya1)) {
        sura = sura1;
        aya = aya1;
        text = quranAya(sura1, aya1).t;
        plain = quranAya(sura1, aya1).p;
      }
    } else if (sura1) {
      // random aya or range within one sura
      var sObj = quranSura(sura1);
      if (sObj) {
        var recs = [];
        for (var k in sObj) {
          if (sObj[k].t) recs.push(parseInt(k, 10));
        }
        aya = recs[Math.floor(Math.random() * recs.length)];
        sura = sura1;
        text = sObj[aya] ? sObj[aya].t : "";
        plain = sObj[aya] ? sObj[aya].p : "";
      }
    } else {
      // random across the whole Quran by plain-length window (min/max)
      var min = parseInt(params["min"] || "20", 10);
      var max = parseInt(params["max"] || "25", 10);
      var pool = [];
      for (var s in window.QuranTextData) {
        var so = QuranTextData[s];
        for (var a in so) {
          if (!so[a].t) continue;
          var len = (so[a].p || "").length;
          if (len >= min && len < max) pool.push([parseInt(s, 10), parseInt(a, 10)]);
        }
      }
      if (pool.length) {
        var pick = pool[Math.floor(Math.random() * pool.length)];
        sura = pick[0];
        aya = pick[1];
        text = quranAya(sura, aya).t;
        plain = quranAya(sura, aya).p;
      }
    }

    if (!text) {
      window.re = { success: 0, err_msg: "aya not found" };
      return window.re;
    }

    window.re = {
      success: 1,
      sura: sura - 1, // 0-based, matches the old CGI
      aya: aya - 1, // 0-based, matches the old CGI
      text: text,
      plain: plain,
    };
    return window.re;
  }

  // -------------------------------------------------------------------------
  // get_aya_list_utf8.js.pl
  // -------------------------------------------------------------------------
  function localGetAyaList(params) {
    var sura0 = parseInt(params["s"] || "0", 10);
    var ayaList = params["a"] ? String(params["a"]).split(",") : [];
    var suraObj = quranSura(sura0 + 1);
    var list = {};
    for (var i = 0; i < ayaList.length; i++) {
      var aya0 = parseInt(ayaList[i], 10);
      var rec = suraObj && suraObj[aya0 + 1];
      if (rec && rec.p !== undefined) {
        list[aya0] = rec.p;
      }
    }
    window.re = { success: 1, sura: sura0, aya_list: list };
    return window.re;
  }

  // -------------------------------------------------------------------------
  // LoadData override
  // -------------------------------------------------------------------------
  var origLoadData = window.LoadData;

  function routeLoadData(sURL, callbackStr, forceUTF) {
    if (typeof sURL != "string") return origLoadData ? origLoadData(sURL, callbackStr, forceUTF) : undefined;

    var params = {};
    var q = sURL.split("?")[1] || "";
    q.split("&").forEach(function (p) {
      if (!p) return;
      var kv = p.split("=");
      params[kv[0]] = kv.length > 1 ? kv.slice(1).join("=") : "";
    });

    var payload = undefined;

    if (/search\.pl/.test(sURL)) {
      payload = localSearch(params);
    } else if (/get_sura_text\.pl/.test(sURL)) {
      payload = localSuraText(params);
    } else if (/loadmem\.pl|savemem\.pl|login\.pl|newuser\.pl/.test(sURL)) {
      // ignored: member features are migrating to Firebase
      payload = memberDisabled("member");
    }

    if (payload !== undefined) {
      window.gDataResponse = payload;
      if (callbackStr) {
        window.setTimeout(function () {
          try {
            eval(callbackStr);
          } catch (e) {}
        }, 1);
      }
      return;
    }
    if (origLoadData) origLoadData(sURL, callbackStr, forceUTF);
  }

  // -------------------------------------------------------------------------
  // LoadJSON override
  // -------------------------------------------------------------------------
  var origLoadJSON = window.LoadJSON;

  function routeLoadJSON(sURL, callback, dataKey) {
    if (typeof sURL != "string") return origLoadJSON ? origLoadJSON(sURL, callback, dataKey) : undefined;

    var params = {};
    var q = sURL.split("?")[1] || "";
    q.split("&").forEach(function (p) {
      if (!p) return;
      var kv = p.split("=");
      params[kv[0]] = kv.length > 1 ? kv.slice(1).join("=") : "";
    });

    var re = undefined;

    if (/get_aya_utf8\.js\.pl/.test(sURL)) {
      re = localGetAya(params);
    } else if (/get_aya_list_utf8\.js\.pl/.test(sURL)) {
      re = localGetAyaList(params);
    }

    if (re === undefined) {
      return origLoadJSON ? origLoadJSON(sURL, callback, dataKey) : undefined;
    }

    window.setTimeout(function () {
      if (callback) {
        var data = dataKey ? window[dataKey] : re;
        callback(data);
      }
    }, 1);
    return;
  }

  // -------------------------------------------------------------------------
  // ScriptLoader.loadJScript override — qtext sura pages are now static files
  // -------------------------------------------------------------------------
  var origLoadJScript = ScriptLoader.loadJScript.bind(ScriptLoader);

  ScriptLoader.loadJScript = function (scriptName, onFinish, sExpression) {
    if (typeof scriptName == "string" && /\/qtext\/sura_\d+\.html$/.test(scriptName)) {
      U.httpGet(scriptName, function (t) {
        var m = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(t);
        window.gResponseHTML = m ? m[1] : t;
        if (onFinish) window.setTimeout(onFinish, 1);
      });
      return ScriptLoader.PENDING;
    }
    return origLoadJScript(scriptName, onFinish, sExpression);
  };

  // -------------------------------------------------------------------------
  // openReciter override — recite.pl returned a RealAudio playlist (obsolete).
  // Play the aya range with the modern mp3 player instead.
  // -------------------------------------------------------------------------
  var origOpenReciter = window.openReciter;
  window.openReciter = function (url, suraNum, reciter_id, pageNum) {
    var m = /[?&]s=(\d+)[\s\S]*?[?&]f=(\d+)[\s\S]*?[?&]t=(\d+)/.exec(String(url));
    if (!m) {
      if (origOpenReciter) origOpenReciter(url, suraNum, reciter_id, pageNum);
      return;
    }
    var s = parseInt(m[1], 10);
    var f = parseInt(m[2], 10);
    var t = parseInt(m[3], 10);
    if (window.AudioPlayer && AudioPlayer.obj) {
      AudioPlayer.playRange(1, { sura: s, aya: f }, { sura: s, aya: t });
    } else if (origOpenReciter) {
      origOpenReciter(url, suraNum, reciter_id, pageNum);
    }
  };

  // -------------------------------------------------------------------------
  // install
  // -------------------------------------------------------------------------
  window.LoadData = routeLoadData;
  window.LoadJSON = routeLoadJSON;

  // expose helpers (useful for debugging)
  window.LocalCGI = {
    lang: LANG,
    search: localSearch,
    getAya: localGetAya,
    getAyaList: localGetAyaList,
    getSuraText: localSuraText,
  };
})();