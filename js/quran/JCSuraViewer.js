function imgBase() {
  return gImgHost || "";
}

function JCSuraViewer() {
  U.d.copyAttr(this, { suraNo: 0 });

  this.startAya = 1;
  this.endAya = 4;
  this.totalAyat = QData.sura_info[this.suraNo - 1].ac;
  this.id = "SuraViewer_" + this.suraNo;

  this.onclick = function (e) {
    var event = U.ieEvent(e);
    event.stopPropagation();
  };

  this.getActiveHTML = function () {
    this.nWidth = this.totalAyat * 2;
    return (
      "<div class='suraQViewer' style='position:absolute;'>" +
      "<table cellspacing='0' cellpadding='0'><tr>" +
      "<td cid='prevBtn'><img src=" +
      imgBase() +
      "images/prev.gif width=8 height=9></td>" +
      "<td ><div cid='meter' style='width:" +
      this.nWidth +
      "px;background-image:url(" +
      imgBase() +
      "images/schart_bg.gif);background-repeat:repeat-x;'>&nbsp;</div></td>" +
      "<td cid='nextBtn'><img src=" +
      imgBase() +
      "images/next.gif width=8 height=9></td>" +
      "</tr></table>" +
      "<div style='font-size:8px;white-space:nowrap:'>" +
      "<span cid='startAya' style='width:0px;' id=StartAya_" +
      this.sID +
      "></span>" +
      "<span DHorz=1 mClass='JCDragDrop' ondrop='" +
      this.sID +
      ".onDropStart()'><img border=0 src='" +
      imgBase() +
      "images/start_aya.gif?v=2' width=8 height=16 style='cursor:E-resize'></span>" +
      "<span cid='ayatCount' style='width:8px'></span>" +
      "<span DHorz=1 mClass='JCDragDrop' ondrop='" +
      this.sID +
      ".onDropEnd()'><img border=0 src='" +
      imgBase() +
      "images/end_aya.gif?v=2' width=8 height=16 style='cursor:W-resize'></span>" +
      "</div>" +
      "</div>" +
      "<div style='height:34px;background:silver;'></div>" +
      "<div class=suraQViewerText id=TextViewer_" +
      this.suraNo +
      "></div>" +
      "<div mClass='JCMenuItem' bullet='open_book.gif' onclick='QViewer.gotoPage(" +
      this.suraNo +
      ")'>إفتح المصحف للقراءة</div>"
    );
  };

  this.onAddToDocument = function () {
    var self = this;

    this.$ = U.d.elementsByCID(this);

    this.$.meter.onmousemove = function (e) {
      self.onMouseMoveAya(e);
    };

    this.$.meter.onclick = function (e) {
      self.onClickAya(e);
    };

    this.$.prevBtn.onclick = function (e) {
      self.onClickPrev(e);
    };

    this.$.nextBtn.onclick = function (e) {
      self.onClickNext(e);
    };

    this.showCurrRange();
  };

  this.validateRange = function () {
    if (this.startAya < 1) this.startAya = 1;
    if (this.startAya > this.totalAyat) this.startAya = this.totalAyat;

    if (this.endAya < 1) this.endAya = 1;
    if (this.endAya > this.totalAyat) this.endAya = this.totalAyat;

    if (this.startAya > this.endAya) this.endAya = this.startAya;
  };

  this.onDropStart = function () {
    this.startAya -= document.dragGost.dragSource.shiftX / 2;
    this.showCurrRange();
  };

  this.onDropEnd = function () {
    this.endAya -= document.dragGost.dragSource.shiftX / 2;
    this.showCurrRange();
  };

  this.onClickNext = function () {
    //event.cancelBubble = true;
    var nAyatCount = this.endAya - this.startAya;
    this.startAya = this.endAya + 1;
    this.endAya = nAyatCount + this.startAya;

    this.showCurrRange();
  };

  this.onClickPrev = function (e) {
    //event.cancelBubble = true;

    var nAyatCount = this.endAya - this.startAya;

    this.startAya -= nAyatCount;

    if (this.startAya < 1) this.startAya = 1;

    this.endAya = nAyatCount + this.startAya;

    this.showCurrRange();
  };

  this.onMouseMoveAya = function (e) {
    var event = U.ieEvent(e);
    var mouseX = parseInt((this.nWidth - event.offsetX) / 2);
    event.srcElement.title = "انقل المجال الى آية: " + mouseX;
  };

  this.onClickAya = function (e) {
    var event = U.ieEvent(e);

    var nAyatCount = this.endAya - this.startAya;

    this.startAya = parseInt((this.nWidth - event.offsetX) / 2);

    if (this.startAya < 1) {
      this.startAya = 1;
    }

    this.endAya = this.startAya + nAyatCount;

    this.showCurrRange();
  };

  //	this.onClickSlider = function( bMoveOnly ){
  //		//event.cancelBubble = true;
  //		if(!this.eSlider){
  //			this.eSlider = document.getElementById( "Slider_" + this.sID );
  //		}
  //		if(!this.eAyatCount){
  //			this.eAyatCount = document.getElementById("AyatCount_" + this.sID);
  //		}
  //		if(!this.eStartAya){
  //			this.eStartAya = document.getElementById("StartAya_" + this.sID );
  //		}
  //		var nAya, sPrefix;
  //
  //		//window.top.document.title = event.srcElement.id;
  //
  //		if(event.srcElement == this.eSlider){
  //			nAya = parseInt( ( this.nWidth + 12 - event.offsetX ) / 2 );
  //			sPrefix = "ضع نهاية المجال عند آية: ";
  //		}
  //		else if(event.srcElement == this.eAyatCount)
  //		{
  //			nAya = this.endAya - parseInt( ( event.offsetX + 1 ) / 2 );
  //			sPrefix = " ضع نهاية المجال عند آية: ";
  //		}
  //		else if(event.srcElement == this.eStartAya)
  //		{
  //			nAya = this.startAya - 5 - parseInt( event.offsetX / 2 );
  //			sPrefix = "ضع بداية المجال عند آية: ";
  //		}
  //		else
  //		{
  //			this.eSlider.title = "";
  //			return;
  //		}
  //
  //		if( nAya < 1 ){
  //			nAya = 1;
  //		}
  //
  //		if(bMoveOnly){
  //			event.srcElement.title = sPrefix + nAya;
  //		}
  //		else
  //		{
  //			if( nAya < this.startAya ){
  //				this.startAya = nAya;
  //			}
  //			else{
  //				this.endAya = nAya;
  //			}
  //			this.showCurrRange();
  //		}
  //	};

  this.showCurrRange = function () {
    this.validateRange();
    this.showRange(this.startAya, this.endAya);

    this.$.startAya.style.width = (this.startAya - 1) * 2 + "px";

    var nAyatCount = this.endAya - this.startAya;
    this.$.ayatCount.style.width = (nAyatCount * 2).toString(10) + "px";
  };

  this.showRange = function (start, end) {
    this.showText(
      "<div align=center><img src=" +
        imgBase() +
        "images/wait.gif width=32 height=32></div>"
    );
    LoadData(
      "/cgi-bin/get_sura_text.pl?s=" +
        (this.suraNo - 1) +
        "&f=" +
        start +
        "&t=" +
        end +
        "&p=1",
      "U.DOM('" + this.id + "').showText(gDataResponse)",
      true
    );
  };

  this.showText = function (sText) {
    if (!this.textViewer) {
      this.textViewer = document.getElementById("TextViewer_" + this.suraNo);
    }
    if (this.textViewer) {
      this.textViewer.innerHTML = sText;
    }
  };
}
