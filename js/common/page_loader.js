	//try{ OnLoadScriptFile("page_loader");}catch(e){}

//var gFooterAd = "ads/footer.htm?v=4";
//var gLeftAd   = "ads/left.htm?v=4";
//var gRightAd  ="ads/right.htm?v=4";

var gScriptsLoader = {};

function onNavigate()
{
	if(gScriptsCount!=gTotalScripts){
		//alert("Total:" + gTotalScripts + ", Loaded:" + gScriptsCount);
		return;// error case missing essential script
	}

	//alert("onNavigate()");
	
	// extract the page name from the current URL's bookmark part
	var url = new CPageUrl();
	var sPage = url.m_sPage;

	//append page version number
	//var sVersion = "?v=" + gPageVers[sPage];
	var no_extension;
	var dotIndex = sPage.indexOf('.');
	
	if(dotIndex>0)
	{
		no_extension = sPage.substr(0,dotIndex);
	}
	else
	{
		no_extension = sPage;
		sPage += ".htm";// default extension
	}

	if(sPage.length)
	{
		//alert( "LoadPage(" + sPage + ")" );
		LoadPage( sPage, "js/" + no_extension + ".js", "callPageInit('" + no_extension + "')" );
		//LoadPage( sPage + ".htm" + sVersion , sPage + ".js", sPage + "_OnBodyLoad()" );
	}
}

function callPageInit(sPageName)
{
	//alert(sPageName);
	if( typeof ( window[ sPageName + "_OnBodyLoad" ] ) == "function" )
	{
		eval( sPageName + "_OnBodyLoad()" );
	}
}

function ApplyPageVersion(sPageURL)
{

	var prefix  = RegExp(".*\/");
	var postfix = RegExp("\.htm.*|\.shtm.*|\.xml\.js.*|\.js|\.xml");
	
	var page_id = (sPageURL.replace(prefix,"")).replace(postfix,"");


	var sVersion = gPageVers[page_id];

	if(page_id == "home"){
		sVersion += gLanguage;
	}

	if(! int(sVersion) )
		sVersion = "071209";
	
	var retValue = SetURLParam(sPageURL, "v", sVersion);

	//alert( "before: " + sPageURL + "\nafter: " + page_id + "\nversion: " + sVersion + "\nURL: " + retValue);
	
	if( window.location.hostname.indexOf("dev.") != -1 ) {
		retValue = retValue.replace("js/", "js/src/");
	}

	return retValue.replace("%lang%", gLanguage);
}

function OpenURL( sURL, param_editor, bReplace )
{
	if( param_editor ){
		sURL = SetURLParams( sURL, param_editor );
	}
	var url = new CPageUrl(sURL);
	OpenPage( url.m_sBaseURL, url.getQuery(), bReplace );
}

function OpenPage( sPage, sQuery, bReplace )
{
	if(gScriptsCount!=gTotalScripts){
		alert("Total:" + gTotalScripts + ", Loaded:" + gScriptsCount);
		return;// error case missing essential script
	}

	if(!sPage){
		sPage = gPageUrl.m_sPage;
		sQuery = gPageUrl.getQuery();
	}
	
	if(!Defined(sQuery))
	{
		sQuery = gPageUrl.getQuery();
	}

	if( typeof sQuery == "object" )
	{// param editor
		return OpenURL(sPage + "?" + gPageUrl.getQuery(), sQuery, bReplace );
	}

	sQuery = "&" + sQuery;

	gProcessingCount = 0;
	ShowProcessing();

	if(bReplace){
		idKoboolNavigator.location.replace( "nav3.htm?" + sPage + sQuery );
	}
	else{
		idKoboolNavigator.location.href= "nav3.htm?" + sPage + sQuery;
	}
}

function LoadScriptFile( sFileName, sOnLoadEvent )
{
	if( DocElement( ScriptID(sFileName) ) ){
		window.setTimeout(sOnLoadEvent,1);
		return false;
	}

	var myScript  = document.createElement("script"); 
	myScript.id	  = ScriptID(sFileName);
	myScript.type = "text/javascript";
	//if(gLanguage=="ar"){
		myScript.charset = "windows-1256";
	//}

	myScript.onLoadEvent = sOnLoadEvent;
	myScript.onreadystatechange = function ScriptReadyStateChange()
	{
		//alert(this.readyState);
		if(this.readyState=="loaded" || this.readyState=="complete"){
			//document.title = this.onLoadEvent + ":" + document.title;
			window.setTimeout(this.onLoadEvent,1);
		}
	};

	
	myScript.src = ApplyPageVersion( gScriptBase + sFileName );
	
	document.appendChild( myScript );//append the script to the document, that will execute the script
	return true;
}

function LoadCgiJScript( cgi_url, onLoad )
{
	GetData(cgi_url, "eval(gTextResponse);" + onLoad );
}

function ScriptID(sURL)
{
	return sURL.replaceAll( "/", "_" );
}

function LoadPage( htmlURL, jsURL, sPageInit )
{
	gPageUrl	  = new CPageUrl();
	gPageParams   = new CPageParams();

	if(PageContents.mOnLoadPage){
		eval(PageContents.mOnLoadPage);
	}

	PageContents.mPageInit = sPageInit;
	PageContents.mJScript = jsURL;

	if( PageContents.page_name == htmlURL )
	{// loading same page 
		HideProcessing();
		DebugPrint(sPageInit);
		window.setTimeout(sPageInit,1);// 
		if(DocElement("PageInit")){
			PageInit.initPage();
		}
		return;
	}
	
	PageContents.page_name = htmlURL;
	//alert( ApplyPageVersion(htmlURL) );
	//GetData( ApplyPageVersion(htmlURL), "OnPageLoaded()" ,	true );
	//alert("PageContents.getPage(" + htmlURL + ")");
	PageContents.getPage( htmlURL, "OnPageLoaded()" );

}

function OnPageLoaded()
{
	//ShowElement( "MainBody" );
	//alert(gTextResponse);
	setHTML( "PageContents", ProcessTemplate(gTextResponse) );

	gProcessingCount = 1;

	HideProcessing();
	
	LoadScriptFile( PageContents.mJScript , "SafeInitDocObjects('PageInit');" + PageContents.mPageInit );

	ScrollTop();
}


//function LoadStringResource( index )
//{
//	if( index < gPreloadedStringSources.length )
//	{
//		setHTML( "idLoadingProgress", getProgressBar( index+1, gPreloadedStringSources.length, "orange" ) );
//
//		var fileName = gPreloadedStringSources[index];
//
//		var sVersion = "?v=" + gPageVers[fileName];
//
//		GetData( "/res/" + gLanguage + "/strings/" + fileName + ".xml" + sVersion, 
//				 "OnLoadStringResource(" + index + ", gXmlResponse)", 
//				 true);
//	}
//	else
//	{
//		ExecOnBodyLoad();
//		//setHTML( "idDownloadTitle", "Downloading Images (3/3)" );
//
//		//PreloadImages(	[
//		//					"images/search.gif",
//		//					"images/plus.gif",
//		//					"images/bg_pxl.jpg",
//		//					"images/space.gif",
//		//					"images/help_ico.gif"
//		//				], 
//		//				"onPreLoadImage(%n%,%t%)", 
//		//				"document.body.onload2()"
//		//			);
//	}
//}

//function OnLoadStringResource( index, xmlResponse )
//{
//	gStringSources[ gPreloadedStringSources[index] ] = xmlResponse;
//	LoadStringResource( index + 1);
//}

//function onPreLoadImage( index, total )
//{
//	if( gLoadingProgress || ( gLoadingProgress = DocElement("idLoadingProgress") ) )
//	{
//		gLoadingProgress.innerHTML = getProgressBar( index , total, "#CCFFAA" );
//	}
//}

//function LoadResources()
//{
//	setHTML( "idDownloadTitle", "Downloading Text (2/2)" );
//	
//	LoadStringResource(0);
//}
