////////////////////////////////////////////////////////////////////
// External dependencies:
// idUserAnswer, idAyaDisplay, idAyaHeader, (idAction), idHelpPanel, gSuraNames
// UpdateScore()
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
var gInfo;
var gInterval;
var gCountDown;

////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function CancelExercise()
{
	idUserAnswer.style.display = "none";

	idAyaDisplay.style.display = "";

	idAyaDisplay.innerHTML = gInfo.sAyaText + "<br>" + 
							 composePlayerObject("", "") + 
							"<br><input type=button onclick='startMemorizing()' value='اعادة المحاولة'>" ; 
	
	window.setTimeout("FitWindow()", 10);
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function DoExercise( nSura, nAya, nLastAya, sAyaText, sAyaPlainText )
{
	//gInfo = new Array( nSura, nAya, nLastAya, sAyaText, sAyaPlainText );
	gInfo = new Object();
	gInfo.nSura = nSura;
	gInfo.nAya = nAya;
	gInfo.nLastAya = nLastAya;
	gInfo.sAyaText = sAyaText;
	gInfo.sAyaPlainText = sAyaPlainText;

	startMemorizing();

	window.setTimeout("FitWindow()", 10);
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function correct()
{
	idHelpPanel.innerText = "";	
	idHelpPanel.style.display = "none";

	gTimeout = 0;
	idAyaDisplay.style.display = "none";
	//idAnswer.innerText = "";
	idUserAnswer.style.display = "";
	idAnswer.focus();
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function startMemorizing()
{
	//if (gInfo.length > 1)
	//{
	idAyaHeader.innerHTML = GetAyaInfo( gInfo.nSura );
	idAyaDisplay.style.display = "";
	idAyaDisplay.style.background = "";
	idAyaDisplay.innerHTML = gInfo.sAyaText + 
							"<p align=left>" +
							"<input type=button onclick='StopAndStartAnswer()' value='ابدأ الإجابة'>"+
							 composePlayerObject("true", "none");

	idUserAnswer.style.display = "none";

	if (idAction.style.display == "")
	{
		idAction.value = "اطلب آية جديدة";
		idAction.focus();
	}

	if (gInterval)
		window.clearInterval(gInterval);

	gCountDown = Math.round( (1.1 * gInfo.sAyaPlainText.length) / 4 ) ;

	idHelpPanel.innerText = gCountDown;	

	gInterval = window.setInterval ("CountDown()", 1000);
	//}
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function composePlayerObject(sAutoStart, sDisplay)
{
	var nSuraNo = parseInt(gInfo.nSura) + 1;
	var nAyaNo  = parseInt(gInfo.nAya) + 1;
	var nLastAya= parseInt(gInfo.nLastAya) + 1;

	var sURL = "	<PARAM NAME='SRC' VALUE='http://quran.al-islam.com/Recite/Recite_g2.asp?s=" + nSuraNo.toString(10) + "&f=" + nAyaNo.toString(10) + "&t=65&Reciter=0'>";

	if(nAyaNo != nLastAya)
	{
		sURL = "	<PARAM NAME='SRC' VALUE='http://cgi.muslim-web.com/cgi-bin/recite.pl?s=" + nSuraNo.toString(10) + "&f=" + nAyaNo.toString(10) + "&t=" + nLastAya.toString(10) + "&r=0'>";
	}

	var sPlayer =
	"<OBJECT classid='clsid:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA' height=60 id=idRealPlayer " +
	"	style='display:" + sDisplay + "' width=240 VIEWASTEXT>" +
	"	<PARAM NAME='_ExtentX' VALUE='7276'>" +
	"	<PARAM NAME='_ExtentY' VALUE='1588'>" +
	"	<PARAM NAME='autostart' VALUE='" + sAutoStart + "'>" +
	"	<PARAM NAME='SHUFFLE' VALUE='0'>" +
	"	<PARAM NAME='PREFETCH' VALUE='0'>" +
	sURL +
	"	<PARAM NAME='CONTROLS' VALUE='ControlPanel,StatusBar'>"+
	"	<PARAM NAME='CONSOLE' VALUE='Clip1'>"+
	"	<PARAM NAME='LOOP' VALUE='0'>"+
	"	<PARAM NAME='NUMLOOP' VALUE='0'>"+
	"	<PARAM NAME='CENTER' VALUE='0'>"+
	"	<PARAM NAME='MAINTAINASPECT' VALUE='0'>"+
	"	<PARAM NAME='BACKGROUNDCOLOR' VALUE='#000000'>"+
	"</OBJECT>";

	//alert (sPlayer);
	if (sDisplay != "none"){
		sPlayer += "&nbsp;<font size=2>العرض الصوتي مقدم من موقع <a href=http://www.al-islam.com/ target=_blank>al-islam.com</a></font>";
	}

	return sPlayer;
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function CountDown()
{
	if (0==gCountDown)
	{
		StartAnswer();
	}
	else
	{
		gCountDown --;
		idHelpPanel.style.display = "";
		idHelpPanel.innerText = gCountDown;	
	}

}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function StopAndStartAnswer()
{
	gCountDown = 0;
	idRealPlayer.doStop();
	StartAnswer();
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function StartAnswer()
{
	
	if (gInterval)
	{
		window.clearInterval(gInterval);
		gInterval = 0;
	}
	

	idHelpPanel.innerText = "";	
	idHelpPanel.style.display = "none";

	gTimeout = 0;
	idAyaDisplay.style.display = "none";
	idAnswer.innerText = "";
	idUserAnswer.style.display = "";
	idAnswer.focus();

	window.setTimeout("FitWindow()", 10);

}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function CheckAnswer()
{
	idAyaDisplay.style.display = "";
	idUserAnswer.style.display = "none";

	idAction.onclick = StartExercise;
	if (idAction.style.display == "")
	{
		idAction.value = "اطلب آية جديدة";
		idAction.focus();
	}

	gTrTotal ++;

	writeCookie("tt", gTrTotal.toString(10) );

	var nCompairResult = compairText(gInfo.sAyaText, idAnswer.innerText);
	//if( MakePlainText(gInfo.sAyaText) == MakePlainText(idAnswer.innerText) )
	if ( nCompairResult == -1)
	{
		gScore ++;

		writeCookie("ts", gScore.toString(10) );

		idAyaDisplay.style.background = "#DADFC6";
		idAyaDisplay.innerHTML = "نهنئك :النص مطابق"+ 
								"<p>" + gInfo.sAyaText + 
								"<p>"	+ composePlayerObject("False", "") + 
							"<br><input type=button onclick='startMemorizing()' value='تكرار التدريب'>&nbsp;" +
							"<input type=button onclick='AddToMemorized(this)' value='اضف الى الآيات المحفوظة'>&nbsp;";
	}
	else
	{
		idAyaDisplay.style.background = "#FFE1E7";

		idAyaDisplay.innerHTML= "<font color=red>" +
									"مع الأسف.. النص غير مطابق" +
								"</font>" +
								"<table>" +
								"<tr>" + 
									"<td>النص الصحيح:</td>"+
									"<td style='color:green'>"+
										gInfo.sAyaText.substr(0,nCompairResult)  + "<span style='background:yellow'>" + gInfo.sAyaText.substr(nCompairResult) + "&nbsp;</span>" +
									"</td>" + 
								"</tr>" + 
								"<tr>" + 
									"<td>النص المكتوب: </td>"+
										"<td style='color:red'>" + idAnswer.innerText + "</td>" + 
								"</tr>" + 
								"</table>" + 
								composePlayerObject("False", "") + 
							"<br><input type=button onclick='startMemorizing()' value='اعادة المحاولة'>"+ 
									"&nbsp;<input type=button onclick='correct()' value='تصليح الإجابه'>	";
	}

	UpdateScore();

	window.setTimeout("FitWindow()", 10);
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function RemoveTashkeel( sInput )
{
	var sRetText = "";

	for (i=0;i<sInput.length;i++)
	{
		var currChar = sInput.charAt(i);
 
		if (currChar >= "ً") // diacratics
			currChar = "";
		
		sRetText += currChar;
	}
	return sRetText;
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function MakePlainText(sInput)
{
	var sRetText = "";

	for (i=0;i<sInput.length;i++)
	{
		var currChar = sInput.charAt(i);
 
		if (currChar < "A")
				currChar = "";

		//if (currChar == " ")
		//		currChar = "";
		if (currChar == "أ" || currChar == "آ" || currChar == "إ" )
				currChar = "ا";
		
		if (currChar == "ة")
				currChar = "ه";

		if (currChar == "ى")
				currChar = "ي";

		if (currChar == "ئ" || currChar == "ؤ")
				currChar = "ء";
			
		if (currChar >= "ً") // diacratics
			currChar = "";
		
		sRetText += currChar;
	}
	//alert (sRetText);
	return sRetText;
}
////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////
function GetAyaInfo( nSuraNo )
{
	return "سورة " + gSuraNames[parseInt(nSuraNo,10)+1];// + "- آية (" + (parseInt(nAyaNo)+1) + ")";
}

function AddToMemorized(addButton)
{
		var nSuraNo = parseInt(gInfo.nSura) + 1;
		var nAyaNo  = parseInt(gInfo.nAya) + 1;
		var nLastAya= parseInt(gInfo.nLastAya) + 1;

		memorizeRange(nSuraNo, nAyaNo, nLastAya);
		addButton.disabled = true;

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