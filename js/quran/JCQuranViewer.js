DefineVars({
  gRangeReciter: "/cgi-bin/recite.pl",
  gPageImageBase: "https://hafiz.muslim-web.com/qpages_1260/page",
});
var gMouseOffsetX, gCapture, gShiftX;

function imgBase() {
  return appBase();
}

function pageImageURL(pageNum) {
  return gPageImageBase + pageNum.toStringEx(3) + ".png";
}

var vKeys = (vK = {
  space: 32,
  home: 36,
  end: 35,
  pgDn: 34,
  pgUp: 33,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
});

var JCQuranViewer = DefineJClass({
  init: function () {
    TafPage.init();

    _E("SelTaf").onclick = function (e) {
      var event = U.ieEvent(e);
      event.stopPropagation();
    };

    _E("SelTaf").onchange = function (e) {
      CK.set("taf", this.value, true);
      TafPage.update();
    };

    _E("SelTaf").value = CK.get("taf", "GALALEEN");

    _E("PageSpinTable").onkeydown = function (e) {
      var event = U.ieEvent(e);

      switch (event.keyCode) {
        case vK.home:
          event.preventDefault();
          if (event.ctrlKey) QViewer.gotoPage(1);
          else {
            QViewer.prevSura();
            QViewer.nextSura();
          }
          break;
        case vK.end:
          event.preventDefault();
          if (event.ctrlKey) QViewer.gotoPage(114);
          else {
            QViewer.nextSura();
            QViewer.prevSura();
          }
          break;
        case vK.space:
        case vK.pgDn:
        case vK.left:
        case vK.down:
          event.preventDefault();

          if (Mask.active) {
            Mask.increment();
          } else {
            if (event.ctrlKey) QViewer.nextSura();
            else QViewer.nextPage();
          }
          break;

        case vK.pgUp:
        case vK.up:
        case vK.right:
          event.preventDefault();
          if (Mask.active) {
            Mask.decrement();
          } else {
            if (event.ctrlKey) QViewer.prevSura();
            else QViewer.prevPage();
          }
          break;
        default:
          //alert(event.keyCode);
          return true;
      }

      QViewer.focus();
      return false;
    };

    for (var i = 0; i < 2; i++) {
      _E("idPageViewFrame_" + i).onclick = function (e) {
        var event = U.ieEvent(e);
        event.stopPropagation();
        var nSide = parseInt(event.srcElement.getAttribute("side"), 10);
        if (Mask.active) {
          if (nSide) {
            Mask.increment();
          } else {
            Mask.decrement();
          }
        } else {
          QViewer.gotoSide(nSide);
        }
      };
    }

    U.addWheelListener(_E("idPageViewFrame_0"), WheelScrollPages);
    U.addWheelListener(_E("idPageViewFrame_1"), WheelScrollPages);

    //U.disableSelection(this);
  },
});

var QViewer = {
  currSuraNum: 0,
  currPageNum: 0,

  updateMemorizationUI: function () {
    Memorization.updateTotal();
    MemorizationMap.redraw();
    QViewer.showSuraChart();
    IMemReport.generate(_E("MemReport"));
  },

  getActiveSide: function () {
    return this.pageSide(this.currPageNum);
  },
  menuHandler: {
    part: {
      review: function (menuItem) {
        var info = menuItem.getData().info;
        VerticalIndex.setTab("s");
        //QViewer.gotoAya(info.aya-1, info.sura-1);
        Mask.show(info.sura, info.aya);
      },
      exercise: function (menuItem) {
        var info = menuItem.getData().info;
        _E("idViewTabs").onClickTab("exercise");
        MemExercise.startEx(info.sura, info.aya);
      },
      copyText: function (menuItem) {
        var info = menuItem.getData().info;
        copyTextRange(info.sura, info.aya, info.endAya);
      },
      recite: function (menuItem) {
        var info = menuItem.getData().info;
        QViewer.menuHandler.reciter.range(info.sura, info.aya, info.endAya);
      },
      addMem: function (menuItem) {
        var info = menuItem.getData().info;
        memorizeRange(info.sura, info.aya, info.endAya);
        this.updateUI();
      },
      addPending: function (menuItem) {
        var info = menuItem.getData().info;
        memorizePendingRange(info.sura, info.aya, info.endAya);
        this.updateUI();
      },
      removeMem: function (menuItem) {
        var info = menuItem.getData().info;
        unMemorizeRange(info.sura, info.aya, info.endAya);
        this.updateUI();
      },
      updateUI: function () {
        QViewer.updateMemorizationUI();
      },
    },
    review: function (menuItem) {
      var suraNum = menuItem.getContextSura();
      var ayaNum = menuItem.getContextAya();
      //_E("MemReviewTitle").innerHTML = _S.stop_mem_review;
      VerticalIndex.setTab("s");
      QViewer.gotoAya(ayaNum - 1, suraNum - 1);
      Mask.show(suraNum, ayaNum);
    },
    exercise: function (menuItem) {
      _E("idViewTabs").onClickTab("exercise");
      MemExercise.startEx(menuItem.getContextSura(), menuItem.getContextAya());
    },
    copyText: function (menuItem) {
      var suraNum = menuItem.getContextSura();
      var ayaNum = menuItem.getContextAya();
      if (Selection.ayaSelected(suraNum, ayaNum)) {
        Selection.copyText();
      } else {
        window.copyTextRange(suraNum, ayaNum, ayaNum);
      }
    },

    addMem: function (menuItem) {
      var suraNum = menuItem.getContextSura();
      var ayaNum = menuItem.getContextAya();
      if (Selection.ayaSelected(suraNum, ayaNum)) {
        Selection.addMem();
      } else {
        memorizeRange(suraNum, ayaNum, ayaNum);
      }
      QViewer.updateMemorizationUI();
    },
    addPending: function (menuItem) {
      var suraNum = menuItem.getContextSura();
      var ayaNum = menuItem.getContextAya();
      if (Selection.ayaSelected(suraNum, ayaNum)) {
        Selection.addPending();
      } else {
        memorizePendingRange(suraNum, ayaNum, ayaNum);
      }
      QViewer.updateMemorizationUI();
    },
    removeMem: function (menuItem) {
      var suraNum = menuItem.getContextSura();
      var ayaNum = menuItem.getContextAya();
      if (Selection.ayaSelected(suraNum, ayaNum)) {
        Selection.removeMem();
      } else {
        unMemorizeRange(suraNum, ayaNum, ayaNum);
      }
      QViewer.updateMemorizationUI();
    },

    reciter: {
      current: function (menuItem) {
        var sura = menuItem.getContextSura();
        var aya = menuItem.getContextAya();
        this.range(sura, aya, aya);
      },
      fromStartToEnd: function (menuItem) {
        var suraNum = menuItem.getContextSura();
        this.range(suraNum, 1, QData.sura_info[suraNum - 1]);
      },
      toSuraEnd: function (menuItem) {
        var suraNum = menuItem.getContextSura();
        var ayaNum = menuItem.getContextAya();
        this.range(suraNum, ayaNum, QData.sura_info[suraNum - 1]);
      },
      fromSuraStart: function (menuItem) {
        var suraNum = menuItem.getContextSura();
        var ayaNum = menuItem.getContextAya();
        this.range(suraNum, 1, ayaNum);
      },
      currPage: function (menuItem) {
        var suraNum = menuItem.getContextSura();
        var ayaNum = menuItem.getContextAya();
        var nPage = QData.ayaPage(suraNum - 1, ayaNum - 1);
        QViewer.recitePage(nPage + 1);
      },
      selected: function () {
        Selection.recite();
      },
      whole: function (menuItem) {
        //TODO: check if versebyverse available
        var suraNum = menuItem.getContextSura();
        ISura.recite(suraNum - 1);
      },
      range: function (suraNum, start, end, info) {
        if (
          AudioPlayer.playRange(
            1,
            { sura: ToInt(suraNum), aya: ToInt(start) },
            { sura: ToInt(suraNum), aya: ToInt(end) }
          )
        ) {
          return;
        }

        var selr =
          info != undefined && info.r != undefined
            ? (selr = parseInt(info.r, 10))
            : QViewer.getRangeReciter().idx;
        CK.set("selr", selr);
        openReciter(
          gRangeReciter +
            "?s=" +
            suraNum +
            "&f=" +
            start +
            "&t=" +
            end +
            "&r=" +
            selr,
          suraNum,
          ["hosaree", "hozefee"][selr]
        );
      },
    },
  },

  getAyaContextMenu: function (suraNum, ayaNum) {
    var ayaInfo = { sura: suraNum, aya: ayaNum };
    var menu = [];
    var reciteMenu = [
      {
        label: _S.whole_sura,
        handler: "whole",
        context: this.menuHandler.reciter,
        info: ayaInfo,
      },
      {
        label: _S.whole_sura + "*",
        handler: "fromStartToEnd",
        context: this.menuHandler.reciter,
        info: ayaInfo,
      },
      {
        label: _S.till_sura_end + "*",
        handler: "toSuraEnd",
        context: this.menuHandler.reciter,
        info: ayaInfo,
      },
      {
        label: _S.from_sura_start + "*",
        handler: "fromSuraStart",
        context: this.menuHandler.reciter,
        info: ayaInfo,
      },
      {
        label: _S.curr_page + "*",
        handler: "currPage",
        context: this.menuHandler.reciter,
        info: ayaInfo,
      },
      {
        label: _S.this_verse + "*",
        handler: "current",
        context: this.menuHandler.reciter,
        info: ayaInfo,
      },
    ];

    if (Selection.start) {
      reciteMenu.push({
        label: _S.selected_ayat + "*",
        handler: "selected",
        context: this.menuHandler.reciter,
      });
    }

    if (Selection.start) {
      menu.push({
        label: _S.extend_selection,
        context: Selection,
        handler: "extendSelection",
        info: ayaInfo,
      });
    }

    menu.push({
      label: _S.start_selection,
      context: Selection,
      handler: "startSelection",
      info: ayaInfo,
    });

    menu.push({
      label: _S.recite,
      handler: "current",
      context: this.menuHandler.reciter,
      menuPos: "side",
      info: ayaInfo,
      menu: reciteMenu,
    });

    menu.push({
      label: _S.mem_review,
      handler: "review",
      context: this.menuHandler,
      info: ayaInfo,
    });
    menu.push({
      label: _S.writing_exercise,
      handler: "exercise",
      context: this.menuHandler,
      info: ayaInfo,
    });
    menu.push({
      label: _S.add_to_memorized,
      handler: "addMem",
      context: this.menuHandler,
      info: ayaInfo,
    });
    menu.push({
      label: _S.add_to_pending,
      handler: "addPending",
      context: this.menuHandler,
      info: ayaInfo,
    });
    menu.push({
      label: _S.delete_memorized,
      handler: "removeMem",
      context: this.menuHandler,
      info: ayaInfo,
    });
    menu.push({
      label: _S.copy_selected,
      handler: "copyText",
      context: this.menuHandler,
      info: ayaInfo,
    });

    if (Selection.ayaSelected(suraNum, ayaNum)) {
      menu.push({
        label: _S.selected_verses,
        menuPos: "side",
        menu: Selection.getContextMenu(),
      });
    }

    return menu;
  },

  openSuraText: function () {
    if (this.currSuraNum) {
      ISura.openText(this.currSuraNum);
    }
  },

  getRangeReciter: function () {
    var selReciter = IReciters.activeReciter;
    var selr;
    switch (selReciter) {
      case "hosaree":
        selr = "0";
        break;
      case "hozefee":
        selr = "1";
        break;
      default:
        selr = CK.get("selr", "0");
        selReciter = ["hosaree", "hozefee"][selr];
    }

    return {
      id: selReciter,
      idx: selr,
    };
  },

  reciteSide: function (nSide) {
    var pageNum = this.sidePageNumber(nSide);
    this.recitePage(pageNum);
  },

  recitePage: function (pageNum) {
    var suraNum = QData.pagesInfo[pageNum - 1].s;
    var ayaNum = QData.pagesInfo[pageNum - 1].a;
    var endPageAya;
    if (pageNum < 604) {
      endPageAya = QData.prevAya(
        QData.pagesInfo[pageNum].s,
        QData.pagesInfo[pageNum].a
      );
    } else {
      endPageAya = { sura: 114, aya: 6 };
    }

    if (
      AudioPlayer.playRange(
        1,
        { sura: suraNum, aya: ayaNum },
        { sura: endPageAya.sura, aya: endPageAya.aya }
      )
    ) {
      return;
    }

    var lastAyaNum = QData.sura_info[suraNum - 1].ac;
    if (QData.pagesInfo[pageNum].s == suraNum) {
      // page inside the same sura
      lastAyaNum = QData.pagesInfo[pageNum].a - 1;
    }
    var reciterInfo = this.getRangeReciter();
    CK.set("selr", reciterInfo.idx, true);
    openReciter(
      gRangeReciter +
        "?s=" +
        suraNum +
        "&f=" +
        ayaNum +
        "&t=" +
        lastAyaNum +
        "&r=" +
        reciterInfo.idx,
      suraNum,
      reciterInfo.id,
      pageNum
    );
  },

  reviewSura: function (suraNum) {
    this.gotoSura(suraNum);
    if (!Mask.active) {
      this.onClickReview();
    }
  },

  onClickReview: function (e) {
    if (_EA(e, "checked")) {
      this.cancelReviewMode();
    } else {
      _SA(e, "checked", 1);

      if (_E("idViewTabs").getSelectedTab() == "exercise") {
        QViewer.gotoAya(MemApp.ayaInfo.aya, MemApp.ayaInfo.sura);
        Mask.show(MemApp.ayaInfo.sura + 1, MemApp.ayaInfo.aya + 1);
      } else {
        QViewer.gotoPage();
        var activePageInfo = QData.pagesInfo[QViewer.currPageNum - 1];
        Mask.show(activePageInfo.s, activePageInfo.a);
      }

      VerticalIndex.setTab("s");
    }
  },

  cancelReviewMode: function () {
    //_E("MemReviewTitle").innerHTML = _S.mem_review;
    //_E("MemReviewTitle").className = "";
    Mask.remove();
    _SA("MemReviewTitle", "checked");
  },

  nextSura: function () {
    if (this.currSuraNum >= 114) return;
    this.gotoSura(this.currSuraNum + 1);
  },

  prevSura: function () {
    if (this.currSuraNum <= 1) return;

    this.gotoSura(this.currSuraNum - 1);
  },

  prevPage: function () {
    var nCurrPage = this.currPageNum;
    if (nCurrPage > 1) {
      this.gotoPage(nCurrPage - 1);
    }
  },

  nextPage: function () {
    var nCurrPage = this.currPageNum;
    if (nCurrPage < 604) {
      this.gotoPage(nCurrPage + 1);
    }
  },

  focus: function () {
    var _qviewer = this;

    window.setTimeout(function () {
      var currPageNum = _qviewer.currPageNum || 1;
      var curr_side = _qviewer.pageSide(_qviewer.currPageNum);

      DU.addClass("PageSide_" + curr_side, "focus");

      var other_side = curr_side ? 0 : 1;
      DU.removeClass("PageSide_" + other_side, "focus");

      //_E("idPageViews").focus();
      DU.focus("PageSpinTable");

      _E("PageMarkCell_" + curr_side).appendChild(_E("idBtnPageMark"));
    }, 100);
  },

  updateButtons: function (suraNum) {
    if (suraNum == undefined) {
      suraNum = this.currSuraNum;
    } else {
      this.currSuraNum = suraNum;
    }

    var sAudio,
      nSura = suraNum - 1;

    _E("idPageViewAudio").style.visibility = IReciters.audioAvailable(nSura)
      ? ""
      : "hidden";

    _E("idPages").innerHTML =
      "<div id='SuraButtons'>" + this.getButtons() + "</div>";

    _E("ViewerSuraName").innerHTML =
      "<span class='href' onclick='QViewer.onclickSuraTitle(" +
      suraNum.toString() +
      ")'>" +
      suraNum +
      " " +
      _S.sura_names[nSura] +
      "</span>";

    this.showSuraChart();
    this.syncSideSura(true);
    if (this.currPageNum) {
      DU.addClass("idPageBtn" + this.currPageNum, "active");
    }
  },

  showSuraChart: function (suraNum) {
    if (suraNum == undefined) {
      suraNum = this.currSuraNum;
    }
    if (!suraNum) {
      return;
    }
    gMemorizedInfo = GetMemorizedInfo();
    gPendingInfo = GetPendingInfo();

    var mem_suras = gMemorizedInfo.split("$");
    var pending_suras = gPendingInfo.split("$");
    _E("AyatChart").setAttribute("sura", suraNum);
    var sMemInfo = mem_suras[suraNum];

    if (true) {
      // sMemInfo.length && sMemInfo.split("|").length != QData.sura_info[suraNum-1].ac ){
      _E("AyatChart").innerHTML =
        "<div class='mem_chart'>" +
        SuraMemChart(suraNum, gMemorizedInfo) +
        "</div>";
      var chartList = getElementsByAttribute(_E("AyatChart"), "state");
      for (var i = 0; i < chartList.length; i++) {
        chartList[i].onclick = function (e) {
          QViewer.gotoAya(
            ToInt(this.getAttribute("startAya") - 1),
            suraNum - 1,
            2
          );
        };

        chartList[i].oncontextmenu = function (e) {
          var event = U.ieEvent(e);
          event.preventDefault();
          var info = {
            sura: this.getAttribute("sura"),
            aya: this.getAttribute("startAya"),
            endAya: this.getAttribute("endAya"),
          };
          var menu = createMenu(GetRangeContextMenu(info));
          menu.attach(document.body, "mouse", {
            x: event.clientX,
            y: event.clientY,
          });
        };
      }
    } /*
		else{
			_E("AyatChart").innerHTML = "<span class='sura_bar_chart'>" + getSuraMemChart(suraNum, mem_suras, pending_suras) + "</span>";
			var aNodes = _E("AyatChart").getElementsByTagName("span");
			for(var i=0;i<aNodes.length;i++){
				aNodes[i].onclick = function(e){
					var event = U.ieEvent(e);
					var ayaNum = parseInt( event.srcElement.getAttribute("a"), 10 );
					QViewer.gotoAya( ayaNum - 1 );	
				};
			}
		}*/
  },

  getButtons: function () {
    var sRetStr = "<table id='PageButtons'><tr>";
    var separator = "";
    var nSura = this.currSuraNum - 1;
    var nStartPage = QData.sura_info[nSura].sp;
    var nEndPage = QData.sura_info[nSura].ep;

    var getPageButton = function (i) {
      var sPageNo = i.toString(10);
      return (
        "<td id='idPageBtn" +
        sPageNo +
        "' class='PageButton' " +
        " onclick='QViewer.onGotoPage(" +
        sPageNo +
        ")' >" +
        sPageNo +
        "</td>"
      );
    };

    if (0 == nStartPage % 2) {
      //sRetStr += getPageButton(nStartPage-1);
      sRetStr += "<td></td>";
    }

    for (var i = nStartPage; i <= nEndPage; i++) {
      sRetStr += getPageButton(i);
      if (Math.floor(i / 2) * 2 == i) {
        // even number
        sRetStr += "</tr><tr>";
      }
    }

    if (1 == nEndPage % 2) {
      //sRetStr += getPageButton(nEndPage+1);
      sRetStr += "<td></td>";
    }

    return sRetStr + "</tr></table>";
  },

  gotoSura: function (suraNum) {
    suraNum = parseInt(suraNum, 10);
    var pageNumber = 1;

    if (suraNum == undefined) {
      pageNumber = parseInt(CK.get("lpg", "1"), 10);
      suraNum = QData.pageSura(pageNumber, true) + 1;
    } else {
      pageNumber = QData.sura_info[suraNum - 1].sp;
    }

    this.updateButtons(suraNum);
    this.gotoPage(pageNumber);
    if (Mask.active) {
      Mask.show(suraNum);
    }

    this.syncSideSura();
    PageLayout.update();
  },

  gotoSide: function (nSide) {
    this.gotoPage(this.sidePageNumber(nSide));
  },

  sidePageNumber: function (nSide) {
    var nPage = this.currPageNum;
    nPage = Math.floor((nPage - 1) / 2) * 2; // determine first side number
    return nPage + nSide + 1;
  },

  loadCK: function () {
    this.currPageNum = parseInt(CK.get("lpg", "1"), 10);
    this.currSuraNum = QData.pageSura(this.currPageNum) + 1;
  },

  onGotoPage: function (pageNum) {
    this.gotoPage(pageNum);
    if (Mask.active) {
      var activePageInfo = QData.pagesInfo[pageNum - 1];
      Mask.show(activePageInfo.s, activePageInfo.a);
    }
  },

  gotoPageText: function (pageNum) {
    var sura = QData.pagesInfo[pageNum - 1].s;
    //var aya  = QData.pagesInfo[nPage-1].a;
    window.location.href = "/sura/?s=" + sura + "&p=" + pageNum.toString();
  },

  gotoPage: function (pageNum, bReload) {
    if (pageNum != undefined) {
      _E("idViewTabs").onClickTab("pages");
    }
    VerticalIndex.show();

    if (!this.currPageNum) {
      this.loadCK();
      this.updateButtons();
    }

    if (!bReload && pageNum == this.currPageNum) {
      return;
    }

    if (!pageNum) {
      pageNum = this.currPageNum;
    }

    CK.set("lpg", pageNum.toString(), true);

    var activeSide = this.pageSide(pageNum);
    var inactiveSide = activeSide == 0 ? 1 : 0;
    var inactiveSidePageNum = inactiveSide == 0 ? pageNum - 1 : pageNum + 1;
    var inactiveSideLoadedPageNum = ToInt(
      _EA("idPageView_" + inactiveSide, "page_number", -1)
    );

    if (inactiveSidePageNum != inactiveSideLoadedPageNum) {
      // if other side contains the wrong page, remove it
      DU.removeClass("idPageViewFrame_" + inactiveSide, "wait");

      _E("idPageViewFrame_" + inactiveSide).innerHTML =
        "<img id=idPageView_" +
        inactiveSide +
        " src='" +
        imgBase() +
        "images/space.gif' " +
        " side='" +
        inactiveSide +
        "' " +
        " />";

      this.setupPageImageEvents(inactiveSide);

      _E("idPageNo_" + inactiveSide).innerHTML =
        _E("idPageChapter_" + inactiveSide).innerHTML =
        _E("idPageSuraName_" + inactiveSide).innerHTML =
          "&nbsp;";
      PageMap.removeSide(inactiveSide);
    }

    var oldPage = this.currPageNum;
    this.currPageNum = pageNum;
    this.focus();

    _SA("idPageViews", "active_page", activeSide);

    DU.removeClass("idPageBtn" + oldPage, "active"); // unselect current page button
    DU.addClass("idPageBtn" + pageNum, "active"); //select new page button

    if (
      bReload ||
      _EA("idPageView_" + activeSide, "page_number", -1) != pageNum
    ) {
      _E("idPageNo_" + activeSide).innerHTML =
        "<font color=red>" + _S.loading_page + ": " + pageNum + " ...</font>";
      DU.addClass("idPageViewFrame_" + activeSide, "wait");

      _E("idPageChapter_" + activeSide).innerHTML = _E(
        "idPageSuraName_" + activeSide
      ).innerHTML = "&nbsp;";

      this.setPage(pageNum);
    }

    if (!QData.suraInPage(this.currSuraNum, pageNum)) {
      // page doesn't contain currSuraNum, set current sura to first sura in this page
      var suraNum = QData.pageSura(pageNum) + 1;
      this.setCurrentSura(suraNum);
    }

    switch (_E("idSelectVerticalIndex").getSelectedTab()) {
      case "edit":
        MapEditor.syncPage(pageNum);
        break;
      case "p":
        this.syncSideChapters();
        break;
      case "s":
        this.syncSideSura();
        break;
    }

    var pageSpin = _E("gPageSpin");

    if (pageSpin) {
      pageSpin.setValue(pageNum);
      if (PageMarks.pageFound(pageNum)) {
        _E("idBtnPageMark").innerHTML = _S.remove_page_mark;
      } else {
        _E("idBtnPageMark").innerHTML = _S.bookmark;
      }
    }
  },

  setCurrentSura: function (suraNum) {
    if (this.currSuraNum != suraNum) {
      this.currSuraNum = suraNum;
      this.updateButtons();
    }
  },

  gotoAya: function (nAya, nSura, nShow) {
    if (nSura == undefined) {
      nSura = this.currSuraNum - 1;
    } else {
      this.setCurrentSura(nSura + 1);
    }
    var nPage = QData.ayaPage(nSura, nAya);
    this.gotoPage(nPage + 1);
    if (Mask.active) {
      Mask.show(nSura + 1, nAya + 1);
    } else {
      var sPostSelection;
      switch (nShow) {
        case 1:
          sPostSelection =
            "Selection.setStart(" +
            (nSura + 1).toString() +
            ", " +
            (nAya + 1).toString() +
            ", true )";
          break;
        case 2: // hover
          sPostSelection = "Hover.draw(PageMap.selection)";
          break;
      }
      PageMap.selectAya(nSura + 1, nAya + 1, sPostSelection);
    }
    this.focus();
  },

  setPage: function (pageNum, bRedo) {
    if (pageNum == undefined) {
      if (this.currPageNum) {
        pageNum = this.currPageNum;
      } else {
        return;
      }
    }
    var activeSide = this.pageSide(pageNum);

    var src =
      pageImageURL(pageNum) +
      (bRedo ? "?" + new Date().getTime().toString() : "");

    _E("idPageViewFrame_" + activeSide).innerHTML =
      "<img id=idPageView_" +
      activeSide +
      " page_number=" +
      pageNum +
      " side=" +
      activeSide +
      " />";

    PageMap.load(pageNum);
    this.setupPageImageEvents(activeSide);
    _SA("idPageView_" + activeSide, "src", src);
  },

  syncSideChapters: function (force) {
    var oldPage = this.syncedPartPage;

    var newPage = this.currPageNum;

    if (!force && oldPage == newPage) {
      return;
    }

    this.syncedPartPage = newPage;

    var nChapter = QData.pagePart(oldPage);
    var chapter = _E("idChapter_" + nChapter);

    if (chapter) {
      // unselect current chapter
      DU.removeClass(chapter, "active");
      chapter.innerHTML = _S.part + ":&nbsp;" + (nChapter + 1).toString();
    }

    nChapter = QData.pagePart(newPage);
    chapter = _E("idChapter_" + nChapter);
    if (!chapter) {
      return;
    }
    //select new chapter
    var chTitle = _S.part + ":&nbsp;" + (nChapter + 1).toString();
    var barWidth = chapter.offsetWidth - 2;

    DU.addClass(chapter, "active");

    chapter.innerHTML =
      "<div style='" +
      [
        "position:absolute",
        "width:" +
          Math.floor(
            (GetChapterProgress(nChapter, newPage) * barWidth) / 100
          ).toString() +
          "px",
        "background:var(--progress-bar)",
      ].join(";") +
      "'>&nbsp;</div>" +
      "<div style='" +
      ["position:absolute", "width:48px"].join(";") +
      "'>" +
      chTitle +
      "</div>&nbsp;";
  },

  syncSideSura: function (force) {
    if (this.syncedSuraNum != this.currSuraNum) {
      var eSura = _E("idSura_" + this.syncedSuraNum);

      if (eSura) {
        // unselect current sura
        DU.removeClass(eSura, "active");
        eSura.innerHTML = _S.sura_names[this.syncedSuraNum - 1];
      }
      this.syncedSuraNum = 0;
    }

    var suraNum = this.currSuraNum;
    var eSura = _E("idSura_" + suraNum);

    if (!eSura) {
      return;
    }

    this.syncedSuraNum = this.currSuraNum;

    // select new sura
    var sTitle = _S.sura_names[suraNum - 1];
    var barWidth = eSura.offsetWidth - 2;
    DU.addClass(eSura, "active");
    eSura.innerHTML =
      "<div style='position:absolute;height:12px;width:" +
      Math.floor(
        (GetSuraProgress(this.currSuraNum - 1, this.currPageNum) * barWidth) /
          100
      ).toString() +
      "px;background:var(--progress-bar)'>&nbsp;</div>" +
      "<div style='position:absolute;width:48px'>" +
      sTitle +
      "</div>&nbsp;";
  },

  pageSide: function (pageNum) {
    return (pageNum - 1) % 2;
  },

  setupPageImageEvents: function (nSide) {
    var pageView = _E("idPageView_" + nSide);

    U.extend(pageView, {
      onselectstart: function (e) {
        var event = U.ieEvent(e);
        event.stopPropagation();
      },
      oncontextmenu: function (e) {
        var event = U.ieEvent(e);
        event.preventDefault();
      },
      onmousemove: function (e) {
        var event = U.ieEvent(e);
        U.viewMouseValues(event);
        event.preventDefault();

        if (_E("idSelectVerticalIndex").getSelectedTab() == "edit") {
          return;
        }

        Hover.handleMouse(nSide, event.offsetX, event.offsetY);
      },

      onclick: function (e) {
        var event = U.ieEvent(e);
        event.stopPropagation();
        QViewer.focus();
        QViewer.gotoSide(nSide);
        if (Mask.active) {
          Mask.decrement();
          return;
        }
        if (_E("idSelectVerticalIndex").getSelectedTab() == "edit") {
          MapEditor.onClickPage(
            QViewer.sidePageNumber(nSide),
            event.offsetX,
            event.offsetY
          );
        }
      },

      onerror: function (e) {
        var event = U.ieEvent(e);
        var pageImg = event.srcElement;
        var pageNum = parseInt(_EA(pageImg, "page_number"), 10);
        DU.removeClass("idPageViewFrame_" + nSide, "wait");
        _E("idPageNo_" + nSide).innerHTML =
          "<font color='red'>" +
          _S.page_load_error +
          " " +
          pageNum +
          "</font> " +
          "<span class='href' tabindex='-1' onclick='QViewer.setPage(" +
          pageNum +
          ",true)'>" +
          _S.redo +
          "</span>";
        //document.title = "*" + document.title;
      },

      onload: function (e) {
        var event = U.ieEvent(e);
        var pageImg = event.srcElement;
        DU.removeClass("idPageViewFrame_" + nSide, "wait");
        var pageNum = QViewer.sidePageNumber(nSide);
        _E("idPageNo_" + nSide).innerHTML = _S.page + "&nbsp;" + pageNum;
        var partNum = QData.pagePart(pageNum) + 1;
        _E("idPageChapter_" + nSide).innerHTML =
          "<span class='btn playBtn res' onclick='AudioPlayer.playQuranPart(" +
          partNum +
          ")' title='" +
          GS("recite_part") +
          "'></span> " +
          "<span class='href' onclick='QViewer.onclickPartTitle(" +
          partNum.toString() +
          ")'>" +
          _S.part +
          "&nbsp;" +
          partNum.toString() +
          "</span>";
        var suraNum = QData.pageSura(pageNum) + 1;
        _E("idPageSuraName_" + nSide).innerHTML =
          "<span class='btn playBtn res' onclick='ISura.reciteByVerse(" +
          (suraNum - 1).toString() +
          ")'  title='" +
          GS("recite_sura_vbv") +
          "'></span> " +
          "<span class='btn playBtn' onclick='ISura.recite(" +
          (suraNum - 1).toString() +
          ")' title='" +
          GS("recite_sura") +
          "'></span> " +
          "<span class='href' onclick='QViewer.onclickSuraTitle(" +
          suraNum.toString() +
          ")'>" +
          _S.sura_names[suraNum - 1] +
          "</span>";
      },
    });
  },

  onclickPartTitle: function (partNum) {
    VerticalIndex.setTab("p");
    this.gotoPage(QData.parts[partNum - 1].p);
  },

  onclickSuraTitle: function (suraNum) {
    VerticalIndex.setTab("s");
    this.gotoSura(suraNum);
  },

  updateResolution: function () {
    DU.addClass("idPageViews", "hres");
    this.setPage();
  },
};

var VerticalIndex = {
  onChange: function () {
    var tid = _E("idSelectVerticalIndex").getSelectedTab();
    this.show();
    this.save("vi", tid);
  },

  setTab: function (tid) {
    _E("idSelectVerticalIndex").selectTab(tid);
    this.show();
    this.save();
  },

  show: function () {
    var tid;

    if (this.activeTab == undefined) {
      this.load(); //read cookie
      tid = this.activeTab;
      _E("idSelectVerticalIndex").selectTab(this.activeTab);
    } else {
      tid = _E("idSelectVerticalIndex").getSelectedTab(); //read UI
      if (tid == this.activeTab) {
        return undefined;
      }
      this.activeTab = tid;
    }

    switch (tid) {
      case "p":
        _E("Parts").innerHTML = this.getPartsIndex();
        QViewer.syncSideChapters(true);
        break;
      case "s":
        if (!_E("ChaptersTable")) {
          this.renderChapters(false);
        } else {
          QViewer.syncSideSura(true);
        }
        break;
      case "taf":
        //_E("Tafseer").appendChild( _EC.tafFrame );
        break;
      case "edit":
        Hover.hide();
        _E("Editor").innerHTML = MapEditor.mGetHTML();
        MapEditor.syncPage(QViewer.currPageNum);
    }
    return tid;
  },

  save: function () {
    CK.set("vi", this.activeTab, true);
  },

  load: function () {
    return (this.activeTab = CK.get("vi", "p"));
  },

  renderChapters: function (bSorted) {
    _E("Chapters").innerHTML = this.getChaptersIndex(bSorted);
    QViewer.syncSideSura(true);
  },

  getChaptersIndex: function (bSorted) {
    var sRetValue =
      "<div onclick='VerticalIndex.renderChapters(" +
      (bSorted ? "false" : "true") +
      ")'><input type='checkbox' " +
      (bSorted ? " checked " : "") +
      "/><span class='checkbox_title'>" +
      _S.sorted +
      "</span></div>" +
      "<table id='ChaptersTable' class='chapters_index_columns'><tr><td>";

    if (bSorted && this.sortMap == undefined) {
      this.sortMap = _S.sorted_chapters.split(",");
    }

    for (var i = 0; i < 114; i++) {
      if (i && i % 29 == 0) {
        sRetValue += "</td><td>";
      }

      var nSura = bSorted ? parseInt(this.sortMap[i], 10) - 1 : i;

      sRetValue +=
        "<div class='vIndexCell' id='idSura_" +
        (nSura + 1).toString() +
        "' onclick='QViewer.gotoSura(" +
        (nSura + 1).toString() +
        ")' >" +
        _S.sura_names[nSura] +
        "</div>";
    }
    return sRetValue + "</td></tr></table>";
  },

  getPartsIndex: function () {
    var sRetValue = "";

    for (var i = 0, len = QData.parts.length; i < len; i++) {
      var offset = i * 3;
      var ordinal = (i + 1).toString();
      sRetValue +=
        "<div class='vIndexCell chapter' id=idChapter_" +
        i.toString() +
        " onclick='QViewer.onGotoPage(" +
        QData.parts[i].p.toString() +
        ")' " +
        " title='" +
        _S.sura_names[QData.parts[i].s - 1] +
        "-آية:" +
        QData.parts[i].a +
        "'>" +
        _S.part +
        ": " +
        ordinal +
        "</div>";
    }
    return sRetValue;
  },
};

var TafPage = {
  init: function () {
    _E("OpenTafBtn").onclick = function (e) {
      var event = U.ieEvent(e);
      event.stopPropagation();
      TafPage.openWindow();
    };
  },

  increment: function (sura, aya) {
    var ayaInfo = QData.nextAya(this.sura, this.aya);
    this.update(ayaInfo.sura, ayaInfo.aya);
  },

  decrement: function (sura, aya) {
    var ayaInfo = QData.prevAya(this.sura, this.aya);
    this.update(ayaInfo.sura, ayaInfo.aya);
  },

  gotoAyaPage: function () {
    if (Mask.active) {
      QViewer.cancelReviewMode();
    }
    QViewer.gotoAya(this.aya - 1, this.sura - 1, 2);
    //var page=QData.ayaPage( this.sura-1, this.aya-1 );
    //QViewer.gotoPage( page+1 );
    //PageMap.selectAya( this.sura, this.aya, "Hover.draw(PageMap.selection)" );
    //PageMap.selectAndDrawAya( this.sura, this.aya );
    //Mask.show( this.sura, this.aya );
  },

  openWindow: function () {
    var url = this.getPageURL(this.sura, this.aya);
    var wnd = window.open(url, "qtaf");
    wnd.focus();
  },

  update: function (sura, aya) {
    if (sura != undefined) {
      this.sura = sura;
    }

    if (aya != undefined) {
      this.aya = aya;
    }

    if (this.aya == undefined) {
      return;
    }

    DU.show("TafNav");
    var tFrame = _E("TafText");
    if (!tFrame) {
      return;
    }

    var pageURL = this.getPageURL(this.sura, this.aya);

    tFrame.innerHTML =
      "<iframe frameborder='0' class='translation_frame' src='" +
      pageURL +
      "'></iframe>";
    _E("TafAya").innerHTML =
      _S.sura_names[TafPage.sura - 1] + ":" + TafPage.aya + " ";
  },

  isTafseer: function () {
    switch (_E("SelTaf").value) {
      case "KATHEER":
      case "KORTOBY":
      case "TABARY":
      case "GALALEEN":
        return true;
    }
    return false;
  },

  getPageURL: function (sura, aya) {
    // if (this.isTafseer()) {
    return getTafseerPageURL(_E("SelTaf").value, sura, aya);
    // } else {
    //   //return( "http://www.reciter.org/" + _E("SelTaf").value + "/" + TafPage.sura.toStringEx(3) + TafPage.aya.toStringEx(3) + ".html" );
    //   return (
    //     "/cgi-bin/get_db_taf.pl?src=" +
    //     _E("SelTaf").value +
    //     "&s=" +
    //     TafPage.sura +
    //     "&a=" +
    //     TafPage.aya
    //   );
    // }
  },
};

var PageMarks = {
  toggle: function () {
    var pageNum = QViewer.currPageNum;

    if (this.pageFound(pageNum)) {
      var pageMarks = readCookie("pgm", "").split(",");
      for (var i = 0; i < pageMarks.length; i++) {
        // remove it from the list
        if (pageMarks[i] == pageNum) {
          pageMarks = DeleteArrayElements(pageMarks, i, 1);
          i--;
        }
      }
      writeCookie("pgm", pageMarks.join(","));
    } else {
      this.pushPage(pageNum);
    }
  },

  pageFound: function (pageNum) {
    var pageMarks = readCookie("pgm", "").split(",");

    for (var i = 0; i < pageMarks.length; i++) {
      // search for it in the list
      if (pageMarks[i] == pageNum) {
        return true;
      }
    }

    return false;
  },

  pushPage: function (pageNum) {
    if (!pageNum) {
      pageNum = _E("gPageSpin").getValue();
    }

    U.pushToCookieArray("pgm", pageNum, 15);
  },
};

// wheel deltas are accumulated so that both a single mouse wheel notch
// (about 120 units) and the small deltas of a trackpad trigger a page change
var gWheelAccum = 0;
var gWheelAccumTimer = null;

function WheelScrollPages(e) {
  var event = U.ieEvent(e);
  event.preventDefault();

  var wDelta = event.wheelDelta;
  if (!wDelta) {
    return false;
  }

  gWheelAccum += wDelta;
  if (gWheelAccumTimer) {
    clearTimeout(gWheelAccumTimer);
  }
  gWheelAccumTimer = setTimeout(function () {
    gWheelAccum = 0;
  }, 200);

  if (gWheelAccum <= -100) {
    gWheelAccum = 0;
    if (Mask.active) {
      Mask.increment();
    } else {
      QViewer.nextPage();
    }
  } else if (gWheelAccum >= 100) {
    gWheelAccum = 0;
    if (Mask.active) {
      Mask.decrement();
    } else {
      QViewer.prevPage();
    }
  }

  return false;
}
