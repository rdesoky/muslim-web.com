var gCgiLocation = "/cgi-bin";

var gDataResponse = "no_data";

function SetHTML(sID, sHTML) {
  var el = document.getElementById(sID);

  if (el) {
    el.innerHTML = sHTML;
  }
}

function writeCookie(name, value) {
  document.cookie =
    name + "=" + value + "; expires=Mon, 31 Dec 2020 23:59:59 GMT;";
}

function getCookie(name, default_value) {
  var mycookies = document.cookie.split(";" + " ");

  for (var i = 0; i < mycookies.length; i++) {
    var mycookie = mycookies[i].split("=");

    if (mycookie[0] == name) {
      if (mycookie.length > 1) {
        return mycookie[1];
      } else {
        return true;
      }
    }
  }

  if (Defined(default_value)) {
    return default_value;
  }

  return "";
}

/*

function LoadData( sURL, sOnLoadEvent )

{

	var myScript  = document.createElement("script"); 

	myScript.type = "text/javascript"; 

	myScript.src  = gCgiLocation + "/js_load_utf8.pl?url=" + escape( sURL ) + "&callback=" + escape( sOnLoadEvent ) ;

	var head = document.getElementsByTagName("head")[0];

	head.insertBefore( myScript, head.firstChild );

	//document.getElementsByTagName("head")[0].appendChild( myScript );

}

*/

var re, jsr;

function LoadJSON(sURL, callback, dataKey) {
  var myScript = document.createElement("script");

  myScript.type = "text/javascript";

  myScript.src = sURL;

  var head =
    document.getElementsByTagName("head")[0] || document.documentElement;

  var done = false;

  myScript.onload = myScript.onreadystatechange = function () {
    if (
      !done &&
      (!this.readyState ||
        this.readyState === "loaded" ||
        this.readyState === "complete")
    ) {
      done = true;

      if (callback) {
        var data = dataKey ? window[dataKey] : re;

        callback(data);
      }

      // Handle memory leak in IE

      myScript.onload = myScript.onreadystatechange = null;

      if (head && myScript.parentNode) {
        head.removeChild(myScript);
      }
    }
  };

  head.insertBefore(myScript, head.firstChild);
}

/*

function LoadDataEx( sURL, callback )

{

	var id = LoadDataEx.id = LoadDataEx.id ? LoadDataEx.id + 1 : 1;

	LoadDataEx["callback_" + id] = callback;

	LoadData( sURL, "LoadDataEx.callback_" + id + ".apply(window,[gDataResponse]);delete LoadDataEx.callback_" + id );

}



function LoadJSONP( sURL, sOnLoadEvent )

{

	var curr_params = "";

	var myScript  = document.createElement("script"); 

	myScript.type = "text/javascript"; 



	var curr_url = window.location.href.split('?');

	if( curr_url.length > 1 ){

		curr_params = "&" + curr_url[1].split('#')[0];

	}

	myScript.src  = sURL + curr_params + "&" + (new Date()).getTime() + "&jsp=" + escape( sOnLoadEvent ) ;

	var head = document.getElementsByTagName("head")[0];

	head.insertBefore( myScript, head.firstChild );

	//document.getElementsByTagName("head")[0].appendChild( myScript );

}



function LoadJSON( sURL, callback ){

	var id = LoadJSON.id = LoadJSON.id ? LoadJSON.id + 1 : 1;

	LoadJSON["callback_" + id] = callback;

	LoadJSONP( sURL, "LoadJSON.callback_" + id + ".apply(window,[jsr]);delete LoadJSON.callback_" + id );

}

*/

function Defined(an_object) {
  return typeof an_object != "undefined";
}

Number.prototype.toStringEx = function (minLen) {
  var retValue = this.toString(10);

  if (minLen > retValue.length) {
    retValue = "0".repeat(minLen - retValue.length) + retValue;
  }

  return retValue;
};

String.prototype.repeat = function (n) {
  return new Array(n + 1).join(this);
};

String.prototype.isNumber = function () {
  return this.search(/^\d+$/) != -1;
};

function _E(sID) {
  return document.getElementById(sID);
}

function StopInterval(sHandle, context) {
  if (!Defined(context)) {
    context = window;
  }

  if (Defined(context[sHandle]) && context[sHandle] != 0) {
    window.clearInterval(context[sHandle]);

    context[sHandle] = 0;
  }
}

function MakePlainText(sInput) {
  var sRetText = sInput;

  sRetText = sRetText.replace(
    /(\s|[\u064B-\u0652]|[\x21-\x2F]|[\x3A-\x40]|[\x5B-\x60]|[\x7B-\xA0])/g,
    ""
  );

  sRetText = sRetText.replace(/[\u0622\u0623\u0625]/g, "\u0627");

  sRetText = sRetText.replace(/\u0629/g, "\u0647");

  sRetText = sRetText.replace(/\u0649/g, "\u064A");

  sRetText = sRetText.replace(/[\u0624\xu0626]/g, "\u0621");

  return sRetText;
}

function compairText(sFirst, sSecond) {
  // returns -1 if strings are matching or offset of the first mismatch

  var sPlainFirst = MakePlainText(sFirst);

  var sPlainSecond = MakePlainText(sSecond);

  for (
    nFirst = 0, nSecond = 0;
    nFirst < sFirst.length && nSecond < sPlainSecond.length;
    nFirst++, nSecond++
  ) {
    while (nFirst < sFirst.length) {
      var sPlainChar = MakePlainText(sFirst.substr(nFirst, 1));

      if (sPlainChar.length) {
        if (sPlainChar != sPlainSecond.substr(nSecond, 1)) {
          return nFirst;
        }

        break;
      }

      nFirst++;
    }
  }

  if (sPlainFirst.length == sPlainSecond.length) return -1;
  else return nFirst;
}

function GetXMLHTTPControl() {
  var httpControl;

  if (window.XMLHttpRequest) {
    try {
      httpControl = new XMLHttpRequest();
    } catch (e) {
      httpControl = false;
    }
  } else if (window.ActiveXObject) {
    // branch for IE/Windows ActiveX version

    try {
      httpControl = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        httpControl = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {
        httpControl = false;
      }
    }
  }

  return httpControl;
}

var DU = {
  show: function (sIDs) {
    var aEl = sIDs.split(",");

    for (var id in aEl) {
      _E(aEl[id]).style.display = "";
    }
  },

  hide: function (sIDs) {
    var aEl = sIDs.split(",");

    for (var id in aEl) {
      _E(aEl[id]).style.display = "none";
    }
  },

  applyStyles: function (el, styles) {
    for (var attr in styles) {
      el.style[attr] = styles[attr];
    }
  },
};

function int(sData) {
  if (Defined(sData)) {
    return parseInt(sData, 10);
  }

  return 0;
}

var InstallSpin = function (eText, min, max) {
  eText.setAttribute("min", min);

  eText.setAttribute("max", max);

  var lastGoodValue = eText.value;

  var eParent = eText.parentNode;

  var eRoot = eParent.insertBefore(document.createElement("span"), eText);

  eRoot.appendChild(eText);

  var spinImage = eRoot.appendChild(document.createElement("img"));

  var eMap = eRoot.appendChild(document.createElement("map"));

  eMap.setAttribute("name", eText.id + "_map");

  spinImage.setAttribute("usemap", "#" + eText.id + "_map");

  var upArea = eMap.appendChild(document.createElement("area"));

  var downArea = eMap.appendChild(document.createElement("area"));

  upArea.coords = "0,0,15,8";

  downArea.coords = "0,8,15,16";

  var startUp = function () {
    moveUp();

    stopInterval("up");

    intervals["up"] = setTimeout(function () {
      intervals["up"] = setInterval(moveUp, 100);
    }, 300);
  };

  var startDown = function () {
    moveDown();

    stopInterval("down");

    intervals["down"] = setTimeout(function () {
      intervals["down"] = setInterval(moveDown, 100);
    }, 300);
  };

  var moveUp = (eText.increment = function () {
    var currVal = parseInt(eText.value, 10);

    if (currVal < parseInt(eText.getAttribute("max"), 10)) {
      lastGoodValue = eText.value = (currVal + 1).toString();

      return true;
    }

    return false;
  });

  var moveDown = (eText.decrement = function () {
    var currVal = parseInt(eText.value, 10);

    if (currVal > parseInt(eText.getAttribute("min"), 10)) {
      lastGoodValue = eText.value = (currVal - 1).toString();

      return true;
    }

    return false;
  });

  var intervals = {
    up: 0,

    down: 0,
  };

  var stopInterval = function (id) {
    if (intervals[id]) {
      clearInterval(intervals[id]);

      intervals[id] = 0;

      spinImage.setAttribute("src", "/images/spin_btns.gif");
    }
  };

  upArea.onmousedown = function (e) {
    startUp();

    spinImage.setAttribute("src", "/images/spin_btns_up.gif");
  };

  upArea.onmouseup = upArea.onmouseout = function (e) {
    stopInterval("up");
  };

  downArea.onmousedown = function (e) {
    startDown();

    spinImage.setAttribute("src", "/images/spin_btns_down.gif");
  };

  downArea.onmouseup = downArea.onmouseout = function (e) {
    stopInterval("down");
  };

  DU.applyStyles(spinImage, {
    borderWidth: "0px",

    backgroundColor: "#DDDDDD",

    verticalAlign: "top",
  });

  DU.applyStyles(eRoot, {
    display: "inline-block",

    background: "silver",

    padding: "1px",

    height: "16px",

    whiteSpace: "nowrap",
  });

  DU.applyStyles(eText, {
    height: "16px",

    borderWidth: "0px",

    padding: "0px",
  });

  spinImage.setAttribute("src", "/images/spin_btns.gif");

  eText.onchange = function (e) {
    var max = parseInt(this.getAttribute("max"), 10);

    var min = parseInt(this.getAttribute("min"), 10);

    if (this.value.isNumber()) {
      if (parseInt(this.value, 10) < min) {
        this.value = min;
      }

      if (parseInt(this.value, 10) > max) {
        this.value = max;
      }

      lastGoodValue = this.value;
    } else {
      this.value = lastGoodValue;
    }
  };
};

function ForceArabicKeys(el) {
  el.onkeypress = function (evt) {
    if (!Defined(evt)) {
      evt = event;
    }

    var charCode = evt.cancelable ? evt.charCode : evt.keyCode;

    if (evt.keyCode == 13) {
      MemExercise.check();

      evt.returnValue = false;

      return;
    }

    if (Defined(key_map[charCode])) {
      if (evt.cancelable && evt.initKeyEvent != undefined) {
        // firefox

        var new_event = document.createEvent("KeyboardEvent");

        new_event.initKeyEvent(
          "keypress", //  in DOMString typeArg

          true, //  in boolean canBubbleArg,

          true, //  in boolean cancelableArg,

          null, //  in nsIDOMAbstractView viewArg,  Specifies UIEvent.view. This value may be null.

          false, //  in boolean ctrlKeyArg,

          false, //  in boolean altKeyArg,

          false, //  in boolean shiftKeyArg,

          false, //  in boolean metaKeyArg,

          0, //  in unsigned long keyCodeArg,

          key_map[charCode]
        );

        evt.preventDefault();

        this.dispatchEvent(new_event);
      } else {
        //IE

        evt.keyCode = key_map[charCode];
      }
    } else if (evt.keyCode != 32) {
      //alert(evt.keyCode);
    }

    //this.fireEvent("onkeypress", evt);

    //return false;
  };
}

var key_map = {
  39: 1591, // '

  41: 40, // (

  40: 41, // )

  44: 1608, // ,

  46: 1586, // .

  47: 1592, // /

  59: 1603, // ;

  63: 1567, // ?

  91: 1580, // [

  93: 1583, // ]

  96: 1584, // `

  123: 60, // {

  125: 62, // }

  65: 1588, //A

  97: 1588, //a

  66: 1575, //b

  98: 1575, //b

  67: 1572, //c

  99: 1572, //c

  68: 1610, //d

  100: 1610, //d

  69: 1579, //e

  101: 1579, //e

  70: 1576, //f

  102: 1576, //f

  71: 1604, //g

  103: 1604, //g

  72: 1571, //H

  104: 1575, //h

  73: 1607, //i

  105: 1607, //i

  74: 1578, //j

  106: 1578, //j

  75: 1606, //k

  107: 1606, //k

  76: 1605, //l

  108: 1605, //l

  77: 1577, //m

  109: 1577, //m

  78: 1570, //N

  110: 1609, //n

  79: 1582, //o

  111: 1582, //o

  80: 1581, //p

  112: 1581, //p

  81: 1590, //q

  113: 1590, //q

  82: 1602, //r

  114: 1602, //r

  83: 1587, //s

  115: 1587, //s

  84: 1601, //t

  116: 1601, //t

  85: 1593, //u

  117: 1593, //u

  86: 1585, //v

  118: 1585, //v

  87: 1589, //w

  119: 1589, //w

  88: 1569, //x

  120: 1569, //x

  89: 1573, //Y

  121: 1594, //y

  90: 1574, //z

  122: 1574, //z
};

var VerseNoInSura = [
  0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54,

  45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62,
  55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28,
  20,

  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
  11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

var gSuraNames = [
  "",

  "الفاتحة",
  "البقرة",
  "ال عمران",
  "النساء",
  "المائدة",
  "الانعام",
  "الاعراف",
  "الانفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "ابراهيم",
  "الحجر",

  "النحل",
  "الاسراء",
  "الكهف",
  "مريم",
  "طه",
  "الانبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",

  "السجدة",
  "الاحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الاحقاف",
  "محمد",
  "الفتح",

  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",

  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الانسان",
  "المرسلات",
  "النبا",
  "النازعات",
  "عبس",
  "التكوير",

  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الاعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",

  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الاخلاص",
  "الفلق",
  "الناس",

  "",
  "",
];
