function doSearch( nPage )
{
	DU.show( "idResults" );
	DU.hide( "idSearchText_keyboard" );

	var sSearchText = SearchForm.idSearchText.value;
	sSearchText = ConvertUnicodeToCP1256(sSearchText);

	var sCgiUrl = "http://cgi.muslim-web.com/cgi-bin/search.pl?s=" + escape(sSearchText) + "&p=" + nPage;

	_E("idStatus").innerHTML = "جاري البحث, من فضلك الإنتظار ... " + "<img src=images/loading.gif style='position:absolute'>";

	LoadData( sCgiUrl, "DisplaySearchResults( XMLDoc(gDataResponse) )" );

	return false;
}

function DisplaySearchResults( xmlDoc )
{
	var sHTML = "";

	var xmlRoot = xmlDoc.getElementsByTagName("*")[0];
	var xmlRecords = xmlRoot.childNodes;
	
	if( 0 == xmlRecords.length )
	{
		_E("idResults").innerHTML = "لم يعثر على آيات تحتوي علي: "+ " <b>" + xmlRoot.getAttribute("search_text") + "</b>";
		return;
	}

	sHTML  = "عبارة '<b>" + xmlRoot.getAttribute("search_text") + "</b>' عثر عليها في (<b>"+ 
		xmlRoot.getAttribute("total") + 
		"</b>) آية";
	sHTML  += "<div id=idStatus style='padding:4px;font-size:10px;color:gray'></div>";

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
		var nPage = parseInt( xmlRecord.getAttribute("page") ) + 1;

		if( i==0 ){
			ShowPages();
			gotoPage(nPage);
		}

		var sHREF = "<a href='javascript:gotoPage(" + nPage + ")' onmouseover='displayAya(" + nSura + "," + nAya + ")' onmouseout='hideAya()'>";

		sHTML += "<tr><td NOWRAP style='border-top:solid 1px silver' valign=top align=left>" + sHREF +
					"<b>" + gStrings.sura_names[ nSura-1 ] + "</b>&nbsp;( آية:" + nAya + ") </a>:</td><td width=100% style='border-top:solid 1px silver'>" + 
					sHREF + ConvertCP1256ToUnicode( xmlRecord.getAttribute("aya_plain_text") ) + "</td></tr>";
	}
	sHTML  += "</table>&nbsp;" + sNavigator;

	_E("idResults").innerHTML = sHTML;
}
