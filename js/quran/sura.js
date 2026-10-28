DefineVars({
  gRangeReciter: "/cgi-bin/recite.pl",
  gStartSelection: -1,
  gEndSelection: -1,
});

var gRevMode = false,
  gRevStart = 0,
  gFirstRevAlert = true;
var gFirstPage, gLastPage, gSuraNo;
var gAya, gAyaKeys, gAyaMBtns, gPageBtns, gMenu;
var gViewRoot;

function initSura(eRoot) {
  if (eRoot == undefined) {
    eRoot = document.body;
  }

  gViewRoot = eRoot;

  gSuraNo = parseInt(U.param("s", "1"), 10);
  gAya = getElementsByAttribute(eRoot, "aya");
  gAyaKeys = getElementsByAttribute(eRoot, "akey");
  gPageBtns = getElementsByAttribute(eRoot, "pageNo");

  var menu = (gMenu = createMenu(GetSuraMenu(), "MainMenu"));

  for (var i = 0, len = gAya.length; i < len; i++) {
    gAya[i].onclick = onAyaClick;
    gAya[i].oncontextmenu = function (e) {
      var event = U.ieEvent(e);
      if (event.srcElement.nodeName == "IMG") {
        return;
      }
      event.preventDefault();
      stopTimer("hDetach", menu);
      menu.attach(this, "mouse", {
        x: event.clientX,
        y: event.clientY,
      });
    };

    gAya[i].onmouseout = function (e) {
      var event = U.ieEvent(e);
      if (!IsChildOf(event.toElement, this)) {
        //menu.detach();
      }
    };

    gAya[i].onmousemove = function (e) {
      var event = U.ieEvent(e);
      U.viewMouseValues(event);
    };
  }

  for (var i = 0, len = gAyaKeys.length; i < len; i++) {
    gAyaKeys[i].onclick = function (e) {
      Tafseer.show(this.getAttribute("akey"));
    };
  }

  for (var i = 0, len = gPageBtns.length; i < len; i++) {
    with (gPageBtns[i]) {
      onclick = function (e) {
        var event = U.ieEvent(e);
        var pageNo = parseInt(this.getAttribute("pageNo"), 10);
        SelectPage(pageNo);
        JumpToPage(pageNo);
      };

      onmouseover = function (e) {
        QViewer.show(parseInt(this.getAttribute("pageNo"), 10));
      };

      onmouseout = function (e) {
        QViewer.hide();
      };

      previousSibling.onclick = function (e) {
        var event = U.ieEvent(e);
        var ePg = this.nextSibling;
        var pageNo = parseInt(ePg.getAttribute("pageNo"), 10);
        JumpToPage(pageNo - 1);
      };

      nextSibling.onclick = function (e) {
        var event = U.ieEvent(e);
        var ePg = this.previousSibling;
        var pageNo = parseInt(ePg.getAttribute("pageNo"), 10);
        JumpToPage(pageNo + 1);
      };
    }
  }

  gFirstPage = QData.sura_info[gSuraNo - 1].sp;
  gLastPage = QData.sura_info[gSuraNo - 1].ep;

  //document.oncontextmenu = showContextMenu;

  if (!LoadTahfeez("updateAyatColor(gSuraNo)")) {
    updateAyatColor(gSuraNo);
  }

  if (_E("BtnReview")) {
    _E("BtnReview").style.visibility = "visible";
  }

  var aya = U.param("a");
  if (aya) {
    window.setTimeout(function () {
      GotoAya(parseInt(aya, 10));
    }, 10);
  } else {
    var page = U.param("p");
    if (page) {
      window.setTimeout(function () {
        JumpToPage(parseInt(page, 10));
      }, 10);
    }
  }
}

var GetSuraMenu = function () {
  return [
    {
      label: _S.show_tafseer,
      handler: "showTafseer",
      context: IMenuHandlers,
      menuPos: "side",
      menu: [
        {
          label: _S.katheer,
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "KATHEER",
        },
        {
          label: _S.galaleen,
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "GALALEEN",
        },
        {
          label: _S.tabary,
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "TABARY",
        },
        {
          label: _S.kortoby,
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "KORTOBY",
        },
        {
          label: "English",
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "en_yusufali",
        },
        {
          label: "Français",
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "fr_hamidullah",
        },
        {
          label: "Deutsch",
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "de_bubenheim",
        },
        {
          label: "Turkish",
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "tr_ozturk",
        },
        {
          label: "Indoneisan",
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "id_muntakhab",
        },
        {
          label: "Malayu",
          handler: "showTafseer",
          context: IMenuHandlers,
          source: "ms_basmeih",
        },
      ],
      info: {},
    },
    // {	label: _S.recite_selected,
    // 	menuPos:"side",

    // 	menu:[
    // 		{
    // 			label: _S.reciters.hosaree,
    // 			handler: "reciteSelected",
    // 			info: { r:0 }
    // 		},
    // 		{
    // 			label: _S.reciters.hozefee,
    // 			handler: "reciteSelected",
    // 			info: { r:1 }
    // 		}
    // 	],
    // 	handler: "reciteSelected"
    // },
    { label: _S.copy_selected, handler: "copyText" },
    /*{	label: _S.exercise_selected",	handler:"openTrainer"	},*/
    {
      label: _S.add_to_memorized,
      menuPos: "side",
      handler: "addSelected",
      context: IMemorizer,
      menu: [
        {
          label: _S.selected_ayat,
          handler: "addSelected",
          context: IMemorizer,
        },
        {
          label: _S.from_sura_start,
          handler: "addFromStart",
          context: IMemorizer,
        },
        { label: _S.till_sura_end, handler: "addTillEnd", context: IMemorizer },
        { label: _S.whole_sura, handler: "addSura", context: IMemorizer },
      ],
    },
    {
      label: _S.delete_memorized,
      menuPos: "side",
      handler: "removeSelected",
      context: IMemorizer,
      menu: [
        {
          label: _S.selected_ayat,
          handler: "removeSelected",
          context: IMemorizer,
        },
        {
          label: _S.from_sura_start,
          handler: "removeFromStart",
          context: IMemorizer,
        },
        {
          label: _S.till_sura_end,
          handler: "removeTillEnd",
          context: IMemorizer,
        },
        { label: _S.whole_sura, handler: "removeSura", context: IMemorizer },
      ],
    },
    {
      label: _S.add_to_pending,
      menuPos: "side",
      handler: "pendingSelected",
      context: IMemorizer,
      menu: [
        {
          label: _S.selected_ayat,
          handler: "pendingSelected",
          context: IMemorizer,
        },
        {
          label: _S.from_sura_start,
          handler: "pendingFromStart",
          context: IMemorizer,
        },
        {
          label: _S.till_sura_end,
          handler: "pendingTillEnd",
          context: IMemorizer,
        },
        { label: _S.whole_sura, handler: "pendingSura", context: IMemorizer },
      ],
    },
    {
      label: _S.mem_review,
      handler: "toggleReviewMode",
      context: IMenuHandlers,
    },
    { label: _S.draw_aya, handler: "showAyaImage", context: IMenuHandlers },
  ];
};

var IMenuHandlers = {
  showAyaImage: function (menuItem) {
    showAyaImage(menuItem.getContextAya());
    _E("MainMenu").detach();
  },

  toggleReviewMode: function (menuItem) {
    var ayaNo = menuItem.getContextAya();
    _E("MainMenu").detach();
    ToggleRevMode(true, ayaNo - 1);
  },
  showTafseer: function (menuItem) {
    var ayaNo = menuItem.getContextAya();
    var data = menuItem.getData();
    Tafseer.show(ayaNo, data.source);
    gMenu.detach();
  },
};

var IMemorizer = {
  add: true,
  remove: false,
  memorized: true,
  pending: false,
  selected: 1,
  fromStart: 2,
  tillEnd: 3,
  wholeSura: 4,

  processAction: function (menuItem, add, type, range) {
    var startAya = parseInt(menuItem.getContextAya(), 10);
    var endAya = startAya;

    if (range == this.selected) {
      if (
        gStartSelection != -1 &&
        startAya > gStartSelection &&
        startAya <= gEndSelection + 1
      ) {
        startAya = gStartSelection + 1;
        endAya = gEndSelection + 1;
      }
    } else if (range == this.tillEnd) {
      endAya = QData.sura_info[gSuraNo - 1].ac;
    } else if (range == this.fromStart) {
      endAya = startAya;
      startAya = 1;
    } else if (range == this.wholeSura) {
      startAya = 1;
      endAya = QData.sura_info[gSuraNo - 1].ac;
    }

    if (add == true) {
      if (type == this.memorized) {
        memorizeRange(gSuraNo, startAya, endAya);
      } else {
        memorizePendingRange(gSuraNo, startAya, endAya);
      }
    } else {
      unMemorizeRange(gSuraNo, startAya, endAya);
    }

    UpdateAyatColorEx();
  },

  addSelected: function (menuItem) {
    this.processAction(menuItem, this.add, IMemorizer.memorized, this.selected);
  },

  addFromStart: function (menuItem) {
    this.processAction(
      menuItem,
      this.add,
      IMemorizer.memorized,
      this.fromStart
    );
  },

  addTillEnd: function (menuItem) {
    this.processAction(menuItem, this.add, IMemorizer.memorized, this.tillEnd);
  },

  addSura: function (menuItem) {
    this.processAction(
      menuItem,
      this.add,
      IMemorizer.memorized,
      this.wholeSura
    );
  },
  /////
  removeSelected: function (menuItem) {
    this.processAction(
      menuItem,
      this.remove,
      IMemorizer.memorized,
      this.selected
    );
  },

  removeFromStart: function (menuItem) {
    this.processAction(
      menuItem,
      this.remove,
      IMemorizer.memorized,
      this.fromStart
    );
  },

  removeTillEnd: function (menuItem) {
    this.processAction(
      menuItem,
      this.remove,
      IMemorizer.memorized,
      this.tillEnd
    );
  },

  removeSura: function (menuItem) {
    this.processAction(
      menuItem,
      this.remove,
      IMemorizer.memorized,
      this.wholeSura
    );
  },
  /////
  pendingSelected: function (menuItem) {
    this.processAction(menuItem, this.add, IMemorizer.pending, this.selected);
  },

  pendingFromStart: function (menuItem) {
    this.processAction(menuItem, this.add, IMemorizer.pending, this.fromStart);
  },

  pendingTillEnd: function (menuItem) {
    this.processAction(menuItem, this.add, IMemorizer.pending, this.tillEnd);
  },

  pendingSura: function (menuItem) {
    this.processAction(menuItem, this.add, IMemorizer.pending, this.wholeSura);
  },
};

function ToggleRevMode(bRevMode, nStartAya) {
  RemoveSelection();

  if (Defined(bRevMode)) {
    gRevMode = bRevMode;
    gRevStart = bRevMode ? (Defined(nStartAya) ? nStartAya : 0) : 1000;
  } else {
    if (gRevMode) {
      gRevMode = false;
      gRevStart = 1000;
    } else {
      gRevMode = true;
      gRevStart = 0;
    }
  }

  _E("BtnReview").value = gRevMode ? _S.stop_mem_review : _S.mem_review;

  UpdateReviewColors(true);

  if (gRevMode && gFirstRevAlert) {
    alert(_S.review_help);
    gFirstRevAlert = false;
  }

  return gRevMode;
}

function UpdateReviewColors(bInit) {
  for (var i = 0; i < gAya.length; i++) {
    if (i < gRevStart) {
      // show
      gAya[i].style.color = "";
    } else {
      // hide
      if (gAya[i].style.backgroundColor.length)
        gAya[i].style.color = gAya[i].style.backgroundColor;
      else gAya[i].style.color = "var(--mask-color)";
    }
  }
}

function updateAyatColor(sura_num) {
  gMemorizedInfo = GetMemorizedInfo();
  gPendingInfo = GetPendingInfo();

  var mem_suras = gMemorizedInfo.split("$");
  var bending_suras = gPendingInfo.split("$");

  var nextMemAyaIndex = 0,
    nextBendAyaIndex = 0,
    nextMemAya = -1,
    nextBendAya = -1;

  var mem_ayat = mem_suras[sura_num].split("|");
  var bend_ayat = bending_suras[sura_num].split("|");
  if (mem_ayat.length > nextMemAyaIndex) {
    nextMemAya = parseInt(mem_ayat[nextMemAyaIndex]);
    nextMemAyaIndex++;
  }

  if (bend_ayat.length > nextBendAyaIndex) {
    nextBendAya = parseInt(bend_ayat[nextBendAyaIndex]);
    nextBendAyaIndex++;
  }

  for (aya_num = 1; aya_num <= QData.sura_info[sura_num - 1].ac; aya_num++) {
    gAya[aya_num - 1].style.borderColor = "";
    if (nextMemAya == aya_num) {
      gAya[aya_num - 1].style.borderColor = "#6C9D59";
      if (mem_ayat.length > nextMemAyaIndex) {
        //
        nextMemAya = parseInt(mem_ayat[nextMemAyaIndex]);
        nextMemAyaIndex++;
      }
    } else if (nextBendAya == aya_num) {
      gAya[aya_num - 1].style.borderColor = "orange";

      if (bend_ayat.length > nextBendAyaIndex) {
        nextBendAya = parseInt(bend_ayat[nextBendAyaIndex]);
        nextBendAyaIndex++;
      }
    } else {
      gAya[aya_num - 1].style.borderColor = "";
    }
  }
}

function GotoAya(nAya) {
  //window.setTimeout( "window.location.replace('#" + nAya + "')", 1 );
  var ndx = parseInt(nAya, 10) - 1;
  if (gAya && gAya[ndx]) {
    var scroll = ndx ? gAya[ndx].offsetTop : 0;
    gViewRoot.scrollTop = scroll;
  }
}

function JumpToPage(nPage) {
  if (nPage < gFirstPage) {
    if (gSuraNo > 1) {
      window.top.location.href =
        "?s=" + (gSuraNo - 1).toString() + "&p=" + nPage;
    }
  } else if (nPage > gLastPage) {
    if (gSuraNo < 114) {
      window.top.location.href =
        "?s=" + (gSuraNo + 1).toString() + "&p=" + nPage;
    }
  } else {
    var pageIndex = nPage - gFirstPage;
    var scroll = pageIndex
      ? gPageBtns[nPage - gFirstPage].parentNode.offsetTop - 2
      : 0;
    gViewRoot.scrollTop = scroll;
  }
}

function onClickPageButton(e) {
  var event = U.ieEvent(e);
  if (event.srcElement.pageNo) {
    //HidePage();
    SelectPage(event.srcElement.pageNo);
    document.URL = "#p" + event.srcElement.pageNo.toString(10);
  }
}
function onEnterPage() {
  var src = event.srcElement;
  if (src && src.pageNo) {
    ShowPage(src.pageNo);
    event.srcElement.style.backgroundColor = "white";
    if (!src.onmouseout) {
      src.onmouseout = onLeavePage;
    }
  }
}
function onLeavePage() {
  HidePage();
  event.srcElement.style.backgroundColor = "";
}
function disableSelection() {
  window.event.returnValue = false;
}

function HidePreviewAya(nAya) {
  HideElement("gAyaPreview");
}

function PreviewAya(nAya) {
  return window.gAya ? gAya[nAya - 1].innerHTML : "";
}
function onAyaClick(e) {
  var event = U.ieEvent(e);
  var aya = event.srcElement.getAttribute("aya");

  if (aya) {
    var nAyaIndex = parseInt(aya) - 1;

    if (gRevMode) {
      gRevStart = nAyaIndex + (nAyaIndex < gRevStart ? 0 : 1);

      UpdateReviewColors();
    } else {
      window.setTimeout("UpdateSelectedRange(" + nAyaIndex.toString() + ")", 1);
    }
  }
}

function UpdateSelectedRange(nAyaIndex) {
  RemoveSelection();

  if (-1 == gStartSelection) {
    // no selection
    gStartSelection = gEndSelection = nAyaIndex;
  } else if (gStartSelection == gEndSelection) {
    //one aya selected
    if (nAyaIndex == gStartSelection) {
      // deselect
      gStartSelection = -1;
    } else if (nAyaIndex < gStartSelection) {
      gStartSelection = nAyaIndex;
    } else {
      gEndSelection = nAyaIndex;
    }
  } else {
    if (nAyaIndex == gStartSelection) {
      gEndSelection = gStartSelection;
    } else if (nAyaIndex == gEndSelection) {
      gStartSelection = gEndSelection;
    } else if (nAyaIndex < gStartSelection) {
      gStartSelection = nAyaIndex;
    } else {
      gEndSelection = nAyaIndex;
    }
  }

  UpdateAyatChart();

  DrawSelection();
}

function UpdateAyatChart() {
  showSelection(gStartSelection, gEndSelection);
}

function RemoveSelection() {
  if (gStartSelection == -1) return;

  for (var i = gStartSelection; i <= gEndSelection; i++) {
    gAya[i].style.backgroundColor = "";
  }
}

function DrawSelection() {
  if (gStartSelection == -1) return;

  for (var i = gStartSelection; i <= gEndSelection; i++) {
    gAya[i].style.backgroundColor = "var(--sel-bg)";
  }
}

function UpdateAyatColorEx() {
  updateAyatColor(gSuraNo);
  showMemReport(true);
  SideIndex.updateUI();
  if (gStartSelection != -1) {
    showSelection(gStartSelection, gEndSelection);
  }
  DrawSelection();
}

function SelectPage(nPageNum) {
  if (!gRevMode) RemoveSelection();

  var suraInfo = QData.sura_info[gSuraNo - 1];
  var pageInfo = QData.pagesInfo[nPageNum - 1];
  gStartSelection = pageInfo.s == gSuraNo ? pageInfo.a - 1 : 0;

  var nextPageInfo = QData.pagesInfo[nPageNum];
  gEndSelection =
    nextPageInfo.s == gSuraNo ? nextPageInfo.a - 2 : suraInfo.ac - 1;

  UpdateAyatChart();

  if (gRevMode) {
    gStartSelection = gEndSelection = -1;
  } else {
    DrawSelection();
  }
}

function ShowPage(nPageNo, nDelay) {
  if (!gRevMode) {
    DisplayPage(nPageNo);
  }
}

function HideMe(e) {
  this.style.display = "none";
}

function showAyaImage(ayaNo) {
  var image_id = "aya_img_" + ayaNo;
  var image = document.getElementById(image_id);
  if (image) {
    image.style.display = image.style.display == "" ? "none" : "";
    return;
  }
  var imgSRC = getAyaImageURL(gSuraNo, ayaNo);

  var eAya = gAya[ayaNo - 1];
  image = document.createElement("img");
  image.setAttribute("id", image_id);
  image.setAttribute("src", imgSRC);
  image.setAttribute("title", _S.sura_img_title);
  image.className = "aya_preview";
  image.onclick = HideMe;

  eAya.insertBefore(image, eAya.firstChild);
}

function menuToggleReviewMode(menuItem) {
  var ayaNo = menuItem.getContextAya();
  _E("MainMenu").detach();
  ToggleRevMode(true, ayaNo - 1);
}

function reciteSelected(menuItem) {
  var ayaNo = menuItem.getContextAya();
  var data = menuItem.getData();
  var info = data.info;
  var reciter =
    info == undefined || info.r == undefined
      ? CK.get("selr", 0)
      : parseInt(info.r, 10);
  CK.set("selr", reciter);
  var reciter_names = ["hosaree", "hozefee"];
  if (
    gStartSelection == -1 ||
    ayaNo < gStartSelection ||
    ayaNo - 1 > gEndSelection
  ) {
    openReciter(
      gRangeReciter +
        "?s=" +
        gSuraNo +
        "&f=" +
        ayaNo +
        "&t=" +
        ayaNo +
        "&r=" +
        reciter,
      gSuraNo,
      reciter_names[reciter]
    );
  } else {
    openReciter(
      gRangeReciter +
        "?s=" +
        gSuraNo +
        "&f=" +
        (gStartSelection + 1).toString() +
        "&t=" +
        (gEndSelection + 1).toString() +
        "&r=0",
      gSuraNo,
      reciter_names[reciter]
    );
  }

  _E("MainMenu").detach();
}

function copyText(menuItem) {
  var ayaNo = parseInt(menuItem.getContextAya(), 10);
  var start = ayaNo;
  var end = start;

  if (
    gStartSelection != -1 &&
    ayaNo - 1 >= gStartSelection &&
    ayaNo - 1 <= gEndSelection
  ) {
    // in selection
    start = gStartSelection + 1;
    end = gEndSelection + 1;
  }
  copyTextRange(gSuraNo, start, end);
}
