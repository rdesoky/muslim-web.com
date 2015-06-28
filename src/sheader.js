var url;
var gsAyaSymbol;
var ayaIndex;
var sura;
var aya;
var suraNo;
var	lastReciter;

BeforeBodyLoad();

function ToggleReviewMode()
{
	if(window.parent && window.parent.SuraFrame && window.parent.SuraFrame.ToggleRevMode ){
		var bNewRevMode = window.parent.SuraFrame.ToggleRevMode();
		//if(event.srcElement){
		//	event.srcElement.value = bNewRevMode ? "الغاء المراجعة" : "مراجعة الحفظ";
		//}
	}
}

function ac(suraNo,ayaNo)
{
	//window.parent.frames("main").location.href = "qtext/sura_" + sura + ".shtml#" + ayaNo;	
	window.parent.SuraFrame.location.href = "qtext/sura_" + sura + ".shtml#" + ayaNo;	
	//parent.frames("main").PreviewAya(ayaNo);
	window.parent.SuraFrame.PreviewAya(ayaNo);
}

function gotoPage(pageNo)
{
	window.parent.SuraFrame.HidePage();
	window.parent.SuraFrame.location.href = "qtext/sura_" + toStringEx(suraNo,3) + ".shtml#p" + pageNo.toString(10);	
	window.parent.SuraFrame.ShowPage(pageNo);
	window.parent.SuraFrame.SelectPage(pageNo);
}

function BeforeBodyLoad()
{
	gsAyaSymbol = "ا";
	url = window.location.href;
	ayaIndex = url.indexOf("aya=");
	sura = url.substring(ayaIndex+4,ayaIndex+7);
	aya = url.substring(ayaIndex+7,ayaIndex+10);
	suraNo = parseInt(sura,10);
}

function onBodyLoad()
{
	JClassInit();

	LoadRecitersList(idReciter);

	if(suraNo <=0 )
		idTelawa.style.display="none";

	lastReciter = readCookie("reciter");

	if (lastReciter.length > 0){
		idReciter.selectedIndex = parseInt(lastReciter,10);
	}else{
		idReciter.selectedIndex = 19;
	}

	idSaveURL.href = GetSaveURL();

	ShowHideRecitingIcons();

	idPagesChart.innerHTML = "الصفحات [ " + GetPagesButtons() + " ] ";

	window.setTimeout( "showMemReport(false)", 1000 );
}
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
function showSelection(nStart, nEnd)
{
	var currHTML = idMemChart.innerHTML;
	
	currHTML = currHTML.toLowerCase();
	currHTML = currHTML.replace("<span style=\"background:" + " " + "yellow\">", "");
	currHTML = currHTML.replace("</span>", "");

	if( nStart != -1)
	{
		var parts = currHTML.split(gsAyaSymbol);

		parts[nStart+2] =  parts[nStart+2] + "<span style=\"background:" + " " + "yellow\">";
		
		parts[nEnd+3] = "</span>" + parts[nEnd+3] ;
		
		currHTML = parts.join(gsAyaSymbol);
	}

	idMemChart.innerHTML = currHTML;
}
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
function showMemReport( no_cache )
{
	if(suraNo > 0 )
	{
		gMemorizedInfo = GetMemorizedInfo( no_cache );
		gPendingInfo   = GetPendingInfo( no_cache );

		var qPercent = quranMemPercent();
		var sPercent = suraMemPercent(suraNo );
		idQMemPercent.innerHTML = "حفظ " + qPercent + "% من القرآن";
		idSMemPercent.innerHTML = "حفظ " + sPercent + "% من السورة";

		idSMemChart.style.width = sPercent + "%";
		idQMemChart.style.width = qPercent + "%";
		
		var mem_suras     = gMemorizedInfo.split('$');
		var bending_suras = gPendingInfo.split('$');

		idMemChart.innerHTML = "الآيات [ " + 
							getSuraMemChart(suraNo, mem_suras, bending_suras, gsAyaSymbol) + " ]";
	}
}
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
function reciteSura ()
{
	var url;
	var index = suraNo;

	url = idReciter.value.replace ("%1%", index.toString() );
	url = url.replace ("%2%", toStringEx(index,3) );

	openReciter( url, index, idReciter.selectedIndex );

	window.open (	"qtext/sura_" + sura + ".shtml#top", "main", "");

	return 1;
}
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
function GetSaveURL ()
{
	var url;
	var index = suraNo;

	url = idReciter.value.replace ("%1%", index.toString() );
	url = url.replace (".ram", ".rm" );
	url = url.replace ("audio", "http://audio.islamweb.net/quran" );
	url = url.replace ("%2%", toStringEx(index,3) );
	return (url);
}
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
function changeReciter()
{
	idSaveURL.href = GetSaveURL();
	ShowHideRecitingIcons();
}
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
function ShowHideRecitingIcons()
{
	if(reciterSuras[idReciter.selectedIndex].substring(suraNo-1,suraNo) == "1"){
		idRecite.style.display = "";
	}
	else{
		idRecite.style.display = "none";
	}
}

	
function myMouseMove()
{
	try{
		if( event.srcElement.aya ){
			window.parent.SuraFrame.PreviewAya(event.srcElement.aya);
		}
		else{
			window.parent.SuraFrame.HideElement("idAyaPreview", 500);
		}
	}
	catch(e){
	}
}

////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function GetPagesButtons()
{
	var sRetStr, nSuraIndex, nStartPage, nEndPage, i;
	
	nSuraIndex = suraNo - 1;

	nStartPage	= gSuraPages[nSuraIndex];
	nEndPage	= gSuraEndPages[nSuraIndex];

	sRetStr = "";

	for( i=nStartPage; i<=nEndPage; i++ )
	{
		sRetStr += "<span class=PageButton onmouseover=\"this.style.backgroundColor='yellow';window.parent.SuraFrame.ShowPage(" + i + ");\" " + 
			"onmouseout=\"this.style.backgroundColor='';window.parent.SuraFrame.HidePage()\" onclick='gotoPage(" + i.toString(10) + ")'>" + i.toString(10) + "</span><span style='width:1px'></span>";
		if( Math.floor( i/2 ) * 2 == i ) {// even number
			sRetStr += ".";
		}
	}

	//sRetStr += "<img id=idPageView style='border-top:solid 2px white;border-left:solid 2px white;border-bottom:solid 2px gray;border-right:solid 2px gray;background-color:ivory;display:none;position:absolute;left:20px;top:100px' src='loading.gif'>";

	return sRetStr;
}

function ShowFavoriteReciters()
{
}