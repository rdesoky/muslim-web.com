var nCachePos = 0;
var gStringSources = [];

var gAsyncDownloads = [];
var gDownloadCache = [];
var gMaxConcurrentDownloads = 30;//10;

var gXmlResponse, gTextResponse;
//var gHeaderDiv,gNameDiv, gLoadingProgress;

function JCXMLHttp()
{
	JCXMLHttp.mLoading = "loading...";

	this.add2FreeMe( ["mXMLHttp","mLoadingPage","mLoading"]);

	this.getXMLHttp = function()
	{
		if(this.mXMLHttp)
		{
			if(this.mLoadingPage && gPagesCache[this.mLoadingPage] == JCXMLHttp.mLoading )
			{
				gPagesCache[this.mLoadingPage] = "";
			}

			this.mXMLHttp.abort();
			this.mXMLHttp = null;
		}

		this.mXMLHttp = GetXMLHTTPControl();
		if(this.mXMLHttp){
			this.mXMLHttp.onreadystatechange = new Function( "if(document.getElementById('" + this.uniqueID + "')){" + this.sID + ".onReadyStateChange()}" );
		}
		return this.mXMLHttp;
	};
	
	this.getData = function(url, sOnLoad)
	{
		if( this.getXMLHttp() )
		{
			if(sOnLoad){
				this.mOnResponseReady = sOnLoad;
			}

			url = ApplyCache(url);
			//alert(url);
			this.mXMLHttp.open("GET", url, true); 
			this.mXMLHttp.send(); 
		}
	};

	this.getPage = function(url, sOnLoad)
	{
		//alert("PageContents.getPage(" + url + ")");

		if(gPagesCache[url])
		{
			//htmlAlert("Cached:" + url);
			if(gPagesCache[url] == JCXMLHttp.mLoading)
			{// loading in progress, wait till finishing
				//htmlAlert('loading...');
				window.setTimeout("if(document.getElementById(\"" + this.uniqueID + "\")){" + this.uniqueID + ".getPage(\"" + url + "\",\"" + sOnLoad + "\")};", 100);
				return;
			}
			if(sOnLoad){
				window.setTimeout("gTextResponse=gPagesCache['" + url + "'];" + sOnLoad , 1);
			}
			return;
		}

		
		if( this.getXMLHttp() )
		{
			//htmlAlert("loading:" + url);
			this.mLoadingPage = url;
			gPagesCache[url] = JCXMLHttp.mLoading;
			this.mOnResponseReady = this.uniqueID + ".mLoadingPage='nothing';gPagesCache['" + url + "']=gTextResponse;";

			if(sOnLoad){
				this.mOnResponseReady += sOnLoad;
			}

			url = ApplyPageVersion(url);
			//htmlAlert("getPage(" + url + ")" );
			//alert(url);
			this.mXMLHttp.open("GET", url, true); 
			this.mXMLHttp.send(); 
			//GetData(url,this.mOnResponseReady,true);
		}
	};

	this.postData = function(url, sPost, sOnLoad, bRefreshCache)
	{
		if( this.getXMLHttp() )
		{
			this.mOnResponseReady = sOnLoad;
			this.mXMLHttp.open("POST", url, true); 
			this.mXMLHttp.send(sPost); 

			if( bRefreshCache ){
				RefreshCache();
			}
		}
	};

	this.onReadyStateChange = function XMLHttpOnReadStateChange(){
		if( this.mXMLHttp.readyState == 4 )
		{
			window.setTimeout( "if(document.getElementById('" + this.uniqueID + "')){" + this.uniqueID + ".execOnReady()}",1 );
			//this.execOnReady();
		}
	};

	this.execOnReady = function()
	{
		if(this.mXMLHttp)
		{
			if( this.mXMLHttp.readyState == 4){
				gTextResponse = this.mXMLHttp.responseText;
				gXmlResponse  = this.mXMLHttp.responseXML;
				
				if(this.mOnResponseReady){
					eval( this.mOnResponseReady );
				}
			}
			
			//this.mXMLHttp = null;// stop memory leak
		}
	};

	this.abort = function()
	{
		if(this.mXMLHttp && this.mXMLHttp.readyState != 4){
			this.mXMLHttp.abort();
			this.mXMLHttp = null;
			return true;
		}
		return false;
	};
}


function RefreshCache()
{
	nCachePos ++;
}

function ApplyCache( sURL )
{
	var timeValue = (new Date()).getTime();

	//timeValue -= (timeValue % (300000));// 5 minutes refresh interval

	timeValue -= (timeValue % (15 * 60000));// 15 minutes refresh interval

	timeValue += nCachePos;

	return SetURLParam( sURL, "tmc", timeValue );
}


function GetXMLHTTPControl()
{
	var httpControl;

	if(window.XMLHttpRequest) 
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


/////// Cached HTTP contents
function GetData( sURL, sOnDownload, bCache, sPost )
{
	if(!sPost)
	{
		for( var i=0; i<gDownloadCache.length ; i++ )
		{
			if( gDownloadCache[i] && gDownloadCache[i].url == sURL )
			{// already downloaded in the cache
				gDownloadCache[i].sOnDownload += ";" + sOnDownload;// append the onDownload
				window.setTimeout( "ExecOnHTTPDownload(" + i + ",true)", 1 );
				return gDownloadCache[i].httpControl;
			}
		}

		for(var i=0; i<gAsyncDownloads.length ; i++ )
		{
			if( gAsyncDownloads[i] && gAsyncDownloads[i].url == sURL && gAsyncDownloads[i].used)
			{// downloading has started already
				gAsyncDownloads[i].sOnDownload += ";" + sOnDownload;// append the onDownload
				//return gDownloadCache[i].httpControl;
				return gAsyncDownloads[i].httpControl;
			}
		}
	}

	var index = CreateXMLHTTPDownload();// add or reuse existing download slot

	if( index == -1 )
	{// maximum downloads have been reached
		//document.title = "H"+document.title;
		//window.setTimeout( "AsyncLoadXmlUrl2(\"" + sURL + 
		//					"\", \"" + sOnDownload + "\", " + bCache + ",\"" + sPost + "\")", 1000 );// retry after 1 seconds
		return null;
	}

	gAsyncDownloads[index].url = sURL;
	gAsyncDownloads[index].sOnDownload = sOnDownload;

	gAsyncDownloads[index].available = false;
	gAsyncDownloads[index].cache = bCache;
	gAsyncDownloads[index].canExecute = false;

	if(sPost)
	{
		gAsyncDownloads[index].httpControl.open("POST", sURL, true); 
		gAsyncDownloads[index].httpControl.send(sPost);
	}
	else
	{
		var sGetURL = bCache ? ApplyPageVersion(sURL) : ApplyCache( sURL );
		gAsyncDownloads[index].httpControl.open("GET", sGetURL , true); 
		gAsyncDownloads[index].httpControl.send(null);
	}

	gAsyncDownloads[index].canExecute = true;

	return gAsyncDownloads[index].httpControl;
}

function onXMLHTTPResponse( index )
{
	//htmlAlert(gAsyncDownloads[index].httpControl.readyState + ":" + gAsyncDownloads[index].url);

	if(	IsXmlReady( gAsyncDownloads[index].httpControl ) )
	{ 
		gAsyncDownloads[index].available=true;
		XMLHTTPOnDownload( index );
	}
}
function GetXMLDoc(XmlHttpResponse)
{
	if (!XmlHttpResponse)
		return null;

	if( XmlHttpResponse.responseXML && XmlHttpResponse.responseXML.xml && XmlHttpResponse.responseXML.xml.length )
		return XmlHttpResponse.responseXML;
	
	return null;
}

//function XMLDOMOnDownload( index )
//{
//	var myDownload = gAsyncDownloads[index];
//
//	if( !myDownload || myDownload.used <=0 )
//		return;
	
//	if(myDownload.canExecute == false){
//		//gAsyncDownloads[index].used ++;
//		window.setTimeout("XMLDOMOnDownload("  + index + ")", 1);
//		return;
//	}

//	ExecOnDOMDownload(index)
//}

function XMLHTTPOnDownload( index )
{
	var myDownload = gAsyncDownloads[ index ];

	if( !myDownload || myDownload.used <=0 )
		return;
	
	if(myDownload.canExecute == false){
		//gAsyncDownloads[index].used ++;
		window.setTimeout("XMLHTTPOnDownload("  + index + ")", 1);
		return;
	}

	//if( myDownload.sOnDownload && myDownload.sOnDownload.length ){
		ExecOnHTTPDownload(index);
	//}
}

function CreateXMLHTTPDownload()
{
	var index;

	for( index=0; index< gAsyncDownloads.length; index++){
		if( 0 == gAsyncDownloads[index].used ){
			break;
		}
	}

	if( index >= gMaxConcurrentDownloads ){
		return -1;
	}
	
	if( index == gAsyncDownloads.length )
	{// add new download
		gAsyncDownloads[index]={};
	}
	else{
		delete gAsyncDownloads[index].httpControl;
	}

	gAsyncDownloads[index].httpControl = new GetXMLHTTPControl();
	gAsyncDownloads[index].httpControl.onreadystatechange = new Function( "onXMLHTTPResponse(" + index + ")" );
	gAsyncDownloads[index].used = 1;


	return index;
}

//function CreateXMLDOMDownload()
//{
//	var i;
//	for(i=0; i< gAsyncDownloads.length; i++)
//	{
//		if( 0 == gAsyncDownloads[i].used ){
//			break;
//		}
//	}

//	if( i >= gMaxConcurrentDownloads ){
//		return -1;
//	}

//	if(i == gAsyncDownloads.length)
//		gAsyncDownloads[i] = new Object();

//	gAsyncDownloads[i].xmlDOM = new ActiveXObject("Microsoft.XMLDOM");
//	gAsyncDownloads[i].xmlDOM.onreadystatechange = new Function( "onXMLDOMResponse(" + i + ")" );//window.eval( "DOM_" + i );
//	gAsyncDownloads[i].used = 1;

//	return i;
//}


//function ExecOnDOMDownload( index, bCache )
//{
//	var xmlDOM = bCache ? gDownloadCache[index].xmlDOM : gAsyncDownloads[index].xmlDOM;
//	var sOnDownload = bCache ? gDownloadCache[index].sOnDownload : gAsyncDownloads[index].sOnDownload;

//	if(sOnDownload && sOnDownload.length ) 
//	{
//		var saveXmlResponse=gXmlResponse;
//		gXmlResponse = gAsyncDownloads[index].xmlDOM;
//		window.eval( sOnDownload );
//		gXmlResponse = saveXmlResponse;
//	}

//	if(bCache)
//	{
//		gDownloadCache[index].sOnDownload = "";
//	}
//	else
//	{
//		gAsyncDownloads[index].sOnDownload = "";//TODO: check if needed
//		gAsyncDownloads[index].used -- ;
//		gAsyncDownloads[index].available = gAsyncDownloads[index].canExecute = false;//TODO: check if needed

//		if( gAsyncDownloads[index].cache )
//		{// copy it to cache 
//			//var cindex = gDownloadCache.length;
//			//gDownloadCache[cindex]=new Object();
//			//gDownloadCache[cindex].url = gAsyncDownloads[index].url;
//			//gDownloadCache[cindex].xmlDOM = gAsyncDownloads[index].xmlDOM;
//			//gDownloadCache[cindex].sOnDownload="";
//
//			gDownloadCache[gDownloadCache.length] = {
//						url:gAsyncDownloads[index].url, 
//						xmlDOM:gAsyncDownloads[index].xmlDOM,
//						sOnDownload:""
//					};
//
//			gAsyncDownloads[index].cache = 0;
//		}
//	}
//}

function ExecOnHTTPDownload( index, bCache )
{
	var sOnDownload = bCache ? gDownloadCache[index].sOnDownload : gAsyncDownloads[index].sOnDownload;

	if( sOnDownload && sOnDownload.length )
	{
		var httpControl = bCache ? gDownloadCache[index].httpControl : gAsyncDownloads[index].httpControl;
		var saveXmlResponse = gXmlResponse;
		var saveTextResponse = gTextResponse;

		gXmlResponse  = httpControl.responseXML;// Consider using GetXMLDoc(myDownload.httpControl);
		gTextResponse = httpControl.responseText;

		window.eval( sOnDownload );

		gXmlResponse  = saveXmlResponse;
		gTextResponse = saveTextResponse;
	}
	if(bCache)
	{
		gDownloadCache[index].sOnDownload = "";
	}
	else
	{
		gAsyncDownloads[index].used -- ;// to be reused by other download requests
		gAsyncDownloads[index].sOnDownload = "";//TODO: check if needed
		gAsyncDownloads[index].available = gAsyncDownloads[index].canExecute = false;//TODO: check if needed

		if( gAsyncDownloads[index].cache )
		{
			gDownloadCache[gDownloadCache.length] = {	url : gAsyncDownloads[index].url, 
														httpControl : gAsyncDownloads[index].httpControl, 
														sOnDownload : "", 
														cache : 0 
													};
		}
	}
}

//function AsyncLoadXmlUrl_1(sURL, sOnDownload, bCache)
//{
//	return GetData(sURL, sOnDownload, bCache);
//}

//function AsyncLoadXmlUrl3(sURL, sOnDownload, bCache)
//{
//	if(bCache)
//	{
//		for(var i=0; i<gDownloadCache.length ; i++ )
//		{
//			var myDownload = gDownloadCache[i];
//
//			if( myDownload && myDownload.url == sURL)
//			{// found in the cache
//				myDownload.sOnDownload += ";" + sOnDownload;// append the onDownload
//				window.setTimeout( "ExecOnDOMDownload(" + i + ", true)" , 1 );
//				return myDownload.xmlDOM;
//			}
//		}
//
//		for(var i=0; i<gAsyncDownloads.length ; i++ )
//		{
//			if( gAsyncDownloads[i] && gAsyncDownloads[i].url == sURL && gAsyncDownloads[i].used)
//			{// downloading has started already
//				gAsyncDownloads[i].sOnDownload += ";" + sOnDownload;// append the onDownload
//				return gAsyncDownloads[i].xmlDOM;
//			}
//		}
//	}

//	var index = CreateXMLDOMDownload();
//
//	if( index == -1 )
//	{// maximum downloads have been reached
//		//document.title = "D"+document.title;
//		//window.setTimeout( "AsyncLoadXmlUrl_1(\"" + sURL + "\", \"" + sOnDownload + "\", " + bCache + ")", 1000 );// retry after 1 seconds
//		return null;
//	}
//	var dwn = gAsyncDownloads[index];
//	dwn.url = sURL;
//	dwn.sOnDownload = sOnDownload;
//	dwn.available = false;
//	dwn.cache = bCache;
//	dwn.canExecute = false;
//
//	dwn.xmlDOM.async = true;
//	dwn.xmlDOM.load(sURL); 

//	dwn.canExecute = true;
//
//	return dwn.xmlDOM;
//}

//function onXMLDOMResponse( index )
//{
//	if( gAsyncDownloads[index] && IsXmlReady( gAsyncDownloads[index].xmlDOM ) )
//	{
//		gAsyncDownloads[index].available=true;
//		XMLDOMOnDownload(index);
//	}
//}

function IsXmlReady(xmlDOM)
{
	if( xmlDOM && xmlDOM.readyState == 4 )
		return true;
	
	return false;
}

function PostData( sUrl, sData, sOnDownload, bRefreshCache )
{
	if( bRefreshCache ){
		RefreshCache();
	}

	if(!sData || !sData.length )
		sData = "x";

	return GetData(sUrl, sOnDownload, false, sData);
}

function FreeXmlLoader()
{
	var i;
	for( i=0; i<gAsyncDownloads.length ; i++)
	{
		if( gAsyncDownloads[i].httpControl ){
			delete gAsyncDownloads[i].httpControl;
		}
		delete gAsyncDownloads[i];
	}
	gAsyncDownloads.length=0;

	for( i=0; i<gDownloadCache.length ; i++)
	{
		if( gDownloadCache[i].httpControl ){
			delete gDownloadCache[i].httpControl;
		}
		delete gDownloadCache[i];
	}
	gDownloadCache.length=0;
}

