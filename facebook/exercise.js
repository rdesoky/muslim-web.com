////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
var gInfo, gInterval, gCountDown;
var gTrTotal=0, gScore=0;
var gSura;
var gUserInfo = {};
var gXmlLoader, xmlQuranData;
var gCgiLocation = "http://cgi.muslim-web.com/cgi-bin";

var key_map={
	39:1591,	// '
	41:40,		// (
	40:41,		// )
	44:1608,	// ,
	46:1586,	// .
	47:1592,	// /
	
	59:1603,	// ;
	63:1567,	// ?
	91:1580,	// [
	93:1583,	// ]
	96:1584,	// `

	123:60,		// {
	125:62,		// }

	65:1588		,//A
	97:1588		,//a
	
	66:1575		,//b
	98:1575		,//b
	
	67:1572		,//c
	99:1572		,//c
	
	68:1610		,//d
	100:1610	,//d
	
	69:1579		,//e
	101:1579	,//e
	
	70:1576		,//f
	102:1576	,//f
	
	71:1604	,//g
	103:1604	,//g
	
	72:1571	,//H
	104:1575	,//h
	
	73:1607	,//i
	105:1607	,//i
	
	74:1578	,//j
	106:1578	,//j
	
	75:1606	,//k
	107:1606	,//k
	
	76:1605	,//l
	108:1605	,//l
	
	77:1577	,//m
	109:1577	,//m
	
	78:1570	,//N
	110:1609	,//n
	
	79:1582	,//o
	111:1582	,//o

	80:1581	,//p
	112:1581	,//p

	81:1590	,//q
	113:1590	,//q

	82:1602	,//r
	114:1602	,//r

	83:1587	,//s
	115:1587	,//s

	84:1601	,//t
	116:1601	,//t

	85:1593	,//u
	117:1593	,//u

	86:1585	,//v
	118:1585	,//v

	87:1589	,//w
	119:1589	,//w

	88:1569	,//x
	120:1569	,//x

	89:1573	,//Y
	121:1594	,//y

	90:1574	,//z
	122:1574	//z

};

function OnBodyLoad()
{
	//alert(xmlQuranData.XMLDocument.xml);
	window.setTimeout( "LoadXMLDatabase()", 100);
	idAction.focus();

	gSura = parseInt( parameter("s"), 10 );

	idSelectSura.options.length = 116;

	var sura, ndx;

	for(sura=1, ndx=2; sura<115; sura++, ndx++ )
	{
		var option   = idSelectSura.options[ndx];
		option.text  = sura.toString() + "-" + str_table["sura"] + " " + gSuraNames[sura];
		option.value = sura;
		option.selected = ( sura == gSura );
	}

	onChangeSource();

	idAnswer.onkeypress = function(evt)
	{
		if(!Defined(evt)){
			evt = event;
		}

		var charCode = evt.cancelable ? evt.charCode : evt.keyCode;

		if( Defined(key_map[charCode]) ) {
			if( evt.cancelable ) 
			{
				var new_event = document.createEvent("KeyboardEvent");
					new_event.initKeyEvent(
						"keypress",			//  in DOMString typeArg
						true,				//  in boolean canBubbleArg,
						true,				//  in boolean cancelableArg,
						null,				//  in nsIDOMAbstractView viewArg,  Specifies UIEvent.view. This value may be null.
						false,				//  in boolean ctrlKeyArg,
						false,				//  in boolean altKeyArg,
						false,				//  in boolean shiftKeyArg,
						false,				//  in boolean metaKeyArg,
						0,//  in unsigned long keyCodeArg,
						key_map[charCode]);

				evt.preventDefault();
				this.dispatchEvent(new_event);
			}
			else
			{
				evt.keyCode = key_map[charCode];
			}
		}
		else if( evt.keyCode != 32 )
		{
			//alert(evt.keyCode);
		}
			//this.fireEvent("onkeypress", evt);
			//return false;
	};

	LoadJSONP( "get_user_info.php?id=0", "onLoadInfo(jsr)" );

	//new CKeyboard("idAnswer", arabic_keys);	

}

function xLoadXMLDatabase()
{
	try //Internet Explorer
	{
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	}
	catch(e)
	{
		try //Firefox, Mozilla, Opera, etc.
		{
			xmlDoc=document.implementation.createDocument("","",null);
		}
		catch(e) {alert(e.message)}
		}
	try 
	{
		xmlDoc.async=false;
		xmlDoc.load("books.xml");
	}
	catch(e){
		alert(e.message)
	}

}

function LoadXMLDatabase()
{
	if(xmlQuranData){
		return;
	}

	gXmlLoader = GetXMLHTTPControl();
	gXmlLoader.onreadystatechange = function(){
		//alert(gXmlLoader.readyState);
		if( gXmlLoader.readyState == 4 )
		{
			//idAction.disabled = false;
			//idAction.focus();
			xmlQuranData = gXmlLoader.responseXML;//.documentElement;
		}
	};
	gXmlLoader.open("GET", "quran.xml", true);
	gXmlLoader.send(null);

}

function onLoadInfo(jsr)
{
	if(jsr.success) {
		ShowElement("idScoreBoard");
		idSelectLevel.selectedIndex  = Defined(jsr.info.lvl) ? jsr.info.lvl : 0;
		gScore   = Defined(jsr.info.score) ? jsr.info.score : 0 ;
		gTrTotal = Defined(jsr.info.total) ? jsr.info.total : 0;
		ShowScore();
	}
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function ResetScore()
{
	if(confirm( str_table["confirm_reset"] )){
		gTrTotal = gScore = 0;
		ShowScore();	
		LoadJSONP( "save_user_info.php?reset=1" );
	}
}

function CancelExercise()
{
	gCountDown = 0;
	if (gInterval)
	{
		window.clearInterval(gInterval);
		gInterval = 0;
	}

	RetryState();

	SetHTML("ActionTitle", composePlayerObject("", "") );
	
	if(gInfo && gInfo.text)
	{
		SetHTML("idAyaDisplay", "<a href='javascript:OpenAya()' class='aya_view'>" + gInfo.text + "</a>" );
	}
}

function MemorizingState(doit)
{
	if(!Defined(doit))
		return 	window.setTimeout("MemorizingState(1)",1);

	HideElement("AnswerButtons");
	HideElement("Retry");
	HideElement("idAnswer");
	HideElement("KeyboardView");
	HideElement("InfoFrame");
	ShowElement("idAyaDisplay");
	ShowElement("idAyaHeader");
}

function RetryState(doit)
{
	if(!Defined(doit))
		return 	window.setTimeout("RetryState(1)",1);

	HideElement("QuickStart");
	HideElement("idAnswer");
	HideElement("AnswerButtons");
	HideElement("KeyboardView");
	ShowElement("idAyaDisplay");
	ShowElement("idAyaHeader");

	if(gInfo){
		ShowElement("Retry");
	}else{
		HideElement("Retry");
	}
}

function ExerciseState(doit)
{
	if(!Defined(doit))
		return 	window.setTimeout("ExerciseState(1)",1);

	HideElement("idAnswer");
	HideElement("AnswerButtons");
	HideElement("Retry");
	HideElement("KeyboardView");
	ShowElement("idAyaDisplay");
	ShowElement("idAyaHeader");
}

function AnswerState(doit)
{
	if(!Defined(doit))
		return 	window.setTimeout("AnswerState(1)",1);

	HideElement("InfoFrame");
	HideElement("idAyaDisplay");
	HideElement("QuickStart");
	HideElement("idAyaHeader");
	ShowElement("idAnswer");
	ShowElement("AnswerButtons");
	if(!gInfo.number){
		ShowElement("KeyboardView");
	}
	window.setTimeout("idAnswer.focus()",10);
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function StartExercise()
{
	idAction.value = str_table["new_aya"];

	var level, min, max;

	level = GetLevel(); 
	switch(level)
	{
	case 0:
		min = 20;max=25;
		break;
	case 1:
		min = 25;max=45;
		break;
	case 2:
		min = 45;max=75;
		break;
	case 3:
		min = 75;max=125;
		break;
	case 4:
		min = 125;max=200;
		break;
	}

	var cgiQuery, xmlQuery;

	switch( parseInt( idSelectSura.value, 10 ) )
	{
		case 1000:
			return MemorizeNumber();
		case 0:
			cgiQuery = (new Date()).getTime() + "&min=" + min.toString() + "&max=" + max.toString();
			xmlQuery = "//aya[@len>" + min.toString() + " and @len<" + max.toString() + "]";
			break;

		default:
			cgiQuery = (new Date()).getTime() + "&s=" + (idSelectSura.value - 1).toString();
			xmlQuery = "//aya[@s=" + (parseInt( idSelectSura.value, 10 ) - 1).toString() + "]";
	}

	if( !xmlQuranData ){
		ExerciseState();
		SetHTML("idAyaDisplay", "<span style='color:gray'>" + str_table["loading_aya"] + "...</span>");
		LoadData( gCgiLocation + "/get_aya.js.pl?" + cgiQuery , "onDownLoadDone(gDataResponse)" );
		return;
	}

	var arrAyat,count,ndx,aya,aya_text;

	try{
		arrAyat = xmlQuranData.selectNodes(xmlQuery);
		count = arrAyat.length;
		ndx = Math.round( count * Math.random() );
		aya = arrAyat.item(ndx);
		aya_text = aya.getElementsByTagName("t")[0].text;
	}
	catch(e){
		arrAyat = xmlQuranData.evaluate( xmlQuery, xmlQuranData, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null ); 
		count = arrAyat.snapshotLength;	
		ndx = Math.round( count * Math.random() );
		aya = arrAyat.snapshotItem(ndx);
		var text_node = aya.getElementsByTagName("t")[0];
		aya_text = text_node.textContent;
	}


	
	gInfo = { success:1,
		sura:	int(aya.getAttribute("s")),
		aya:	int(aya.getAttribute("a")),
		text:	aya_text,
		plain: MakePlainText(aya_text)
	};
	//alert("sura:" + gInfo.sura + ", aya:" + gInfo.aya + "\n" + aya.xml );
	onDownLoadDone();

}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function onDownLoadDone(data)
{
	if(data){
		gInfo = eval( data );
	}
	if(! gInfo.success )
	{
		ShowElement("idAyaDisplay");
		SetHTML("idAyaDisplay", "<font COLOR=RED>ﬁ«⁄œ… «·»Ì«‰«   €Ì—  „ «Õ… Õ«·Ì«</font>");
		//idAction.value = "«⁄œ «·„Õ«Ê·…";
		idAction.focus();
		return;
	}

	ShowElement("AyaActions");
	startMemorizing();
}
function MemorizeNumber()
{
	SetHTML( "idAyaHeader", "&nbsp;" );
	
	MemorizingState();

	idAyaDisplay.style.background = "";

	gInfo = {success:1, text:"", plain:"", number:true };

	//_factor = Math.pow( 1000, GetLevel() + 1 );
	var length = ( GetLevel() + 1 ) * 3 + 1;
	

	for( var i=0; i<length ;i++ )
	{
		var digit = Math.round( Math.random() * 9 );
		
		gInfo.text  += (	( gInfo.plain.length > 0 )
						&&	( gInfo.plain.length < length - 3 ) 
						&&	( gInfo.plain.length % 3 == 0 ) ? "-" : "" ) + digit;
		gInfo.plain += digit ;
	}

	startMemorizing();
}
function RetryExercise()
{
	startMemorizing();
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function startMemorizing()
{
	if( gInfo.success )
	{
		SetHTML( "idAyaHeader", GetAyaInfo(gInfo.sura, gInfo.aya) );
		
		MemorizingState();

		idAyaDisplay.style.background = "";

		SetHTML( "idAyaDisplay", gInfo.text + composePlayerObject("true", "none") );

		idAction.value = str_table['new_aya'];
		idAction.focus();

		StopInterval("gInterval");

		gCountDown = Math.round( gInfo.number ? gInfo.plain.length : ( 1.1 * gInfo.plain.length )/ 4 );

		CountDown();
		gInterval = window.setInterval ("CountDown()", 1000);
	}
}

function StopInterval( sHandleVarName )
{
	var handleValue = eval( sHandleVarName );
	if( handleValue ){
		window.clearInterval(handleValue);
		eval( sHandleVarName + "=0" );
	}
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function composePlayerObject(sAutoStart, sDisplay)
{
return "";

var nSuraNo = parseInt(gInfo.sura) + 1;
var nAyaNo  = parseInt(gInfo.aya) + 1;

var sPlayer =
"<OBJECT classid='clsid:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA' height=60 xid=idRealPlayer " +
"	style='display:" + sDisplay + "' width=240 VIEWASTEXT>" +
"	<PARAM NAME='_ExtentX' VALUE='7276'>" +
"	<PARAM NAME='_ExtentY' VALUE='1588'>" +
"	<PARAM NAME='autostart' VALUE='" + sAutoStart + "'>" +
//"	<PARAM NAME='SHUFFLE' VALUE='0'>" +
//"	<PARAM NAME='PREFETCH' VALUE='0'>" +
"	<PARAM NAME='SRC' VALUE='http://quran.al-islam.com/Recite/Recite_g2.asp?s=" + nSuraNo.toString(10) + "&f=" + nAyaNo.toString(10) + "&t=65&Reciter=0'>" +
"	<PARAM NAME='CONTROLS' VALUE='ControlPanel,StatusBar'>"+
"	<PARAM NAME='CONSOLE' VALUE='Clip1'>"+
//"	<PARAM NAME='LOOP' VALUE='0'>"+
//"	<PARAM NAME='NUMLOOP' VALUE='0'>"+
//"	<PARAM NAME='CENTER' VALUE='0'>"+
//"	<PARAM NAME='MAINTAINASPECT' VALUE='0'>"+
//"	<PARAM NAME='BACKGROUNDCOLOR' VALUE='#000000'>"+
"</OBJECT>";

//alert (sPlayer);
if (sDisplay != "none")
{
	sPlayer += "&nbsp;<font size=2>«·⁄—÷ «·’Ê Ì „ﬁœ„ „‰ „Êﬁ⁄ <a href=http://www.al-islam.com/ target=_blank>al-islam.com</a></font>";
}

return sPlayer;
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function CountDown(count_down)
{
	if( Defined(count_down) ){
		gCountDown = count_down;
	}

	if (0==gCountDown)
	{
		window.clearInterval(gInterval);
		gInterval = 0;
		StartAnswer();
	}
	else
	{
		gCountDown --;
		SetHTML("ActionTitle", "<table><tr><td><span>" + str_table["remaining_time"] + 
								":</span></td><td class='counter'>" + gCountDown + "</td></tr></table>" );
		ShowElement("QuickStart");
	}

}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function StartAnswer()
{
	gTimeout = 0;
	idAnswer.value = "";

	AnswerState();
	SetHTML( "ActionTitle", str_table["write_aya"] );

	//window.setTimeout("FitWindow()", 10);
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function CheckAnswer()
{
	SetHTML("ActionTitle", "");
	
	RetryState();

	//idAction.onclick = StartExercise;
	idAction.focus();

	var nCompairResult = compairText(gInfo.text, idAnswer.value);

	if ( nCompairResult == -1)
	{
		gScore   += gInfo.text.length;//GetLevel() + 1;
		gTrTotal += gInfo.text.length;

		idAyaDisplay.style.background = "#DADFC6";
		SetHTML("ActionTitle", "<span style='color:green'>" + str_table["correct_answer"] + "</span>" );
		SetHTML("idAyaDisplay","<a href='javascript:OpenAya()' class=aya_view>" + gInfo.text + "</a>" + 
								composePlayerObject("False", "") +
								"<div style='text-align:center'></div>" );
	
		UpdateScore( gInfo.text.length, gInfo.text.length );
	}
	else
	{
		var failed_count = gInfo.text.length > 20 ? 20 : gInfo.text.length;
		gTrTotal += failed_count;

		idAyaDisplay.style.background = "#FFE1E7";
		SetHTML("ActionTitle",	"<span style='color:red'>" + str_table["wrong_answer"] + "</span>" );
		SetHTML("idAyaDisplay",	"<table width=100%><tr><td NOWRAP class='sub_title'>" + str_table["source_text"] + ":</td><td style='width:100%'>" + 
									"<a href='javascript:OpenAya()' >" + 
										gInfo.text.substr( 0, nCompairResult ) + 
										"<span class='aya_view' style='background:yellow'>" + 
											gInfo.text.substr( nCompairResult ) + 
										"</span>" + 
									 "</a>" + 
								"</td></tr>" + 
								"<tr><td NOWRAP class='sub_title'>" + str_table["written_text"] + ":</td><td style='width:100%;'>"+  
									"<span style='color:blue'>"  + idAnswer.value + "</span>" +
								"</td></tr></table>" + 
									composePlayerObject("False", "") 
				);

		UpdateScore( failed_count , 0 );

	}


	//window.setTimeout("FitWindow()", 10);
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function MakePlainText(sInput)
{
	var sRetText = sInput
	sRetText = sRetText.replace( /(\s|[\u064B-\u0652]|[\x21-\x2F]|[\x3A-\x40]|[\x5B-\x60]|[\x7B-\xA0])/g, "" );
	sRetText = sRetText.replace( /[\u0622\u0623\u0625]/g, "\u0627");
	sRetText = sRetText.replace( /\u0629/g,			"\u0647");
	sRetText = sRetText.replace( /\u0649/g,			"\u064A");
	sRetText = sRetText.replace( /[\u0624\xu0626]/g,"\u0621");

	//alert(sRetText);
	return sRetText;
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function GetAyaInfo(nSuraNo, nAyaNo)
{
	if(Defined(nSuraNo)) {
		return "<a href='javascript:OpenAya()'>" + str_table['aya'] + ":" + 
				(parseInt(nAyaNo)+1) + "</a> - <a href='javascript:OpenAya()'>" + str_table['sura'] + " " + gSuraNames[parseInt(nSuraNo,10)+1] + "</a>";
	}
	return "&nbsp;";
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function GetLevel()
{
	return parseInt(idSelectLevel.selectedIndex);
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function OpenAya()
{
	if(Defined(gInfo.sura)){
		quranWindow = window.open("http://quran.muslim-web.com/sura.htm?aya=" + toStringEx(parseInt(gInfo.sura,10)+1,3) + toStringEx(parseInt(gInfo.aya,10)+1,3) , "quran");
		quranWindow.focus();
	}
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function OpenQuran()
{
	quranWindow = window.open("http://quran.muslim-web.com/index.htm" , "quran");
	quranWindow.focus();
}

function ChangeLevel()
{
	//writeCookie("lvl", idSelectLevel.selectedIndex.toString(10) );
	gUserInfo.lvl = idSelectLevel.selectedIndex;
	if(idScoreBoard.style.display == ""){
		LoadJSONP(	"save_user_info.php?id=0&info=" + escape( "{lvl:" + idSelectLevel.selectedIndex + ",score:" + gScore + ",total:" + gTrTotal + "}" ) + 
					"&mem_level=" + gUserInfo.lvl 
				);
	}
}

function UpdateScore( total, memorized )
{
	total	  = Defined(total) ? total : gTrTotal;
	memorized = Defined(memorized) ? memorized : gScore;

	ShowScore();	
	LoadJSONP(	"save_user_info.php?total_words=" + total + "&mem_words=" + memorized );
}

function ShowScore()
{
	//SetHTML( "idScore", gScore.toString() );
	//SetHTML("idTotal", gTrTotal.toString() );

	if(gTrTotal){
		SetHTML("idPercent", Math.round ( (gScore * 10000) / gTrTotal ) / 100 );
	}
	else
	{
		SetHTML("idPercent", "0");
	}
}

////////////// returns -1 if strings are matching or offset of the first mismatch
function compairText(sFirst, sSecond)
{
	var sPlainFirst  = MakePlainText(sFirst);
	var sPlainSecond = MakePlainText(sSecond);

	for (nFirst=0,nSecond=0; nFirst<sFirst.length && nSecond<sPlainSecond.length; nFirst++,nSecond++ )
	{
		while (nFirst < sFirst.length)
		{
			var sPlainChar = MakePlainText( sFirst.substr(nFirst, 1) );

			if (sPlainChar.length)
			{
				if (sPlainChar != sPlainSecond.substr(nSecond, 1) )
				{
					return nFirst;
				}
				break;
			}
			nFirst ++;
		}
	}

	if( sPlainFirst.length == sPlainSecond.length )
		return -1;
	else
		return nFirst;
}

function FitWindow()
{
	//window.resizeTo(600, document.body.scrollHeight + 120);
}

function onChangeSource(nSura)
{
	CancelExercise();
	if(!Defined(nSura)){
		gSura = nSura = parseInt(idSelectSura.value,10);
	}
	
	switch(nSura)
	{
		case 0:// all quran
			TrainingViewer.style.direction = "RTL";
			ShowElement("idByLevel");		
			ShowElement("LevelTitle");		
			break;
		case 1000:// numbers
			TrainingViewer.style.direction = "LTR";
			ShowElement("idByLevel");		
			ShowElement("LevelTitle");		
			SetHTML( "idAyaHeader", "&nbsp;") 
			SetHTML( "idAyaDisplay", "&nbsp;" );
			break;
		default:
			TrainingViewer.style.direction = "RTL";
			HideElement("idByLevel");		
			HideElement("LevelTitle");		
	}
}

function Explain_Aya()
{
	ShowAyaInfo( "http://quran.muslim-web.com/tafseer/KATHEER/" ) ;
}

function Translate_Aya()
{
	ShowAyaInfo( "http://www.reciter.org/ENGLISH/" );
}

function Recite_Aya()
{
	CancelExercise();

	var url = "http://cgi.muslim-web.com/cgi-bin/recite.pl?s=" + (gInfo.sura+1).toString() + "&f=" + (gInfo.aya+1).toString() + "&t=" + (gInfo.aya+1).toString() + "&r=0";

	newWindow = window.open ("http://quran.muslim-web.com/reciter.htm?auto=1&url=" + escape(url) + "&sura=" + (gInfo.sura+1).toString() + "&reciter=" + 33, 
							"telawa", "width=340,height=200");
	newWindow.focus();
}

function ShowAyaInfo( sURL )
{
	var sURL = sURL + toStringEx(gInfo.sura+1, 3) + toStringEx(gInfo.aya+1,3) + ".html";
	ShowElement("InfoFrame");
	SetHTML("InfoFrame", "<iframe frameborder='0' width='100%' height=160 src='" + sURL + "'></iframe>");
	CancelExercise();
}

function GetXMLHTTPControl()
{
	var httpControl;

	if( window.XMLHttpRequest ) 
	{
		try{
			httpControl = new XMLHttpRequest();
		}
		catch(e){
			httpControl = false;	
		}
	} 
	else if(window.ActiveXObject) 
	{// branch for IE/Windows ActiveX version
		try{
			httpControl = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch(e){
			try{
				httpControl = new ActiveXObject("Microsoft.XMLHTTP");
			} 
			catch(e){
				httpControl = false;
			}
		}
	}
	
	return httpControl;
}

function int( sData )
{
	if( Defined(sData) ){
		return parseInt( sData, 10);
	}
	return 0;
}