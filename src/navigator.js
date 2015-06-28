function GetResultsNavigator( nTotalCount, nPageSize ,nCurrPage, nStep, sOnClick, bReverse )
{
	var nPagesCount = Math.floor( (nTotalCount-1) / nPageSize) + 1;

	if (nPagesCount <=1 )
	{
		return "";
	}

	var sNextPage, sPrevPage, sFirstPage, sLastPage;
	var sNavigator = "";
	var nMaxPages = 10;
	var nStartPage = Math.floor(nCurrPage/nMaxPages) * nMaxPages - 1;
	nStartPage = nStartPage > 0 ? nStartPage : 0;
	var nEndPage = nStartPage + nMaxPages + (nStartPage > 0?2:1);
	nEndPage = nEndPage < nPagesCount ? nEndPage : nPagesCount;

	if( bReverse ){
		sNextPage="prev_page";sPrevPage="next_page";sFirstPage="last_page";sLastPage="first_page";
	}
	else{
		sNextPage="next_page";sPrevPage="prev_page";sFirstPage="first_page";sLastPage="last_page";
	}

	if (nCurrPage>0)
	{
		sNavigator += "<input type=button id=idFirst1 onclick=\"" + sOnClick.replace( "%p%", 0 ) + "\" " + getHelpTag("sresults/" + sFirstPage) + " class=toolbar_button value='" + getString("first","layout","idFirst1") + "' >";
	}
	if (nCurrPage>1)
	{
		sNavigator += "<input type=button id=idPrev1 onclick=\"" + sOnClick.replace( "%p%", nCurrPage - 1 ) + "\" " + getHelpTag("sresults/" + sPrevPage) + "class=toolbar_button value='" + getString("previous","layout","idPrev1") + "' >";
	}
	
	sNavigator += getString("page") + ":";

	var sDisplayPageNo;

	for (nPage=nStartPage; nPage<nEndPage ; nPage ++ )
	{
		if( bReverse )
			sDisplayPageNo = (nPagesCount - nPage).toString();
		else
			sDisplayPageNo = (nPage+1).toString();

		if( (nPage%5) == 0)
			sNavigator += GetHSpacer(5);

		if (nCurrPage == nPage )
			sNavigator += "<span style='background:yellow;font-weight:bold'>&nbsp;" + sDisplayPageNo + "&nbsp;</span>" ;	
		else
			sNavigator += "<input type=button onclick=\"" + sOnClick.replace( "%p%", nPage ) + "\" " + getHelpTag("sresults/goto_page").replace("%n%",sDisplayPageNo) + " class=toolbar_button value='" + sDisplayPageNo + "' >";	
	}

	sNavigator += "&nbsp;&nbsp;";

	if( nCurrPage < nPagesCount-2 )
	{
		sNavigator += "<input type=button id=idNext1 onclick=\"" + sOnClick.replace( "%p%", nCurrPage + 1 ) + "\" " + getHelpTag("sresults/" + sNextPage) + " class=toolbar_button value='" + getString("next","layout","idNext1") + "' >";
	}

	if( nCurrPage < nPagesCount-1 )
	{
		sNavigator += "<input type=button id=idLast1 onclick=\"" + sOnClick.replace( "%p%", nPagesCount - 1 ) + "\" " + getHelpTag("sresults/" + sLastPage) + " class=toolbar_button value='" + getString("last","layout","idLast1") + "' >";
	}
	
	return sNavigator;

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
