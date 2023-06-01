var gCgiLocation = "/cgi-bin"; //"http://cgi.muslim-web.com/cgi-bin";

function SetHTML(sID, sHTML) {
  document.getElementById(sID).innerHTML = sHTML;
}

function StopEvent(evt) {
  if (evt) {
    evt.cancelBubble = true;
  } else if (event) {
    event.cancelBubble = true;
  }
}

function SetEventObject(args) {
  if (args.length > 0) {
    event = args[0];
    if (event.relatedTarget) {
      event.toElement = event.relatedTarget;
    }
  }
}

function uncompressMem(memorized) {
  //alert("uncompress");
  var newMemorized = "";

  if (memorized.length == 0) {
    for (i = 0; i < 114; i++) newMemorized += "$";

    return newMemorized;
  }

  mem_suras = memorized.split("$");

  for (s = 0; s < mem_suras.length; s++) {
    mem_ayas = mem_suras[s].split("|");

    mem_suras[s] = "";

    for (a = 0; a < mem_ayas.length; a++) {
      if (mem_ayas[a].length == 0) continue;

      range = mem_ayas[a].split(",");

      if (range.length > 1) {
        mystart = parseInt(range[0], 10);
        myend = parseInt(range[1], 10);

        for (r = mystart; r <= myend; r++) {
          if (mem_suras[s].length > 0) mem_suras[s] += "|";

          mem_suras[s] += r;
        }
      } else {
        myAyaNo = parseInt(mem_ayas[a], 10);

        if (mem_suras[s].length > 0) mem_suras[s] += "|";

        mem_suras[s] += myAyaNo;
      }
    }

    if (s > 0) newMemorized += "$";

    newMemorized += mem_suras[s];
  }

  return newMemorized;
}

function compressMem(memorized) {
  newMemorized = "";
  mem_suras = memorized.split("$");

  for (s = 0; s < mem_suras.length; s++) {
    mem_ayas = mem_suras[s].split("|");

    startAya = parseInt(mem_ayas[0]);
    range = 0;
    mem_suras[s] = "";

    for (a = 0; a < mem_ayas.length; a++) {
      if (mem_ayas[a].length == 0) continue;

      myAyaNo = parseInt(mem_ayas[a], 10);
      if (myAyaNo - startAya == range + 1) {
        //
        range++;
      } else {
        if (range > 0) {
          mem_suras[s] += "," + (startAya + range);
        }
        if (mem_suras[s].length > 0) mem_suras[s] += "|";

        mem_suras[s] += myAyaNo;

        startAya = myAyaNo;
        range = 0;
      }
    }

    if (range > 0) {
      mem_suras[s] += "," + (startAya + range);
    }

    if (s > 0) newMemorized += "$";
    newMemorized += mem_suras[s];
  }
  //alert(newMemorized);
  return newMemorized;
  //return memorized;
}

function parameter(name, default_value) {
  var arg = name + "=";
  var myurl = window.location.href.split("?");

  if (myurl.length > 1) {
    var params = myurl[1].split("&");

    for (var i = 0; i < params.length; i++) {
      if (params[i].indexOf(arg) == 0) {
        var retVal = params[i].substring(arg.length, params[i].length);
        return myDecodeURI(retVal);
      }
    }
  }

  if (default_value) {
    return default_value;
  }

  return "";
}

function myDecodeURI(sText) {
  //alert("debug");
  var sRetText = "";

  for (var i = 0; i < sText.length; i++) {
    var sCurrChar = sText.substring(i, i + 1);

    if (sCurrChar == "%") {
      var sCharCode = sText.substring(i + 1, i + 3);
      var charCode = parseInt(sCharCode, 16);
      sCurrChar = String.fromCharCode(charCode);
      i += 2;
    } else if (sCurrChar == "+") {
      sCurrChar = " ";
    }

    sRetText += sCurrChar;
  }
  return ConvertCP1256ToUnicode(sRetText);
}
//------------------------------------------------------------------------------
function filterQuery(filter) {
  var newQuery = "";

  var params = filter.split(",");

  for (var i = 0; i < params.length; i++) {
    var value = param(params[i]);

    if (value.length > 0) {
      if (newQuery.length > 0) {
        newQuery += "&" + params[i] + "=" + escape(value);
      } else {
        newQuery = params[i] + "=" + escape(value);
      }
    }
  }

  return newQuery;
}
function setCookie(name, value) {
  document.cookie =
    name + "=" + value + "; path=/; expires=Mon, 31 Dec 2013 23:59:59 GMT;";
  //TODO: check the problem with frames alert( "[" + name + ":" + value + "]" + document.cookie );
}

function writeCookie(name, value) {
  setCookie(name, value);
}

function readCookie(name) {
  //if( document.location.pathname.indexOf( "/", 1 ) >= 0 ){// subfolders are not allowed try the parent frame
  //	return window.parent.getCookie(name);
  //}

  var retVal = getCookie(name);

  return retVal;
}

function getCookie(name, default_value) {
  var mycookies = document.cookie.split(";" + " ");

  for (var i = 0; i < mycookies.length; i++) {
    var mycookie = mycookies[i].split("=");
    if (mycookie[0] == name) {
      var stub = "_" + name;
      var retVal = "";

      if (mycookie.length > 1) {
        var stub_index = retVal.indexOf(stub);

        retVal = mycookie[1];

        if (stub_index > -1 && stub_index == retVal.length - stub.length) {
          retVal = retVal.substring(0, retVal.length - stub.length);
        }
      }
      return retVal;
    }
  }

  if (default_value) {
    return default_value;
  }

  return "";
}

function QueryToCookies() {
  if (location.search.length > 1 && document.cookie.length == 0) {
    mycookies = location.search.substring(1).split(";");

    for (i = 0; i < mycookies.length; i++) {
      document.cookie =
        mycookies[i] + ";expires=Mon, 31 Dec 2006 23:59:59 GMT;";
    }
  }
}

function toStringEx(value, length) {
  var theString;
  theString = value.toString(10);
  while (theString.length < length) {
    theString = "0" + theString;
  }
  return theString;
}

function createArray(n) {
  this.length = n;
  return this;
}

function GetIEVersion() {
  var userAgent, ieLocation, retValue;
  var ieSignature;

  retValue = 0;
  ieSignature = "MSIE";

  userAgent = navigator.userAgent;

  ieLocation = userAgent.search(ieSignature);

  if (ieLocation >= 0) {
    var userAgentTokens, sPostFix;

    userAgentTokens = userAgent.split(")");

    if (userAgentTokens.length > 0) {
      sPostFix = userAgentTokens[1];
    }

    if (0 == sPostFix.length) {
      // no third party browser signature
      ieLocation = ieLocation + ieSignature.length + 1; // skip the signature to read the version number

      userAgent = userAgent.substr(ieLocation);

      retValue = parseFloat(userAgent);
    }
  }

  return retValue;
}

function MessageBox(sText, sTitle) {
  var args = new Object();

  args.Title = sTitle;
  args.Text = sText;

  window.showModalDialog(
    "msg.htm",
    args,
    "dialogHeight: 120px; dialogWidth: 300px; dialogTop: px; dialogLeft: px; edge: Raised; center: Yes; help: Yes; resizable: No; status: No;scroll: No"
  );
}

function getBaseURL(sURL) {
  var baseURL;

  if (sURL == null) sURL = window.location.href;
  baseURL = new String(sURL);
  // eleminate the quer
  baseURL = baseURL.split("?")[0];
  baseURL = baseURL.substring(0, baseURL.lastIndexOf("/"));

  return baseURL;
}

function getBasePath(sURL) {
  var basePath;
  var pathIndex;

  if (sURL == null) sURL = window.location.href;

  basePath = getBaseURL(sURL);
  pathIndex = basePath.indexOf("/", 8);

  if (-1 == pathIndex) return "/";

  basePath = basePath.substring(pathIndex) + "/";

  return basePath;
}

function CPageParamsItem(key) {
  return this.values[key];
}

function CPageParams() {
  var i;

  this.keys = [];
  this.values = [];
  this.item = CPageParamsItem;

  var aUrlItems = window.location.href.split("?");

  if (aUrlItems.length < 2) {
    return this;
  }
  var sQuery = aUrlItems[1];
  var aQueryItems = sQuery.split("&");

  for (i = 0; i < aQueryItems.length; i++) {
    var aParamPair = aQueryItems[i].split("=");

    this.keys[i] = aParamPair[0];

    if (aParamPair.length > 1) {
      this.values[aParamPair[0]] = aParamPair[1];
    } else {
      this.values[aParamPair[0]] = true;
    }
  }
  return this;
}

function CDialogArgs() {
  var myArgs = window.dialogArguments.split("&");

  for (i = 0; i < myArgs.length; i++) {
    var myParamPair = myArgs[i].split("=");
    eval("this." + myParamPair[0] + '="' + myParamPair[1] + '"');
  }

  return this;
}

var gZIndex = 1;

function ShowElement(sID, delay) {
  var idElement = document.getElementById(sID);

  if (null == idElement) return;

  if (idElement.idDelayedShowHide) {
    window.clearTimeout(idElement.idDelayedShowHide);
    idElement.idDelayedShowHide = null;
  }

  if (0 == delay) {
    //idElement.style.zIndex  = gZIndex ;
    idElement.style.display = "";
    //gZIndex ++;
  } else {
    idElement.idDelayedShowHide = window.setTimeout(
      "ShowElement('" + sID + "', 0)",
      delay
    );
  }
}

function HideElement(sID, delay) {
  var idElement = document.getElementById(sID);

  if (null == idElement) return;

  if (idElement.idDelayedShowHide) {
    window.clearTimeout(idElement.idDelayedShowHide);
    idElement.idDelayedShowHide = null;
  }

  if (delay == 0) {
    idElement.style.display = "none";
  } else {
    idElement.idDelayedShowHide = window.setTimeout(
      "HideElement('" + sID + "', 0)",
      delay
    );
  }
}

function LoadXMLDoc(data, sRootNode) {
  //var xmlDoc = new ActiveXObject("Msxml2.DOMDocument");
  var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");

  xmlDoc.async = false;

  if (xmlDoc.loadXML(data)) {
    if (sRootNode && sRootNode.length > 0) {
      xmlDoc = xmlDoc.selectSingleNode(sRootNode);
    }
    return xmlDoc;
  }

  return null;
}

function openPopupWindow(x, y, width, height, sContents) {
  if (GetIEVersion() < 5.5) return null;

  var popupWindow = window.createPopup();
  if (popupWindow) {
    popupWindow.document.body.style.border = "solid black 1px";
    popupWindow.document.body.style.color = "silver";

    if (sContents && sContents.length > 0) {
      popupWindow.document.body.innerHTML = sContents;
    }
    popupWindow.show(x, y, width, height, document.body);
    return popupWindow;
  }

  return null;
}

var CP1256ToUnicode = [
  0x0000, 0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008,
  0x0009, 0x000a, 0x000b, 0x000c, 0x000d, 0x000e, 0x000f, 0x0010, 0x0011,
  0x0012, 0x0013, 0x0014, 0x0015, 0x0016, 0x0017, 0x0018, 0x0019, 0x001a,
  0x001b, 0x001c, 0x001d, 0x001e, 0x001f, 0x0020, 0x0021, 0x0022, 0x0023,
  0x0024, 0x0025, 0x0026, 0x0027, 0x0028, 0x0029, 0x002a, 0x002b, 0x002c,
  0x002d, 0x002e, 0x002f, 0x0030, 0x0031, 0x0032, 0x0033, 0x0034, 0x0035,
  0x0036, 0x0037, 0x0038, 0x0039, 0x003a, 0x003b, 0x003c, 0x003d, 0x003e,
  0x003f, 0x0040, 0x0041, 0x0042, 0x0043, 0x0044, 0x0045, 0x0046, 0x0047,
  0x0048, 0x0049, 0x004a, 0x004b, 0x004c, 0x004d, 0x004e, 0x004f, 0x0050,
  0x0051, 0x0052, 0x0053, 0x0054, 0x0055, 0x0056, 0x0057, 0x0058, 0x0059,
  0x005a, 0x005b, 0x005c, 0x005d, 0x005e, 0x005f, 0x0060, 0x0061, 0x0062,
  0x0063, 0x0064, 0x0065, 0x0066, 0x0067, 0x0068, 0x0069, 0x006a, 0x006b,
  0x006c, 0x006d, 0x006e, 0x006f, 0x0070, 0x0071, 0x0072, 0x0073, 0x0074,
  0x0075, 0x0076, 0x0077, 0x0078, 0x0079, 0x007a, 0x007b, 0x007c, 0x007d,
  0x007e, 0x007f, 0x20ac, 0x067e, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020,
  0x2021, 0x02c6, 0x2030, 0x0679, 0x2039, 0x0152, 0x0686, 0x0698, 0x0688,
  0x06af, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x06a9,
  0x2122, 0x0691, 0x203a, 0x0153, 0x200c, 0x200d, 0x06ba, 0x00a0, 0x060c,
  0x00a2, 0x00a3, 0x00a4, 0x00a5, 0x00a6, 0x00a7, 0x00a8, 0x00a9, 0x06be,
  0x00ab, 0x00ac, 0x00ad, 0x00ae, 0x00af, 0x00b0, 0x00b1, 0x00b2, 0x00b3,
  0x00b4, 0x00b5, 0x00b6, 0x00b7, 0x00b8, 0x00b9, 0x061b, 0x00bb, 0x00bc,
  0x00bd, 0x00be, 0x061f, 0x06c1, 0x0621, 0x0622, 0x0623, 0x0624, 0x0625,
  0x0626, 0x0627, 0x0628, 0x0629, 0x062a, 0x062b, 0x062c, 0x062d, 0x062e,
  0x062f, 0x0630, 0x0631, 0x0632, 0x0633, 0x0634, 0x0635, 0x0636, 0x00d7,
  0x0637, 0x0638, 0x0639, 0x063a, 0x0640, 0x0641, 0x0642, 0x0643, 0x00e0,
  0x0644, 0x00e2, 0x0645, 0x0646, 0x0647, 0x0648, 0x00e7, 0x00e8, 0x00e9,
  0x00ea, 0x00eb, 0x0649, 0x064a, 0x00ee, 0x00ef, 0x064b, 0x064c, 0x064d,
  0x064e, 0x00f4, 0x064f, 0x0650, 0x00f7, 0x0651, 0x00f9, 0x0652, 0x00fb,
  0x00fc, 0x200e, 0x200f, 0x06d2,
];

function ConvertCP1256ToUnicode(sText) {
  var sRetValue = "";

  for (var i = 0; i < sText.length; i++) {
    var charCode = sText.charCodeAt(i);
    if (charCode < 0xff) {
      charCode = CP1256ToUnicode[charCode];
    }
    sRetValue += String.fromCharCode(charCode);
  }

  return sRetValue;
}

function UnicodeCharToCP1256(aChar) {
  for (var i = 0; i < 256; i++) {
    if (aChar == CP1256ToUnicode[i]) {
      return i;
    }
  }

  return aChar;
}

function ConvertUnicodeToCP1256(sText) {
  var sRetValue = "";

  for (var i = 0; i < sText.length; i++) {
    sRetValue += String.fromCharCode(UnicodeCharToCP1256(sText.charCodeAt(i)));
  }

  return sRetValue;
}

function GetVSpacer(height) {
  return (
    "<div style='font-size:1px;height:" + height.toString() + "px'>&nbsp;</div>"
  );
}

function GetHSpacer(width) {
  return (
    "<span style='font-size:1px;width:" + width.toString() + "px'>&nbsp;</span>"
  );
}

///////////////////////////////////////////////////////
function PreloadImages(image_srcs, load_events) {
  var my_images = [];
  for (i = 0; i < image_srcs.length; i++) {
    my_images[i] = new Image();
    if (load_events && load_events[i]) {
      my_images[i].onload = load_events[i];
    }
    my_images[i].src = image_srcs[i];
  }
  return my_images;
}

var gDataResponse = "no_data";

function LoadData(sURL, sOnLoadEvent) {
  var myScript = document.createElement("script");
  //myScript.id	  = "ScriptLoader";
  myScript.type = "text/javascript";
  //set the script file name
  myScript.src =
    gCgiLocation +
    "/js_load_utf8.pl?url=" +
    escape(sURL) +
    "&callback=" +
    escape(sOnLoadEvent);
  //append the script to the document, that will execute the script
  document.body.appendChild(myScript);
}

function LoadJSONP(sURL, sOnLoadEvent) {
  var curr_params = "";
  var myScript = document.createElement("script");
  //myScript.id	  = "ScriptLoader";
  myScript.type = "text/javascript";

  var curr_url = window.location.href.split("?");
  if (curr_url.length > 1) {
    curr_params = "&" + curr_url[1].split("#")[0];
  }
  //set the script file name
  myScript.src =
    sURL +
    curr_params +
    "&" +
    new Date().getTime() +
    "&jsp=" +
    escape(sOnLoadEvent);
  //append the script to the document, that will execute the script
  document.body.appendChild(myScript);
}

function XMLDoc(xmlString) {
  var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
  xmlDoc.async = false;
  xmlDoc.loadXML(xmlString);
  return xmlDoc;
}

function StopDragging() {
  window.event.returnValue = false;
}

function DeleteArrayElements(myArray, index, count) {
  var retArray = [];

  for (i = 0; i < index; i++) {
    retArray[i] = myArray[i];
  }

  for (i = index + count; i < myArray.length; i++) {
    retArray[i - count] = myArray[i];
  }

  return retArray;
}

function IsChildOf(oChild, oParent) {
  if (!oChild || !oParent) return false;

  if (oChild == oParent) return true;

  var theParent = oChild.parentNode;
  while (theParent) {
    if (theParent == oParent) return true;

    theParent = theParent.parentNode;
  }
  return false;
}

function Defined(an_object) {
  return typeof an_object != "undefined";
}
