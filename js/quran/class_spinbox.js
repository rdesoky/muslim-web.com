/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Network Associates Corporation
// Virus Scan Online Spinbox class
/////////////////////////////////////////////////////////////////////////////////
// Author: Ramy Eldesoky
// Created: 3/3/2003
// Updated: 2/14/2009
/////////////////////////////////////////////////////////////////////////////////
// To use this class, the web page folder should contain the following images:
// spin_btns.gif, spin_btns_up.gif, spin_btns_down.gif
/////////////////////////////////////////////////////////////////////////////////

var JCSpinEdit = DefineJClass({
  init: function () {
    this.eIndex = ++JCSpinEdit.editors;
    Utils.d.copyAttr(this, {
      mName: "sedit",
      min: 0,
      max: 10,
      inc: 1,
      value: 1,
    });
    this.min = parseInt(this.min, 10);
    this.max = parseInt(this.max, 10);
    this.inc = parseInt(this.inc, 10);
  },

  mGetHTML: function () {
    return (
      "<span style='font-size:13px;border:solid 1px #7F9DB9;'>" +
      "<input cid=editor type=editbox id=idSpinBoxEdit " +
      " value='" +
      this.value +
      "' " +
      " name=" +
      this.mName +
      " style='height:16px;vertical-align:top;border:solid 1px transparent;font-size:11px;width:25px'>" +
      "<map name='spinMap" +
      this.eIndex +
      "' >" +
      "<area cid=uBtn shape=rectangle COORDS='0,0,15,8' ><area cid=dBtn shape=rectangle COORDS='0,8,15,16'>" +
      "</map>" +
      "<img cid=image border=0 src=/images/spin_btns.gif style='background:silver;vertical-align:top;' usemap=#spinMap" +
      this.eIndex +
      " >" +
      "</span>"
    );
  },

  getValue: function () {
    return parseInt(this.ctrls.editor.value, 10);
  },

  setValue: function (value) {
    this.ctrls.editor.value = value;
  },

  onSpinUp: function () {
    var newValue = this.getValue() + this.inc;
    if (newValue <= this.max) {
      this.setValue(newValue);
    }
  },

  onSpinDown: function () {
    var newValue = this.getValue() - this.inc;
    if (newValue >= this.min) {
      this.setValue(newValue);
    }
  },

  validateValue: function () {
    var currValue = this.getValue();
    return currValue >= this.min && currValue <= this.max;
  },

  scroll: function (sFunction) {
    var self = this;
    this.hTimer = window.setInterval(function () {
      self[sFunction]();
    }, 100);
  },

  onAddToDocument: function () {
    var self = this;
    this.ctrls = Utils.d.elementsByCID(this);

    this.ctrls.editor.onkeydown = function (e) {
      var event = Utils.ieEvent(e);
      if (38 == event.keyCode) {
        // key up
        self.onSpinUp();
      } else if (40 == event.keyCode) {
        // key down
        self.onSpinDown();
      }
    };

    this.ctrls.editor.onkeypress = function (e) {
      var event = Utils.ieEvent(e);

      if (event.charCode && (event.charCode < 48 || event.charCode > 57)) {
        event.preventDefault();
      }
    };
    this.ctrls.editor.onblur = function (e) {
      var currValue = self.getValue();
      if (currValue < self.min) {
        self.setValue(self.min);
      }
      if (currValue > self.max) {
        self.setValue(self.max);
      }
    };

    this.ctrls.uBtn.onclick = function (e) {
      if (self.hTimer) {
        window.clearTimeout(self.hTimer);
        self.hTimer = 0;
      }
      self.ctrls.image.src = gImgHost + "images/spin_btns.gif";
    };

    this.ctrls.uBtn.onmousedown = function (e) {
      if (self.disabled == true) return;

      self.onSpinUp();
      self.ctrls.image.src = gImgHost + "images/spin_btns_up.gif";
      self.hTimer = window.setTimeout(function () {
        self.scroll("onSpinUp");
      }, 500);
    };
    this.ctrls.uBtn.onmouseout = this.ctrls.uBtn.onclick;

    this.ctrls.dBtn.onclick = this.ctrls.uBtn.onclick;
    this.ctrls.dBtn.onmousedown = function (e) {
      if (self.disabled == true) return;

      self.onSpinDown();
      self.ctrls.image.src = gImgHost + "images/spin_btns_down.gif";
      self.hTimer = window.setTimeout(function () {
        self.scroll("onSpinDown");
      }, 500);
    };
    this.ctrls.dBtn.onmouseout = this.ctrls.uBtn.onclick;
  },
});

JCSpinEdit.editors = 0;
