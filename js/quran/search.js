
var quranWindow;
var gConvertCP = (getCookie("cp")=="1") ? true:false;
var gResponded;
var gCheckResponseTimeout;
//window.resizeTo(624, 500);
var gCurrPage=0;

function onBodyLoad()
{
	var sKeyword = parameter("SearchText","");
	//alert(sKeyword);
	if (sKeyword.length > 0)
	{
		SearchForm.SearchText.value = sKeyword;
		onSearch(SearchForm);
	}

	window.focus();
	document.SearchForm.idSearchText.focus();
}

function onSearch(myForm)
{	
	if( myForm.idSearchText.value.length==0 )
		return false;

	hideAya();
	
	doSearch( 0 );

	idResults.innerHTML = "جاري البحث...";

	return true;
}

function onCommonSelect(sText)
{
	SearchForm.idSearchText.value = sText;
	SearchForm.submit();
}

function doSearch( nPage )
{
	var sSearchText = SearchForm.idSearchText.value;
	sSearchText = ConvertUnicodeToCP1256(sSearchText);
	//alert(sSearchText);

	var sCgiUrl = "http://cgi.muslim-web.com/cgi-bin/search.pl?s=" + escape(sSearchText) + "&p=" + nPage;

	idStatus.innerHTML = "جاري البحث, من فضلك الإنتظار ... " + "<img src=images/wait.gif style='position:absolute'>";

	LoadData( sCgiUrl, "DisplaySearchResults( XMLDoc(gDataResponse) )", true );
}

function DisplaySearchResults( xmlDoc )
{
	var sHTML = "";

	var xmlRoot = xmlDoc.selectNodes("*")[0];
	var xmlRecords = xmlRoot.childNodes;

	if( 0 == xmlRecords.length )
	{
		idResults.innerHTML = "لم يعثر على آيات تحتوي علي: "+ " <b>" + xmlRoot.getAttribute("search_text") + "</b>";
		return;
	}

	sHTML  = "عبارة '<b>" + xmlRoot.getAttribute("search_text") + "</b>' عثر عليها في (<b>"+ 
		xmlRoot.getAttribute("total") + 
		"</b>) آية";
	sHTML  += "<div id=idStatus style='padding:4px;font-size:10px;color:gray'>حرك مؤشر الماوس فوق سطر الآية لعرضها كاملة بالتشكيل أو انقر على السطر بالماوس لعرض السورة والتفسير</div>";

	var sNavigator  = "<div align=center style='padding:4px' style='border-top:solid 1px silver' >" + 
				GetResultsNavigator(xmlRoot.getAttribute("total"), 
									parseInt( xmlRoot.getAttribute("page_size") ), 
									parseInt( xmlRoot.getAttribute("page"     ) ), 
									1, 
									"doSearch(%p%)", 
									false ) + 
			"</div>" ;

	sHTML  += sNavigator + "<table width=99% cellspacing=0 cellpadding=3>";

	for( var i=0; i<xmlRecords.length ; i++ )
	{
		var xmlRecord = xmlRecords.item(i);
		var nSura = parseInt( xmlRecord.getAttribute("sura_num") ) + 1;
		var nAya = parseInt( xmlRecord.getAttribute("aya_num") ) + 1;
		var sHREF = "<a href='javascript:showAya(" + nSura + "," + nAya + ")' onmouseover='displayAya(" + nSura + "," + nAya + ")' onmouseout='hideAya()'>";

		sHTML += "<tr><td NOWRAP style='border-top:solid 1px silver' valign=top align=left>" + sHREF +
					"<b>" + gSuraNames[ nSura ] + "</b>&nbsp;( آية:" + nAya + ") </a>:</td><td width=100% style='border-top:solid 1px silver'>" + 
					sHREF + ConvertCP1256ToUnicode( xmlRecord.getAttribute("aya_plain_text") ) + "</td></tr>";
	}
	sHTML  += "</table>&nbsp;" + sNavigator;

	idResults.innerHTML = sHTML;
}


function activateQuran()
{
	quranWindow.focus();
}

function showAya( suraNo,ayaNo)
{
	quranWindow = window.open("sura.htm?aya=" + toStringEx(suraNo ,3) + toStringEx(ayaNo ,3) , "quran");
	setTimeout(activateQuran,1000);
}

var gImageTimer = null;

function displayAya(suraNo, ayaNo)
{
	idAyaPic.style.top = document.body.scrollTop + 4;
	idAyaPic.src = gsAyatImageURL + (suraNo).toString(10) + "_" + toStringEx(ayaNo ,3) + ".gif";
	//idAyaPic.src = "http://12.234.87.231/ayaimage/" + suraNo.toString(10) + "_" + toStringEx(ayaNo,3) + ".gif";
	ShowElement("idAyaPic",1000)
}


function hideAya()
{
	HideElement("idAyaPic",500)
}

function getString( sName )
{
	if(sName=="page")
		return "صفحة";
	if(sName=="next")
		return "تالي";
	if(sName=="previous")
		return "سابق";
	if(sName=="first")
		return "أولى";
	if(sName=="last")
		return "أخيرة";
	
	return sName;
}

function getHelpTag()
{
	return "";
}