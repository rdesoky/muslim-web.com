window.onload = function () {
  MemApp.init();
};

var MemApp = {
  totalChars: 0,

  score: 0,

  suraNum: 1,

  pageParams: "",

  userID: 0,

  init: function () {
    this.pageParams = window.location.href.split("?")[1] || "";

    InstallSpin(_E("AyaNumber"), 1, 7);

    ForceArabicKeys(_E("idAnswer"));

    this.loadQuranXML();

    Mp3Player.init("flashContent");

    MemAppUI.populateChapters();

    _E("idSelectSura").value = getCookie("src", "0");

    MemAppUI.changeSource();

    _E("AyaNumber").value = getCookie("aya", "1");

    _E("idSelectLevel").value = getCookie("mem_level", "0");

    _E("Preview").checked = getCookie("pview", "1") == "1" ? true : false;

    _E("idAction").focus();

    this.loadSettings();
  },

  loadSettings: function () {
    LoadJSON(
      "get_user_info.php?" + MemApp.pageParams,

      function (jsr) {
        if (Defined(jsr) && jsr.success) {
          DU.show("idScoreBoard");

          MemApp.userID = jsr.user_id;

          _E("idSelectLevel").value = Defined(jsr.info.lvl)
            ? jsr.info.lvl
            : "0";

          MemApp.score = Defined(jsr.info.score) ? jsr.info.score : "0";

          MemApp.totalChars = Defined(jsr.info.total) ? jsr.info.total : "0";

          ScoreUI.show();
        }
      },

      "jsr"
    );
  },

  saveSettings: function (params) {
    if (MemApp.userID) {
      LoadJSON(
        "save_user_info.php?user_id=" +
          MemApp.userID +
          "&" +
          params +
          "&" +
          MemApp.pageParams
      );
    }
  },

  loadQuranXML: function () {
    if (this.quranXML) {
      return;
    }

    var xmlLoader = GetXMLHTTPControl();

    xmlLoader.onreadystatechange = function () {
      if (xmlLoader.readyState == 4) {
        MemApp.quranXML = xmlLoader.responseXML;
      }
    };

    xmlLoader.open("GET", "quran.xml", true);

    xmlLoader.send(null);
  },
};

var OC = {
  nextAya: function (e) {
    MemAppUI.incrementAya(
      int(MemApp.ayaInfo.sura) + 1,
      int(MemApp.ayaInfo.aya) + 1
    );

    MemExercise.start();
  },

  action: function (e) {
    MemExercise.start();
  },

  random: function (e) {
    _E("idSelectSura").value = 0;

    this.changeSource();

    MemExercise.start(true);
  },

  scoreX: function (e) {
    // reset score

    if (confirm(str_table["confirm_reset"])) {
      MemApp.totalChars = MemApp.score = 0;

      ScoreUI.show();

      MemApp.saveSettings("reset=1");
    }
  },

  ok: function (e) {
    MemExercise.check();
  },

  cancel: function (e) {
    MemExercise.cancel();

    Mp3Player.stop();

    _E("RetryBtn").focus();
  },

  quickStart: function (e) {
    MemExercise.countDown(0);

    Mp3Player.hide(true);
  },

  retry: function (e) {
    MemExercise.previewAya();
  },

  changeSource: function (e) {
    writeCookie("src", _E("idSelectSura").value);

    MemExercise.cancel();

    MemAppUI.changeSource();
  },

  changeLevel: function (e) {
    var lvl = _E("idSelectLevel").value;

    MemApp.saveSettings("mem_level=" + escape(lvl));

    writeCookie("mem_level", lvl);
  },

  changePage: function (e) {
    var ayaNum = int(_E("PageList").value);

    if (ayaNum > 0) {
      _E("AyaNumber").value = ayaNum;

      _E("PageList").value = 0;

      _E("idAction").focus();
    }

    writeCookie("aya", ayaNum);
  },

  checkPreview: function (e) {
    writeCookie("pview", _E("Preview").checked ? "1" : "0");
  },
};

var AppState = {
  memorize: function () {
    DU.hide("AnswerButtons,Retry,idAnswer,KeyboardView,InfoFrame,BtnNextAya");

    DU.show("idAyaDisplay,idAyaHeader");

    Mp3Player.show();
  },

  exercise: function () {
    DU.hide("idAnswer,AnswerButtons,Retry,KeyboardView,BtnNextAya");

    DU.show("idAyaDisplay,idAyaHeader");

    Mp3Player.hide();
  },

  answer: function () {
    DU.hide("InfoFrame,idAyaDisplay,QuickStart,BtnNextAya");

    DU.show("idAnswer,AnswerButtons");

    Mp3Player.hide();

    if (!MemApp.ayaInfo.number) {
      DU.show("KeyboardView");
    }

    _E("idAnswer").focus();
  },

  answerDone: function () {
    DU.hide("QuickStart,idAnswer,AnswerButtons,KeyboardView,BtnNextAya");

    DU.show("idAyaDisplay,idAyaHeader");

    Mp3Player.show();

    if (MemApp.ayaInfo) {
      DU.show("Retry");
    } else {
      DU.hide("Retry");
    }
  },

  success: function () {
    MemApp.score += MemApp.ayaInfo.text.length;

    MemApp.totalChars += MemApp.ayaInfo.text.length;

    if (int(_E("idSelectSura").value) == 0) {
      // random mode

      DU.show("BtnNextAya");
    }

    _E("idAyaDisplay").style.background = "#DADFC6";

    SetHTML(
      "ActionTitle",
      "<span style='color:green'>" + str_table["correct_answer"] + "</span>"
    );

    SetHTML("idAyaDisplay", MemApp.ayaInfo.text);

    ScoreUI.update(MemApp.ayaInfo.text.length, MemApp.ayaInfo.text.length);

    switch (int(_E("idSelectSura").value)) {
      case -1:
        break;

      case 0:
        break;

      default:
        MemAppUI.incrementAya(
          int(_E("idSelectSura").value),
          int(_E("AyaNumber").value)
        );
    }
  },

  failed: function (errorOffset) {
    var failed_count =
      MemApp.ayaInfo.text.length > 20 ? 20 : MemApp.ayaInfo.text.length;

    MemApp.totalChars += failed_count;

    _E("idAyaDisplay").style.background = "#FFE1E7";

    SetHTML(
      "ActionTitle",
      "<span style='color:red'>" + str_table["wrong_answer"] + "</span>"
    );

    SetHTML(
      "idAyaDisplay",

      "<table><tr><td class='sub_title'>" +
        str_table["source_text"] +
        ":</td><td>" +
        "<span style='color:green'>" +
        MemApp.ayaInfo.text.substr(0, errorOffset) +
        "<span style='background:yellow'>" +
        MemApp.ayaInfo.text.substr(errorOffset) +
        "</span>" +
        "</span>" +
        "</td></tr>" +
        "<tr><td class='sub_title'>" +
        str_table["written_text"] +
        ":</td><td>" +
        "<span style='color:maroon'>" +
        _E("idAnswer").value +
        "</span>" +
        "</td></tr></table>"
    );

    ScoreUI.update(failed_count, 0);

    _E("RetryBtn").focus();
  },
};

var MemExercise = {
  counter: 0,

  countInterval: 0,

  start: function (bRandom) {
    //_E("idAction").value = str_table["new_aya"];

    var suraNum = bRandom ? 0 : int(_E("idSelectSura").value);

    var n = MemAppUI.getLevel();

    var cgiQuery, xmlQuery;

    switch (suraNum) {
      case -1:
        return this.number();

      case 0:
        {
          var levels = {
            0: { min: 20, max: 25 },

            1: { min: 25, max: 45 },

            2: { min: 45, max: 75 },

            3: { min: 75, max: 125 },

            4: { min: 125, max: 200 },
          };

          var min = levels[n].min;

          var max = levels[n].max;

          var t = new Date().getTime();

          cgiQuery = t + "&min=" + min.toString() + "&max=" + max.toString();

          xmlQuery =
            "//aya[@len>" +
            min.toString() +
            " and @len<" +
            max.toString() +
            "]";
        }

        break;

      default: {
        var ayaNum = int(_E("AyaNumber").value);

        cgiQuery = "&s=" + suraNum + "&a=" + ayaNum;

        xmlQuery =
          "//aya[@s=" +
          (suraNum - 1).toString() +
          " and @a=" +
          (ayaNum - 1).toString() +
          "]";

        writeCookie("aya", ayaNum);
      }
    }

    if (!MemApp.quranXML) {
      AppState.exercise();

      SetHTML(
        "idAyaDisplay",
        "<span style='color:gray'>" + str_table["loading_aya"] + "...</span>"
      );

      var self = this;

      LoadJSON(
        gCgiLocation + "/get_aya_utf8.js.pl?" + cgiQuery,

        function (response) {
          self.onVerseLoaded(response);
        }
      );

      return;
    }

    var arrAyat, count, ndx, aya, aya_text;

    try {
      arrAyat = MemApp.quranXML.selectNodes(xmlQuery);

      count = arrAyat.length;

      ndx = Math.floor(count * Math.random());

      aya = arrAyat.item(ndx);

      aya_text = aya.getElementsByTagName("t")[0].text;
    } catch (e) {
      arrAyat = MemApp.quranXML.evaluate(
        xmlQuery,
        MemApp.quranXML,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      count = arrAyat.snapshotLength;

      ndx = Math.floor(count * Math.random());

      aya = arrAyat.snapshotItem(ndx);

      var text_node = aya.getElementsByTagName("t")[0];

      aya_text = text_node.textContent;
    }

    MemApp.ayaInfo = {
      success: 1,

      sura: int(aya.getAttribute("s")),

      aya: int(aya.getAttribute("a")),

      text: aya_text,

      plain: MakePlainText(aya_text),
    };

    this.onVerseLoaded();
  },

  onVerseLoaded: function (data) {
    if (data) {
      MemApp.ayaInfo = data;
    }

    if (!MemApp.ayaInfo.success) {
      DU.show("idAyaDisplay");

      SetHTML(
        "idAyaDisplay",
        "<font color='red'>Database is not available</font>"
      );

      _E("idAction").focus();

      return;
    }

    Mp3Player.setAya(int(MemApp.ayaInfo.sura) + 1, int(MemApp.ayaInfo.aya) + 1);

    DU.show("AyaActions");

    MemExercise.previewAya();
  },

  cancel: function () {
    MemExercise.counter = 0;

    if (this.countInterval) {
      window.clearInterval(this.countInterval);

      this.countInterval = 0;
    }

    AppState.answerDone();

    SetHTML("ActionTitle", "");

    if (MemApp.ayaInfo && MemApp.ayaInfo.text) {
      SetHTML("idAyaDisplay", MemApp.ayaInfo.text);
    }
  },

  answer: function () {
    _E("idAnswer").value = "";

    AppState.answer();

    SetHTML("ActionTitle", str_table["write_aya"]);
  },

  number: function () {
    SetHTML("idAyaHeader", "&nbsp;");

    AppState.memorize();

    _E("idAyaDisplay").style.background = "";

    MemApp.ayaInfo = { success: 1, text: "", plain: "", number: true };

    var length = (MemAppUI.getLevel() + 1) * 3 + 1;

    for (var i = 0; i < length; i++) {
      var digit = Math.round(Math.random() * 9);

      MemApp.ayaInfo.text +=
        (MemApp.ayaInfo.plain.length > 0 &&
        MemApp.ayaInfo.plain.length < length - 3 &&
        MemApp.ayaInfo.plain.length % 3 == 0
          ? "-"
          : "") + digit;

      MemApp.ayaInfo.plain += digit;
    }

    MemExercise.previewAya();
  },

  previewAya: function () {
    //show aya and countdown

    if (MemApp.ayaInfo.success) {
      SetHTML(
        "idAyaHeader",
        MemAppUI.formatAyaInfo(MemApp.ayaInfo.sura, MemApp.ayaInfo.aya)
      );

      AppState.memorize();

      _E("idAyaDisplay").style.background = "";

      SetHTML(
        "idAyaDisplay",
        "<span style='color:blue'>" + MemApp.ayaInfo.text + "</span>"
      );

      //_E("idAction").value = str_table['new_aya'];

      StopInterval("countInterval", this);

      if (int(_E("idSelectSura").value) > 0 && _E("Preview").checked == false) {
        MemExercise.answer();
      } else {
        Mp3Player.play();

        var reviewTime = Math.round(
          MemApp.ayaInfo.number
            ? MemApp.ayaInfo.plain.length
            : (1.4 * MemApp.ayaInfo.plain.length) / 4
        );

        if (reviewTime < 3) {
          reviewTime = 3;
        }

        this.countDown(reviewTime);

        this.countInterval = window.setInterval(
          function () {
            MemExercise.countDown();
          },

          1000
        );
      }
    }
  },

  countDown: function (count_down) {
    if (Defined(count_down)) {
      // initial call

      this.counter = count_down;

      if (count_down != 0) {
        DU.show("QuickStart");

        SetHTML(
          "ActionTitle",

          "<table><tr>" +
            "<td NOWRAP>" +
            str_table["remaining_time"] +
            ":</td>" +
            "<td class='counter' id='CounterView'>" +
            this.counter +
            "</td>" +
            "</tr></table>"
        );

        _E("QuickStartBtn").focus();
      }
    }

    if (0 == this.counter) {
      // terminating call

      StopInterval("countInterval", this);

      this.answer();
    } else {
      this.counter--;

      SetHTML("CounterView", this.counter.toString());
    }
  },

  check: function () {
    SetHTML("ActionTitle", "");

    AppState.answerDone();

    _E("idAction").focus();

    var errorOffset = compairText(MemApp.ayaInfo.text, _E("idAnswer").value);

    if (errorOffset == -1) {
      AppState.success();
    } else {
      AppState.failed(errorOffset);
    }
  },
};

var MemAppUI = {
  getLevel: function () {
    return int(_E("idSelectLevel").value);
  },

  formatAyaInfo: function (nSura, nAya) {
    if (Defined(nSura)) {
      return (
        "<span>" +
        str_table["aya"] +
        ":" +
        (int(nAya) + 1) +
        " - " +
        str_table["sura"] +
        " " +
        gSuraNames[int(nSura) + 1] +
        "</span>"
      );
    }

    return "&nbsp;";
  },

  populatePages: function (suraNum) {
    _E("PageList").options.length =
      1 + QData.sura_info[suraNum - 1].ep - QData.sura_info[suraNum - 1].sp + 1;

    var firstPage = QData.sura_info[suraNum - 1].sp;

    var newOption = _E("PageList").options[1];

    newOption.value = 1;

    newOption.text = str_table["page"] + " " + firstPage;

    var ayaList = "0";

    for (
      var pageNum = firstPage + 1, ndx = 2;
      pageNum <= QData.sura_info[suraNum - 1].ep;
      pageNum++, ndx++
    ) {
      newOption = _E("PageList").options[ndx];

      newOption.value = QData.pagesInfo[pageNum - 1].a;

      newOption.text = str_table["page"] + " " + pageNum;

      ayaList += "," + (QData.pagesInfo[pageNum - 1].a - 1).toString();
    }

    var self = this;

    LoadJSON(
      gCgiLocation +
        "/get_aya_list_utf8.js.pl?s=" +
        (suraNum - 1) +
        "&a=" +
        ayaList,

      function (response) {
        self.onLoadAyaList(response);
      }
    );
  },

  onLoadAyaList: function (response) {
    var jsr = eval(response);

    if (jsr.success) {
      for (var i = 1; i < _E("PageList").options.length; i++) {
        var nAya = int(_E("PageList").options[i].value) - 1;

        if (jsr.aya_list[nAya] != undefined) {
          _E("PageList").options[i].text +=
            ": " +
            jsr.aya_list[nAya].substr(0, 14) +
            (jsr.aya_list[nAya].length > 12 ? "..." : "");
        }
      }
    }
  },

  changeSource: function () {
    var suraNum = (MemApp.suraNum = int(_E("idSelectSura").value));

    _E("idAction").value = str_table.start;

    switch (suraNum) {
      case -1: // numbers
        _E("TrainingViewer").style.direction = "LTR";

        DU.show("idByLevel");

        DU.hide("AyaNumberOption");

        SetHTML("idAyaHeader", "&nbsp;");

        SetHTML("idAyaDisplay", "&nbsp;");

        Mp3Player.setAya(0, 0);

        Mp3Player.hide(true);

        DU.hide("BtnRandom");

        break;

      case 0: // random verse
        _E("TrainingViewer").style.direction = "RTL";

        DU.show("idByLevel");

        DU.hide("AyaNumberOption");

        DU.hide("BtnRandom");

        _E("idAction").value = str_table.new_aya;

        break;

      default:
        _E("idAction").value = str_table["start"];

        DU.show("BtnRandom");

        _E("TrainingViewer").style.direction = "RTL";

        DU.hide("idByLevel");

        DU.show("AyaNumberOption");

        _E("AyaNumber").value = "1";

        _E("AyaNumber").setAttribute("max", VerseNoInSura[suraNum]);

        MemAppUI.populatePages(suraNum);
    }
  },

  showAyaInfo: function (sURL) {
    var sURL =
      sURL +
      (int(MemApp.ayaInfo.sura) + 1).toStringEx(3) +
      (int(MemApp.ayaInfo.aya) + 1).toStringEx(3) +
      ".html";

    DU.show("InfoFrame");

    SetHTML(
      "InfoFrame",
      "<iframe frameborder='0' width='100%' height=160 src='" +
        sURL +
        "'></iframe>"
    );

    MemExercise.cancel();
  },

  explainAya: function () {
    this.showAyaInfo("/cgi-bin/get_taf2.pl?/tafseer/KATHEER/");
  },

  translateAya: function () {
    this.showAyaInfo("http://www.reciter.org/ENGLISH/");
  },

  populateChapters: function () {
    _E("idSelectSura").options.length = 116;

    var sura, ndx;

    for (sura = 1, ndx = 2; sura < 115; sura++, ndx++) {
      var option = _E("idSelectSura").options[ndx];

      option.text =
        sura.toString() + "-" + str_table["sura"] + " " + gSuraNames[sura];

      option.value = sura;

      option.selected = sura == MemApp.suraNum;
    }
  },

  incrementAya: function (currSuraNum, currAyaNum) {
    if (currAyaNum < VerseNoInSura[currSuraNum]) {
      currAyaNum++;
    } else {
      if (currSuraNum < 114) {
        currSuraNum++;

        currAyaNum = 1;
      }
    }

    if (int(_E("idSelectSura").value) != currSuraNum) {
      _E("idSelectSura").value = currSuraNum;

      MemAppUI.changeSource();
    }

    _E("AyaNumber").value = currAyaNum;

    writeCookie("aya", currAyaNum);
  },
};

var ScoreUI = {
  show: function () {
    if (MemApp.totalChars) {
      SetHTML(
        "idPercent",
        Math.round((MemApp.score * 10000) / MemApp.totalChars) / 100
      );
    } else {
      SetHTML("idPercent", "0");
    }
  },

  update: function (total, memorized) {
    total = Defined(total) ? total : MemApp.totalChars;

    memorized = Defined(memorized) ? memorized : MemApp.score;

    ScoreUI.show();

    MemApp.saveSettings("total_words=" + total + "&mem_words=" + memorized);
  },
};
