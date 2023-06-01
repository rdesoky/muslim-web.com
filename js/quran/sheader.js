//var ayaIndex;
var gsAyaSymbol;
var gAyaNo;
var gSuraNo;

function GotoPrevSura() {
  window.location.href = "sura/?s=" + (gSuraNo - 1).toString();
}

function GotoNextSura() {
  window.location.href = "sura/?s=" + (gSuraNo + 1).toString();
}

function DisplaySuraHeaderInfo() {
  var sHTML = "";
  if (gSuraNo > 1) {
    sHTML +=
      "<span class='arrowBtn right' onclick='GotoPrevSura()'></span>&nbsp;";
  }

  sHTML +=
    gSuraNo.toString() +
    ": " +
    _S.sura_names[gSuraNo - 1] +
    "&nbsp;(" +
    QData.sura_info[gSuraNo - 1].ac +
    " " +
    _S.aya +
    ")";

  if (gSuraNo > 0 && gSuraNo < 114) {
    sHTML +=
      "&nbsp;<span class='arrowBtn left' onclick='GotoNextSura()'></span>";
  }

  _E("idTitle").innerHTML = sHTML;
}
function openSearch() {
  var wnd = window.open(
    "search.htm",
    "search",
    "scrollbars=yes,resizable=yes,menubar=yes,toolbar=no,location=no,width=624,height=300"
  );

  if (wnd) {
    wnd.focus();
  } else {
    top.location.href = "search.htm";
  }
}

function openTrainer() {
  window.open("http://apps.facebook.com/memorizer/", "_blank");
}

function ToggleReviewMode() {
  ToggleRevMode();
}

function gotoPage(pageNo) {
  JumpToPage(pageNo);
  SelectPage(pageNo);
}

function InitVars() {
  gsAyaSymbol = "|";
  var sura = U.param("s", "1");
  var aya = U.param("a", "1");
  gSuraNo = parseInt(sura, 10);
  gAyaNo = parseInt(aya, 10);
}

function PopulateReciters() {
  var sHTML = "";
  var lang = window.gLang ? window.gLang : "ar";

  for (var reciter in RecitersInfo) {
    if (RecitersInfo[reciter].hasOwnProperty("suraAudio")) {
      sHTML +=
        "<option value='" + reciter + "'>" + _S.reciters[reciter] + "</option>";
    }
  }
  _E("RecitersList").innerHTML =
    "<select id='idReciter'>" + sHTML + "</select>";

  _E("idReciter").onchange = function (e) {
    changeReciter();
  };
}

function initHeader() {
  InitDocObjects();

  InitVars();

  DisplaySuraHeaderInfo();

  PopulateReciters();

  if (gSuraNo <= 0) idTelawa.style.display = "none";

  //var lastReciters = readCookie("reciter","");
  var lastReciters = CK.get("reciter", "");

  var lastReciter = lastReciters.split(",")[0];

  if (!lastReciter.length) {
    lastReciter = "hozefee";
  }

  _E("idReciter").value = lastReciter;

  //_E("idSaveURL").href = GetSaveURL();

  ShowHideRecitingIcons();

  _E("idPagesChart").innerHTML = _S.pages + " [ " + GetPagesButtons() + " ] ";

  _E("QuranViewer").onmouseover = function (e) {
    QViewer.show();
  };

  _E("QuranViewer").onmouseout = function (e) {
    QViewer.hide();
  };

  if (window.addEventListener) {
    // firefox
    _E("QuranViewer").addEventListener(
      "DOMMouseScroll",
      QViewer.onWheel,
      false
    );
    _E("QuranViewer").addEventListener(
      "DOMMouseScroll",
      QViewer.onWheel,
      false
    );
  }
  //IE and Chrom
  _E("QuranViewer").onmousewheel = _E("QuranViewer").onmousewheel =
    QViewer.onWheel;

  showMemReport(false);
}

function showSelection(nStart, nEnd) {
  var chart = _E("idMemChart");

  var chNodes = chart.getElementsByTagName("span");

  for (var i = 0; i < chNodes.length; i++) {
    if (nStart == -1 || i < nStart || i > nEnd) {
      chNodes[i].style.backgroundColor = "";
    } else {
      chNodes[i].style.backgroundColor = "yellow";
    }
  }
}

function showMemReport(refresh) {
  if (gSuraNo > 0) {
    gMemorizedInfo = GetMemorizedInfo(refresh);
    gPendingInfo = GetPendingInfo(refresh);

    var qPercent = quranMemPercent();
    var sPercent = suraMemPercent(gSuraNo);
    _E("idQMemChart").innerHTML = _S.whole_mem.replace("{mem}", qPercent);
    _E("idSMemChart").innerHTML = _S.sura_mem.replace("{mem}", sPercent);

    _E("idSMemChart").style.width = sPercent + "%";
    _E("idQMemChart").style.width = qPercent + "%";

    var mem_suras = gMemorizedInfo.split("$");
    var bending_suras = gPendingInfo.split("$");

    _E("idMemChart").innerHTML =
      "" + getSuraMemChart(gSuraNo, mem_suras, bending_suras);

    var aNodes = _E("idMemChart").getElementsByTagName("span");
    for (var i = 0; i < aNodes.length; i++) {
      aNodes[i].onclick = function (e) {
        var event = U.ieEvent(e);
        var aya = event.srcElement.getAttribute("a");
        GotoAya(aya);
      };
      aNodes[i].onmousemove = function (e) {
        var event = U.ieEvent(e);
        var aya = event.srcElement.getAttribute("a");
        var sAya = PreviewAya(parseInt(aya, 10));
        if (sAya) {
          _E("idAyaPreview").innerHTML = sAya;
          ShowElement("idAyaPreview");
        }
      };

      aNodes[i].onmouseout = function (e) {
        HideElement("idAyaPreview");
      };
    }
  }
}

function reciteSura() {
  var url = GetAudioURL(_E("idReciter").value, gSuraNo);
  openReciter(url, gSuraNo, _E("idReciter").value);
}

function GetSaveURL() {
  var url;
  var index = gSuraNo;
  var selectedReciter = _E("idReciter").value;
  if (selectedReciter.length) {
    url = GetAudioURL(selectedReciter, gSuraNo);
    return url;
  }
  return "";
}

function changeReciter() {
  idSaveURL.href = GetSaveURL();
  ShowHideRecitingIcons();
}

function ShowHideRecitingIcons() {
  var selectedReciter = _E("idReciter").value;

  if (
    selectedReciter &&
    Zipper.unzip(RecitersInfo[selectedReciter].actv).substring(
      gSuraNo - 1,
      gSuraNo
    ) == "1"
  ) {
    DU.show("idRecite");
  } else {
    DU.hide("idRecite");
  }
}

var QViewer = {
  setPage: function (nPage) {
    var nRightPage = nPage - ((nPage - 1) % 2);
    if (nRightPage != this.rightPage) {
      DU.addClass("LeftPage", "wait");
      _E("LeftPage").innerHTML =
        "<img id='LeftPageImage' class='pageImage' onload=\"DU.removeClass('LeftPage','wait')\" src=" +
        gPagesServer +
        "/pages/p" +
        (nRightPage + 1).toStringEx(3) +
        ".gif />";
      _E("LeftPageHeader").innerHTML = nRightPage + 1;
      DU.addClass("RightPage", "wait");
      _E("RightPage").innerHTML =
        "<img id='RightPageImage' class='pageImage' onload=\"DU.removeClass('RightPage','wait')\" src=" +
        gPagesServer +
        "/pages/p" +
        nRightPage.toStringEx(3) +
        ".gif />";
      _E("RightPageHeader").innerHTML = nRightPage;
      this.rightPage = nRightPage;
    }

    if (nPage == nRightPage) {
      DU.addClass("RightPage", "active");
      DU.removeClass("LeftPage", "active");
    } else {
      DU.removeClass("RightPage", "active");
      DU.addClass("LeftPage", "active");
    }
  },

  show: function (nPage, bNow) {
    stopTimer("hideTimer", this);

    if (nPage != undefined) {
      this.setPage(nPage);
    }

    if (bNow) {
      DU.removeClass(_E("QuranViewer"), "hidden");
      delete this.showTimer;
    } else {
      if (!this.showTimer) {
        var self = this;
        this.showTimer = window.setTimeout(function () {
          self.show(nPage, true);
        }, 400);
      }
    }
  },

  hide: function (bNow) {
    if (bNow) {
      DU.addClass(_E("QuranViewer"), "hidden");
      delete this.hideTimer;
    } else {
      if (!this.hideTimer) {
        var self = this;
        this.hideTimer = window.setTimeout(function () {
          self.hide(true);
        }, 1000);
      }
      stopTimer("showTimer", this);
    }
  },

  nextPage: function () {
    this.setPage(this.rightPage + 2);
  },

  prevPage: function () {
    this.setPage(this.rightPage - 2);
  },

  onWheel: function (e) {
    var event = U.ieEvent(e);

    event.preventDefault();
    var wDelta = event.wheelDelta;

    if (wDelta < -100) QViewer.nextPage();
    else if (wDelta > 100) QViewer.prevPage();

    return false;
  },
};

function GetPagesButtons() {
  var sRetStr = "";

  var nStartPage = QData.sura_info[gSuraNo - 1].sp;
  var nEndPage = QData.sura_info[gSuraNo - 1].ep;

  for (var i = nStartPage; i <= nEndPage; i++) {
    var sPg = i.toString(10);
    sRetStr +=
      "<span onmouseover='QViewer.show(" +
      sPg +
      ")' onmouseout='QViewer.hide()' onclick='gotoPage(" +
      sPg +
      ")'>" +
      i.toString(10) +
      "</span>";

    if (Math.floor(i / 2) * 2 == i) {
      // even number
      sRetStr += ".";
    }
  }

  return sRetStr;
}

function changeSort() {
  SideIndex.sort = !SideIndex.sort;

  _E("CheckSort").checked = SideIndex.sort;
  _E("idIndex").innerHTML = SideIndex.getHTML();
}

var SideIndex = {
  sort: false,

  getHTML: function () {
    var sHTML = "";
    var n, i;

    if (this.sort && this.sortMap == undefined) {
      this.sortMap = _S.sorted_chapters.split(",");
    }

    var MemPercent = AllSuraMemPercent();

    for (n = 1; n <= 114; n++) {
      if (this.sort) {
        i = ToInt(this.sortMap[n - 1]);
      } else {
        i = n;
      }

      var suraPercent = MemPercent[i - 1];
      var sHREF = "?s=" + i.toString();

      sHTML +=
        "<div class='suraLink' onclick=\"window.location.href='" +
        sHREF +
        "'\">";

      if (suraPercent > 0) {
        sHTML +=
          "<div class='memChart' style='width:" +
          suraPercent +
          "%'>" +
          i.toStringEx(3) +
          "&nbsp;" +
          gStrings.sura_names[i - 1] +
          "</div>";
      } else {
        sHTML += i.toStringEx(3) + "&nbsp;" + gStrings.sura_names[i - 1];
      }

      sHTML += "</div>";
    }

    return sHTML;
  },

  updateUI: function () {
    _E("idIndex").innerHTML = this.getHTML();
  },
};

function getWindowClientSize() {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  };
}

function getSuraFrameSize() {
  var wsize = getWindowClientSize();

  return {
    width: wsize.width - 120 - (DU.isShown("TafseerFrame") ? Tafseer.width : 0),
    height: wsize.height - 80,
  };
}

function updateLayout() {
  var wsize = getSuraFrameSize();
  _E("idSideIndex").style.height = wsize.height.toString() + "px";

  var suraFrame = _E("idSuraFrame");
  if (suraFrame) {
    suraFrame.style.height = wsize.height.toString() + "px";
    //suraFrame.style.width	= wsize.width.toString() + "px";
  }

  _E("TafseerData").style.height = (wsize.height - 20).toString() + "px";
}

function initPage() {
  var sura = parseInt(U.param("s", "1"), 10);
  var aya = (gAyaNo = parseInt(U.param("a", "1"), 10));

  var mytitle =
    _S.holy_quran + " - " + _S.sura + " " + gStrings.sura_names[sura - 1];

  if (gAyaNo > 1) {
    mytitle += _S.verse + " - " + aya;
  }

  document.title = mytitle;

  sura_page = "/qtext/sura_" + sura.toStringEx(3) + ".php";

  var urlInfo = window.location.href.split("?");

  var wsize = getSuraFrameSize();

  _E("idSideIndex").style.height = wsize.height.toString() + "px";

  //if( urlInfo.length>1 ) {
  //	sura_page += "?" + urlInfo[1];
  //}
  //_E("SuraFrameContainer").innerHTML =
  //	"<iframe frameborder='0' id='idSuraFrame' name='SuraFrame' src='" + sura_page + "' " +
  //	" style='height:" + wsize.height + "px;width:" + wsize.width.toString() + "px'></iframe>"

  _E("SuraFrameContainer").innerHTML =
    "<div id='idSuraFrame'><img src='" +
    gImgHost +
    "/images/wait.gif'>&nbsp;" +
    _S.loading +
    "...</div>";

  ScriptLoader.loadJScript(
    gSuraTextHost + sura_page,
    function () {
      _E("idSuraFrame").innerHTML = gResponseHTML;
      initSura(_E("idSuraFrame"));
      updateLayout();
    },
    "gResponseHTML"
  );

  window.onresize = updateLayout;

  window.name = "quran";
}

var bShowTafseer = true;

var Tafseer = {
  //source:"KATHEER",
  baseURL: "/tafseer/",
  width: 280,

  gotoAya: function () {
    GotoAya(this.aya);
  },

  show: function (aya, source) {
    DU.show("TafseerFrame");
    updateLayout();
    this.loadAya(aya, source);
  },

  nextAya: function () {
    this.loadAya(this.aya + 1);
  },

  prevAya: function () {
    if (this.aya > 1) {
      this.loadAya(this.aya - 1);
    }
  },

  chgSource: function (source) {
    this.loadAya(undefined, source);
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
    if (this.isTafseer()) {
      return (
        gTafBase +
        _E("SelTaf").value +
        "/" +
        sura.toStringEx(3) +
        aya.toStringEx(3) +
        ".html"
      );
    } else {
      //return( "http://www.reciter.org/" + _E("SelTaf").value + "/" + sura.toStringEx(3) + aya.toStringEx(3) + ".html" );
      return (
        "/cgi-bin/get_db_taf.pl?src=" +
        _E("SelTaf").value +
        "&s=" +
        sura +
        "&a=" +
        aya
      );
    }
  },

  loadAya: function (aya, source) {
    if (Defined(aya)) {
      this.aya = parseInt(aya, 10);
    }

    if (Defined(source)) {
      CK.set("taf", source, true);
      this.source = source;
    } else {
      this.source = CK.get("taf", "KATHEER");
    }

    _E("SelTaf").value = this.source;
    _E("TafAya").innerHTML = this.aya.toString();

    var pageURL = this.getPageURL(gSuraNo, this.aya);

    /*if(this.isTafseer()){
			Tafseer.setData( _S.loading );

			U.httpGet( 
				pageURL, 
				function(sHTML){
					var taf = sHTML.substring( 
							sHTML.indexOf("<body>") + 6, 
							sHTML.indexOf("</body>") 
						).replace(/border\=1/gi,"");;
					
					Tafseer.setData( taf );
				},
				null,
				function(resError){
					if(_S[ "Err" + resError.status ] != undefined ){
						Tafseer.setData( 
							"<div class='litePadding'><a href='javascript:' onclick='Tafseer.loadAya()'>" + 
								_S[ "Err" + resError.status ] + 
							"</a></div>"
						);
					}else{
						Tafseer.setData( _S.page_load_error );
					}
				}
			);
		}else*/ {
      Tafseer.setData(
        "<iframe frameborder='0' class='translation_frame' src='" +
          pageURL +
          "'></iframe>"
      );
    }
  },

  setData: function (sData) {
    _E("TafseerData").innerHTML = sData;
    _E("TafseerData").scrollTop = 0;
    //window.setTimeout("Tafseer.gotoAya()",5);
  },

  close: function () {
    DU.hide("TafseerFrame");
    updateLayout();
  },
};

function SetRTLDirection() {}

function HideTafseer() {}

function onMouseOverChartAya(sura, aya) {}
