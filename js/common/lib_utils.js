//try{ OnLoadScriptFile("lib_utils");}catch(e){}

var gPageParams;

var gCurrShownElement;

var gUpdateMark="|u|", 
	gOriginalMark="|o|", 
	gRejectMark = "|r|",
	gCountriesXML,  gRightAlign, gLeftAlign, gMatchBotTimeXML, gStopNavigation,
	gCurrElement =1;

function CopyObject( targetObj, srcObj, bKeepExisiting )
{
	for( var item in srcObj )
	{
		if( ! bKeepExisiting || ( targetObj[item] == undefined ) )
		{
			targetObj[item] = srcObj[item];
		}
	}
}

function String_DecodeChars()
{
	var findEncodedChars = /\&\#([0-9][0-9][0-9][0-9])\;/;
	var sText = this.toString();

	while( -1 != sText.search( findEncodedChars ) )
	{
		//var nCharCode = parseInt( RegExp.$1.substr(2,4) );
		var nCharCode = parseInt( RegExp.$1 );
		sText = sText.replace( RegExp.lastMatch, String.fromCharCode( nCharCode ) );
	}

	return sText;
}


function String_ReplaceAll( sFind, sReplace )
{
	var re = RegExp( sFind , "gi" );
	return this.replace( re, sReplace );
}

function String_Trim()
{
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

function String_TrimLength(nLen, bReview, sDefaultText)
{
	var sText = this.decodeChars();

	if( nLen > 3 && sText.length > nLen ){
		sText = sText.substring( 0, nLen - 3 ) + "...";
	}
	
	if( bReview && ( sText.indexOf( gUpdateMark ) == 0 || sText.indexOf( gRejectMark ) == 0 ) ){
		sText = "<span class=not_approved>" + getString("not_approved") + "</span>";
	}

	if(sText.length)
		return sText;
	else if (sDefaultText)
		return sDefaultText;
	else
		return "";
}

CopyObject( String.prototype, {
		replaceAll: String_ReplaceAll,
		trim: String_Trim,
		trimLength: String_TrimLength,
		decodeChars: String_DecodeChars
	}
);

Date.prototype.setSQLDate = Date_SetSQLDate;

function GetRadioValue( radioSet )
{
	for(var i=0;i<radioSet.length;i++)
	{
		if(radioSet[i].checked)
		{
			return radioSet[i].value;
		}
	}
	return "";
}
function ClickChildInput( thisElement )
{
	var childInputs = thisElement.getElementsByTagName( "input" );
	if(childInputs && childInputs.length){
		childInputs[0].click();
	}
}
function Defined( an_object )
{
	return ( typeof(an_object) != "undefined" )
}

function int( sValue )
{
	return parseInt( sValue, 10 );
}

function CurrentTimeValue()
{
	return( new Date() ).getTime();
}


function  Date_SetSQLDate( SQLDateStr )
{
	SQLDateStr = SQLDateStr.replaceAll(":", " ");
	SQLDateStr = SQLDateStr.replaceAll("-", " ");

	var dateParts = SQLDateStr.split(" ");

	this.setFullYear( dateParts[0] );
	this.setMonth	( parseInt( dateParts[1], 10 ) - 1 );
	this.setDate	( dateParts[2] );

	this.setHours	( dateParts[3] ? dateParts[3] : 0 );
	this.setMinutes ( dateParts[4] ? dateParts[4] : 0 );
	this.setSeconds ( dateParts[5] ? dateParts[5] : 0 );
}


function OptimizeSpaces( sText )
{
	return sText.replace(/\s+/g," ");
}

function parameter(name)
{
	var arg = name + "=";
	var myurl = window.location.href.split('?');
	
	if (myurl.length > 1){	
		var params= myurl[1].split('&');

		for (var i = 0; i < params.length; i++)
		{
			if(params[i].indexOf(arg) == 0)
			{
				var retVal = params[i].substring(arg.length,params[i].length);
				while(retVal.indexOf("+") > 0){
					retVal = retVal.replace('+',' ');
				}
				return unescape(retVal);
			}
		}
	}
	return "";
}

function RemoveCookie(name)
{
	deleteCookie(name);
}

function WriteObjectToQueryString( obj )
{
	var sQuery = "";

	for(var item_name in obj){
		if( Defined(obj[item_name]) )
		{
			if( sQuery.length ) {
				sQuery += "&";
			}
			sQuery += item_name + "=" + obj[item_name];
		}
	}
	return sQuery;
}

function WriteObjectToCookie(name, obj, bPermanent)
{
	var sCookieVal = WriteObjectToQueryString(obj);
	//alert("setting cookie: " + name + "=" + sCookieVal );
	setCookie(name, sCookieVal, bPermanent);
}


function SaveObjectToUserData(storeName, attrName, obj)
{
	var sQuery = WriteObjectToQueryString(obj);
	UserData.setAttribute(attrName,sQuery);
	//alert("save:" + sQuery);
	UserData.save(storeName);
}

function ReadLocalDataObject(storeName, attrName, defaultValue )
{
	var sValue="";
	try{
		UserData.load(storeName);
		sValue = UserData.getAttribute(attrName);
	}
	catch(e)
	{
		return defaultValue;
	}
	//alert("Read:" + sValue);
	return ReadObjectFromQueryString(sValue);
}

function SavedSearch2Query()
{
	var last_search = ReadLocalDataObject("kobool","search");
	return SetURLParams("?", last_search);
}


function ReadObjectFromCookie(name)
{
	var sCookieVal = getCookie(name,"");
	return ReadObjectFromQueryString(sCookieVal);
}

function ReadObjectFromQueryString( sQuery )
{
	var retObj = {};
	if(sQuery){
		var params = sQuery.split("&");
		
		for (i=0; i< params.length; i++)
		{
			var aItemPair = params[i].split("=");
			if( aItemPair.length && aItemPair[0].length){
				retObj[ aItemPair[0] ] = (aItemPair.length > 1) ? unescape(aItemPair[1]) : 1;
			}
		}
	}
	return retObj;
}

function setCookie(name, value, bPermanent)
{
	if( value == null )	{
		RemoveCookie(name);
		return;
	}
	if (bPermanent){
		var tenYearsAhead = new Date( (new Date()).getTime() + 1000 * 60 * 60 * 24 * 365 * 10 );
		document.cookie = name + "=" + escape(value) + "; path=/; expires=" + tenYearsAhead.toGMTString() + ";";
	}
	else{
		document.cookie = name + "=" + escape(value) + "; path=/;";
	}
}
function writeCookie(name, value, bPermanent)
{
	return setCookie(name,value,bPermanent);
}
function WriteSubCookie(group_name, item_name, value, bPermanent)
{
	var group = ReadObjectFromCookie(group_name);
	group[item_name] = value;
	WriteObjectToCookie(group_name, group, bPermanent);
}
function ReadSubCookie(group_name, item_name, default_value)
{
	var group = ReadObjectFromCookie(group_name);
	
	var ret_value = group[item_name];

	return Defined(group[item_name]) ? group[item_name] : default_value;
}
function CookiesCount()
{
	var mycookies = document.cookie.split(";" + " ");
	return mycookies.length;
}

function deleteCookie(name)
{
	document.cookie	 = name + "=x; path=/; expires=Fri, 31 Dec 1999 23:59:59 GMT;" ;
}

function toStringEx(value,length) 
{
	var theString;

	if( typeof(value) == "string" )
	{
		theString = value;
	}
	else
	{
		theString = value.toString(10);
	}
	
	while( theString.length < length)
	{
		theString = "0" + theString;
	}
	return theString;
}

//function getBaseURL(sURL)
//{
//	var baseURL;
//	
//	if (sURL == null)
//		sURL = window.location.href;
//	baseURL = new String(sURL);
//	// eleminate the quer
//	baseURL = baseURL.split("?")[0];
//	baseURL = baseURL.substr(baseURL.lastIndexOf("/"));
//
//	return baseURL;
//}

function CPageParams( sQuery )
{
	if(!sQuery)
		sQuery = window.location.href;

	var sURL = sQuery.indexOf("?") != -1 ? sQuery : "x?" + sQuery;

	this.mPageUrl = new CPageUrl(sURL);
	
	this.item = function( key, default_value)
	{
		var ret_value = this.mPageUrl.getParam( key, default_value );
		return ret_value;
	};
}

//function xCPageParams( sQuery )
//{
//	this.keys   = [];
//	this.values = [];
//	this.item   = function(key, default_value)
//	{
//		if(Defined(this.values[key]))
//			return this.values[key];
//		else
//			return default_value;
//	};
//	
//	if( !sQuery ){
//		var aUrlItems = (window.location.href).split('?');
//		
//		if (aUrlItems.length < 2)
//			return;
//
//		sQuery = aUrlItems[1];
//		
//		for(var i=2; i < aUrlItems.length; i ++)
//		{
//			sQuery += "?" + aUrlItems[i];
//		}
//	}
//
//	var aQueryItems = sQuery.split("&");
//	
//	for( var i=0; i< aQueryItems.length; i++ )
//	{
//		var aParamPair = aQueryItems[i].split("=");
//		
//		this.keys[i] = aParamPair[0];
//
//		if (aParamPair.length > 1){
//			this.values[aParamPair[0]] = UnescapeEx(aParamPair[1]);
//		}
//		else{
//			this.values[aParamPair[0]] = true;
//		}
//	}
//}

//function CDialogArgs()
//{
//	var myArgs = window.dialogArguments.split("&");
//	
//	for (i = 0 ; i<myArgs.length; i++)
//	{
//		var myParamPair = myArgs[i].split("=");
//		eval ("this." + myParamPair[0] + "=\"" + myParamPair[1] + "\"");
//	}
//	return this;
//}

function ToggleShowElement(sID)
{
	var idElement = DocElement(sID);

	if( null == idElement )
		return;
	
	if( idElement.style.display == "none" )
		ShowElement(sID);
	else
		HideElement(sID);
}

var SE = function ShowElement( sID, delay )
{
	var idElement = DocElement(sID);

	if( null == idElement )
		return;
	
	if( idElement.idDelayedShowHide ){
		window.clearTimeout( idElement.idDelayedShowHide );
		idElement.idDelayedShowHide = null;
	}

	if( ! delay )
	{
		//idElement.style.zIndex  = 1;
		if(idElement.style.display=="none")
		{
			idElement.style.display = "";

			if( Defined(idElement.onFirstShow) && idElement.onFirstShow.length )
			{
				window.setTimeout( "gCurrShownElement=" + idElement.uniqueID + ";" + idElement.onFirstShow, 1);
				idElement.xonFirstShow = idElement.onFirstShow;
				idElement.onFirstShow = "";
			}
			else if( idElement.onShow && idElement.onShow.length ){
				window.setTimeout(idElement.onShow, 1);
				//eval(idElement.onShow);
			}
		}

	}
	else
	{
		idElement.idDelayedShowHide = window.setTimeout("ShowElement('" + sID + "', 0)", delay);
	}
};

var HE = function HideElement( sID, delay )
{
	var idElement = document.getElementById(sID);
	
	if( null == idElement )
		return false;

	if( idElement.idDelayedShowHide ){
		window.clearTimeout( idElement.idDelayedShowHide );
		idElement.idDelayedShowHide = null;
	}

	if( ! delay ){
		if( idElement.style.display != "none" )
		{
			idElement.style.display = "none";
			if( idElement.onHide && idElement.onHide.length )
			{
				window.setTimeout(idElement.onHide, 1);
			}
		}
	}
	else
		idElement.idDelayedShowHide = window.setTimeout("HideElement('" + sID + "', 0)", delay);

	return true;
};

function XHideElement( sID )
{
	var dElement = DocElement( sID );
	if(dElement){
		HideElement( sID );
		if(dElement.xonFirstShow){
			dElement.onFirstShow = dElement.xonFirstShow;
		}
	}

}

function HideElements( sArray )
{
	for( var i=0; i<sArray.length; i++ ){
		HideElement(sArray[i],0);
	}
}

var SEs = function ShowElements( sArray )
{
	for( var i=0; i<sArray.length; i++ ){
		ShowElement(sArray[i],0);
	}
};


function getCurrentPageName()
{
	var sCurrPage = window.location.pathname.substring ( window.location.pathname.lastIndexOf("/") + 1);
	return sCurrPage.toLowerCase();
}

function AssignHelpElement(sElementID)
{
	idHelp.helpItem = document.getElementById( sElementID ); 
}
	
function ImageURL2ImageID(sImageURL) 
{
	var sFileName = sImageURL.substr(sImageURL.lastIndexOf("/") + 1 );
	var sImageID = sFileName.substr(1, sFileName.lastIndexOf(".") - 1);
	var imageID = parseInt ( sImageID, 10 );

	return imageID;
}

function getHelpIcon( sTopic )
{
	if (sTopic)
		return "<img " + getHelpTag(sTopic,10) + " src=images/help_ico.gif width=15 height=15 style='cursor:hand' onclick=\"ShowMessage(getHelpText('" + sTopic + "'))\">";
	return "<img src=images/space.gif width=16 height=16>";
}

function getHelpTag( sTopic, nDelay, nMaxWidth, bText )
{
	if (sTopic){
		var delayTime;

		if (nMaxWidth>0)
			sHelpWidth = " helpWidth='" + nMaxWidth + "' ";
		else
			sHelpWidth = "";

		if (nDelay)
			delayTime = nDelay;
		else
			delayTime = 1000;

		if( bText )
			return " helpText=\"" + getHelpText(sTopic) + "\" helpDelay='" + delayTime + "'" + sHelpWidth ;
		else
			return " helpTopic=\"" + sTopic + "\" helpDelay='" + delayTime + "'" + sHelpWidth ;
	}
	return "";
}

function getHelpTextTag( sText, nDelay, nMaxWidth )
{
	var delayTime, sHelpWidth;

	if (nDelay)
		delayTime = nDelay;
	else
		delayTime = 1000;

	if (nMaxWidth>0)
		sHelpWidth = " helpWidth='" + nMaxWidth + "' ";
	else
		sHelpWidth = "";
	
	return " helpText=\"" + sText + "\" helpDelay='" + delayTime + "' " + sHelpWidth;
}

function getHelpText (sTopic)
{
	return getString( sTopic, "help" );
}

function AppendText(sElement,sText,bBeginning)
{
	var element = document.getElementById(sElement);
	
	if (element)
	{
		var sCurrHTML = element.innerHTML;

		element.innerText = sText;

		if (bBeginning)
			element.innerHTML = element.innerHTML + sCurrHTML;
		else
			element.innerHTML = sCurrHTML + element.innerHTML;
	}
}

function GetVSpacer(height)
{
	return "<div style='font-size:1px;height:" + height.toString() + "px'>&nbsp;</div>";
}

function GetHSpacer(width)
{
	return "<span style='font-size:1px;width:" + width.toString() + "px;height:" + width.toString() + "px'>&nbsp;</span>";
}

function TrimText(sText, maxLength)
{
	sText = sText.trim();
	if (sText.length > maxLength)
		return sText.substring(0,maxLength) + "..";

	return sText;
}

//function SearchArray(myArray, myItem)
//{
//	for (var i=0; i<myArray.length; i++ )
//	{
//		if (myArray[i] == myItem)
//		{
//			return true;
//		}
//	}
//	return false;
//}

function wrapText(sText, maxLen)
{
	var sRetText = "";
	var nCurrLen;
	var sDlmtrs = " _+,-";
	var escape_on = false;

	for( i=0, nCurrLen=0; i<sText.length ; i++ )
	{
		var currChar = sText.charAt(i);
		
		if( nCurrLen >= maxLen || sDlmtrs.indexOf(currChar) >=0 ){
			sRetText += "<WBR>";
			nCurrLen = 0;
		}

		sRetText += currChar;

		if(!escape_on)
			nCurrLen ++;

		if (currChar == '&')
			escape_on = false;

		if (currChar == ';')
			escape_on = true;
	}
	return sRetText;
}

function ApplyClass(sHTML, sStyleName)
{
	return "<span class='" + sStyleName + "'>" + sHTML + "</span>";
}

function EscapeEx(sText)
{
	if (GetIEVersion() >= 5.5)	
		return encodeURI(sText);
	else
		return escape(sText);
}

function UnescapeEx(sText)
{
	if (GetIEVersion() >= 5.5)	
		return decodeURI(sText);
	else
		return unescape(sText);
}

function LocalTime2GMT( sLocalTime )
{
	//2004-10-16 10:23:50
	var aTimeParts = ReplaceAll( ReplaceAll( sLocalTime, ":", " ") , "-", " " ).split(" ");
	var retTime = Date(aTimeParts[0], aTimeParts[1], aTimeParts[2], aTimeParts[3], aTimeParts[4], aTimeParts[5]);
	return retTime.toGMTString();
}


function FormQuery( idForm )
{
	var sQuery = "";

	for (var i=0;i< idForm.elements.length ; i++)
	{
		var element = idForm.elements.item(i);
		if(element.name && element.name.length)
		{
			if(sQuery.length)
				sQuery += "&";

			if(element.type=="checkbox")
			{
				if(element.checked)
					sQuery += element.name + "=on" ;
			}
			else
			{
				if(element.value.length){
					sQuery += element.name + "=" + EscapeEx(element.value) ;
				}
			}
		}
	}
	return sQuery;
}

function GotoBookmark( sBookmark, nDelay )
{
	var theAnchor = document.anchors(sBookmark);

	if( theAnchor ){
		theAnchor.scrollIntoView( theAnchor.uniqueID );
	}
}

function GotoElement( sElementName, nDelay )
{
	if(nDelay){
		window.setTimeout( "GotoElement('" + sElementName + "', 0 )", nDelay );
		return;
	}

	element = DocElement( sElementName );
	if( element ){
		element.scrollIntoView(true);
	}else{
		//alert("element '" + sElementName + "' not found");
	}
}

function JSON2XML( jRecord )
{
	this.jRecord = jRecord;
	this.getAtt = this.GetAtt = function ( sAttribute, sDefault, bCheckReview ) 
	{
		if( !this.jRecord ){
			return sDefault;
		}

		var sRetValue = this.jRecord[sAttribute];

		if( sRetValue && sRetValue.length > 0 )
		{
			if( bCheckReview && ( sRetValue.indexOf( gUpdateMark ) == 0 || sRetValue.indexOf( gRejectMark ) == 0 ) ) 
			{
				return getString("not_approved");
			}
		}

		return sRetValue;
	};

	this.getNumAtt = function( sAttribute, nDefault )
	{
		if( !this.jRecord ){
			return sDefault;
		}

		var sRetValue = this.getAtt( sAttribute, nDefault );
		return parseInt( sRetValue );
	};
}

function JCXmlRecord( xmlRecord )
{
	ImplementClass(this, JCFreeMe);
	this.add2FreeMe(["xmlRecord"]);

	this.xmlRecord = xmlRecord;

	this.getAtt = this.GetAtt = function ( sAttribute, sDefault, bCheckReview ) 
	{
		if( !this.xmlRecord ){
			return sDefault;
		}

		var sRetValue = this.xmlRecord.getAttribute(sAttribute);

		if( !sRetValue || sRetValue.length == 0 )
		{// couldn't find attribute, check child nodes 
			var childElement = this.xmlRecord.selectSingleNode(sAttribute);

			if( childElement ){
				sRetValue = childElement.text;
			}
			else{
				return sDefault;
			}
		}
		
		if( sRetValue && sRetValue.length > 0 )
		{
			if( bCheckReview && ( sRetValue.indexOf( gUpdateMark ) == 0 || sRetValue.indexOf( gRejectMark ) == 0 ) ) 
			{
				return getString("not_approved");
			}
		}

		return sRetValue;
	};

	this.getNumAtt = function( sAttribute, nDefault )
	{
		if(!this.xmlRecord){
			return nDefault;
		}

		var sRetValue = this.getAtt( sAttribute, nDefault );
		return parseInt( sRetValue );
	};
}
// to simulate xmlElement having a docElement
//function JCElementAttributes( domElement )
//{
//	this.domElement = domElement;
//
//	this.getAttribute = this.GetAtt = function ( sAttribute, sDefault )
//	{
//		var sRetValue = eval( "this.domElement." + sAttribute );
//		
//		if( sRetValue && sRetValue.length > 0 ){
//			return sRetValue;
//		}
//		
//		return sDefault;
//	};
//
//	this.selectSingleNode = function()
//	{
//		return null;
//	};
//}

function DocElement( sID )
{
	return document.getElementById( sID );
}

function FindChildById(thisElement, sID, nParent)
{
	if(nParent)
	{
		while(nParent){
			thisElement = thisElement.parentElement;
			nParent --;
		}
	}

	for(var i=0;i<thisElement.all.length;i++)
	{
		var eChild = thisElement.all[i];
		if(eChild.id == sID)
			return eChild.uniqueID;
	}
	return "";
}

function FindParentById(thisElement, sID)
{
	var parentElement = thisElement.parentNode;
	while(parentElement){
		if(parentElement.id==sID)
			return parentElement;
		parentElement = parentElement.parentNode;
	}
	return document.body;
}

function CountDigits( sText )
{ 
	var count = 0;
	var re = /[0-9]/g;

	while( null != re.exec( sText ) ){
		count ++;
	}

	return count;
}

function IsDigits( sText )
{ 
	return( CountDigits(sText) == sText.length );
}

function IsValidEmail(sEmail)
{
	var emailfilter=/^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i;
	return emailfilter.test(sEmail);
}

function  SQL2Locale( SQLDateStr )
{
	var myDate = new Date();
	myDate.setSQLDate(SQLDateStr);
	return myDate.toLocaleString();
}

function  SQL2LocaleDate( SQLDateStr )
{
	if(!SQLDateStr)
		return "";
	var myDate = new Date();
	myDate.setSQLDate(SQLDateStr);
	return myDate.toLocaleDateString();
}

function  SQL2Date( SQLDateStr )
{
	if(!SQLDateStr)
		return "";
	var myDate = new Date();
	myDate.setSQLDate(SQLDateStr);
	return myDate.toDateString();
}


function XLoginID( sLoginID )
{
	if(!Defined(sLoginID))
		return "";

	if(sLoginID == gSV.login_id ){
		return sLoginID;
	}

	sLoginID = sLoginID.toLowerCase();

	var sLatinPattern = "[A-Z]|[a-z]";
	var nLatinCount  = CountPattern(sLoginID, sLatinPattern );
	var nTotalLength = sLoginID.length;

	var sRet = sLoginID.replace( /[\!-\?]|[_]/gi, "*" );

	var re = new RegExp( sLatinPattern, "gi" );

	if(nLatinCount<4)
		return sRet;

	var maskPos = [];

	var mask_count = Math.floor( nLatinCount / 6 ) + 1;

	for( var i=0; i < mask_count; i ++ )
	{
		maskPos[i] = Math.floor( nLatinCount * ( i + 1 ) / ( mask_count + 1 ) );
	}

	for( var i=0; i<nLatinCount; i ++ )
	{
		re.exec( sRet );

		for( var n=0; n < mask_count; n ++ )
		{
			if( i == maskPos[n] ){
				sRet = RegExp.leftContext + "*" + RegExp.rightContext;
			}
		}
	}
	
	return sRet;// + " : " + maskPos.join(",");
}

function CountPattern( sText, sPattern )
{
	var re = RegExp( sPattern , "gi" );
	var count = 0;

	while( null != re.exec( sText ) ){
		count ++;
	}

	return count;
}

function SetURLParams( sURL, objParams )
{
	var sRetURL = sURL;
	for(var param in objParams )
	{
		sRetURL = SetURLParam( sRetURL, param, objParams[param] );
	}
	return sRetURL;
}

function SetURLParam( sURL, pName , pValue )
{
	var sRetValue;

	var paramPair = pName + "=" + pValue;

	var findStart  = RegExp( "^" + pName + "\=[^\&]*" );
	var findMiddle = RegExp( "[\&|\?]" + pName + "\=[^\&]*" );
	//name=34243&name=3323444

	if( ( sURL.search(findStart) >= 0 ) || ( sURL.search(findMiddle) >= 0 ) )
	{
		var sLeftContext;
		var foundPair = RegExp.lastMatch;

		if(foundPair.indexOf("\?") == 0 || foundPair.indexOf("\&") == 0)
		{
			sLeftContext = RegExp.leftContext + foundPair.substr(0,1);
		}	
		else
		{
			sLeftContext = RegExp.leftContext;
		}

		if( !Defined(pValue) || pValue == null || ( typeof(pValue) == "string" && !pValue.length ) )
		{// remove parameter
			sRetValue = sLeftContext + RegExp.rightContext;
		}
		else
		{
			sRetValue = sLeftContext + paramPair + RegExp.rightContext;
		}
	}
	else 
	{// parameter didn't exist
		if( !Defined(pValue) || pValue == null ){
			return sURL;
		}

		if( sURL.indexOf("?") >= 0 )
		{
			sRetValue = sURL + "&" + paramPair;
		}
		else
		{
			sRetValue = sURL + "?" + paramPair;
		}
	}
	
	return sRetValue.replace(/\&\&/g,"&");
}

function ReplaceAll ( str, sFind, sReplace )
{
	if(!str)
		return "";

	var re = RegExp( sFind , "gi" );
	return str.replace( re, sReplace );
}

function JScriptString( str )
{
	str = str.replaceAll("\\\\", "\\x5C");
	str = str.replaceAll("'", "\\x27");
	str = str.replaceAll("\"", "\\x22");
	return str;
}

function ShowCollection( collection )
{
	var info = "-----------\n";
	for (var i=0; i<collection.length; i++ )
	{
		var item = collection[i];
		if( item.value ){
			info += item.name + "=" + item.value + "\n";
		}
	}
	info += "===========";

	alert(info);
}

function GetPropertyList( collection )
{
	var info = "-----------\n";
	for ( var item in collection )
	{
		info += item + ":" + collection[item] + "\n";
	}
	info += "===========";

	return info;
}

//function ReplaceXFields(sText)
//{
//	var re = /\<\!--\s{0,}xfield\s{0,}exp\=\"([^\"]+)\"\s*--\>/i;
//
//	while( sText.match(re) )
//	{	
//		//alert(RegExp.lastMatch);
//		sText = sText.replace( re, eval(RegExp.$1) );
//	}
//	
//	return sText;
//};

function ProcessTemplate(sText)
{
	var re = /\<\!--\$\s{0,}([^\$]+)\$--\>/i;

	while( sText.match(re) ){	
		sText = sText.replace( re, eval(RegExp.$1) );
	}

	return sText;
};

function IsEqualTo( leftValue, aRightValues )
{
	for(var i=0;i<aRightValues.length;i++)
	{
		if(leftValue == aRightValues[i])
			return true;
	}
	return false;
}


//Image.prototype.onerror = function(){this.src = "images/delete.gif";};
