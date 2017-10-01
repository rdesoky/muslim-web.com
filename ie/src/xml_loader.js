var gScriptsCount = 0;

try{ onLoadScriptFile(); } catch(e){};

var nCachePos = 0;
var gStringSources =[];

var gAsyncDownloads = new Array();
var gDownloadCache = new Array();
var gMaxConcurrentDownloads = 30;//10;

var gXmlResponse, gTextResponse;
var gHeaderDiv,gNameDiv, gLoadingProgress;
var gIEversion;


function RefreshCache()
{
	nCachePos ++;
}

function ApplyCache( sURL )
{
	var timeValue = (new Date()).getTime();

	timeValue -= (timeValue % 300000);// 5 minutes refresh interval

	timeValue += nCachePos;

	if( sURL.indexOf("?") >= 0 )
	{
		return ( sURL + "&" + timeValue );
	}
	else
	{
		return( sURL + "?" + timeValue );
	}
}

function GetXMLHTTPControl()
{
	var httpControl;

    if(window.XMLHttpRequest) {
    	try {
			httpControl = new XMLHttpRequest();
      } catch(e) {
			httpControl = false;
        }
    // branch for IE/Windows ActiveX version
    } else if(window.ActiveXObject) {
       	try {
        	httpControl = new ActiveXObject("Msxml2.XMLHTTP");
      	} catch(e) {
        	try {
          		httpControl = new ActiveXObject("Microsoft.XMLHTTP");
        	} catch(e) {
          		httpControl = false;
        	}
		}
    }
	return httpControl;
}

/////// Cached HTTP contents
function AsyncLoadXmlUrl2( sURL, sOnDownload, bCache, sPost )
{
	if(bCache)
	{
		for(var i=0; i<gDownloadCache.length ; i++ )
		{
			if( gDownloadCache[i] && gDownloadCache[i].url == sURL)
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
				return gDownloadCache[i].httpControl;
			}
		}
	}

	var index = CreateXMLHTTPDownload();

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
		var sGetURL = bCache ? sURL : ApplyCache( sURL );
		gAsyncDownloads[index].httpControl.open("GET", sGetURL , true); 
		gAsyncDownloads[index].httpControl.send(null);
	}

	gAsyncDownloads[index].canExecute = true;

	return gAsyncDownloads[index].httpControl;
}

function onXMLHTTPResponse( index )
{
	if(	gAsyncDownloads[index] && IsXmlReady( gAsyncDownloads[index].httpControl ) )
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

function XMLDOMOnDownload( index )
{
	var myDownload = gAsyncDownloads[index];

	if( !myDownload || myDownload.used <=0 )
		return;
	
	if(myDownload.canExecute == false){
		//gAsyncDownloads[index].used ++;
		window.setTimeout("XMLDOMOnDownload("  + index + ")", 1);
		return;
	}

	//if( myDownload.sOnDownload && myDownload.sOnDownload.length )
	//{
		ExecOnDOMDownload(index)
	//}
}

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
	var i;
	for( i=0; i< gAsyncDownloads.length; i++)
	{
		if( 0 == gAsyncDownloads[i].used ){
			break;
		}
	}

	if( i >= gMaxConcurrentDownloads ){
		return -1;
	}
	
	if(i == gAsyncDownloads.length)
		gAsyncDownloads[i] = new Object();

	gAsyncDownloads[i].httpControl = GetXMLHTTPControl();
	gAsyncDownloads[i].httpControl.onreadystatechange = new Function( "onXMLHTTPResponse(" + i + ")" );//window.eval( "HTTP_" + i );
	gAsyncDownloads[i].used = 1;

	return i;
}

function CreateXMLDOMDownload()
{
	var i;
	for(i=0; i< gAsyncDownloads.length; i++)
	{
		if( 0 == gAsyncDownloads[i].used ){
			break;
		}
	}

	if( i >= gMaxConcurrentDownloads ){
		return -1;
	}

	if(i == gAsyncDownloads.length)
		gAsyncDownloads[i] = new Object();

	gAsyncDownloads[i].xmlDOM = new ActiveXObject("Microsoft.XMLDOM");
	gAsyncDownloads[i].xmlDOM.onreadystatechange = new Function( "onXMLDOMResponse(" + i + ")" );//window.eval( "DOM_" + i );
	gAsyncDownloads[i].used = 1;

	return i;
}


function ExecOnDOMDownload( index, bCache )
{
	var xmlDOM = bCache ? gDownloadCache[index].xmlDOM : gAsyncDownloads[index].xmlDOM;
	var sOnDownload = bCache ? gDownloadCache[index].sOnDownload : gAsyncDownloads[index].sOnDownload;

	if(sOnDownload && sOnDownload.length ) 
	{
		var saveXmlResponse=gXmlResponse;
		gXmlResponse = gAsyncDownloads[index].xmlDOM;
		window.eval( sOnDownload );
		gXmlResponse = saveXmlResponse;
	}

	if(bCache)
	{
		gDownloadCache[index].sOnDownload = "";
	}
	else
	{
		gAsyncDownloads[index].sOnDownload = "";//TODO: check if needed
		gAsyncDownloads[index].used -- ;
		gAsyncDownloads[index].available = gAsyncDownloads[index].canExecute = false;//TODO: check if needed

		if( gAsyncDownloads[index].cache )
		{// copy it to cache 
			var cindex = gDownloadCache.length;
			gDownloadCache[cindex]=new Object();
			gDownloadCache[cindex].url = gAsyncDownloads[index].url;
			gDownloadCache[cindex].xmlDOM = gAsyncDownloads[index].xmlDOM;
			gDownloadCache[cindex].sOnDownload="";
			gAsyncDownloads[index].cache = 0;
		}
	}
}

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

		gXmlResponse = saveXmlResponse;
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
			var cindex = gDownloadCache.length;
			gDownloadCache[cindex]=new Object();
			gDownloadCache[cindex].url = gAsyncDownloads[index].url;
			gDownloadCache[cindex].httpControl = gAsyncDownloads[index].httpControl;
			gDownloadCache[cindex].sOnDownload="";
			gAsyncDownloads[index].cache = 0;
		}
	}
}

function GetData(sURL, sOnDownload, bCache)
{
	return AsyncLoadXmlUrl2(sURL, sOnDownload, bCache);
}

function AsyncLoadXmlUrl_1(sURL, sOnDownload, bCache)
{
	return AsyncLoadXmlUrl2(sURL, sOnDownload, bCache);
}

function AsyncLoadXmlUrl3(sURL, sOnDownload, bCache)
{
	if(bCache)
	{
		for(var i=0; i<gDownloadCache.length ; i++ )
		{
			var myDownload = gDownloadCache[i];

			if( myDownload && myDownload.url == sURL)
			{// found in the cache
				myDownload.sOnDownload += ";" + sOnDownload;// append the onDownload
				window.setTimeout( "ExecOnDOMDownload(" + i + ", true)" , 1 );
				return myDownload.xmlDOM;
			}
		}

		for(var i=0; i<gAsyncDownloads.length ; i++ )
		{
			if( gAsyncDownloads[i] && gAsyncDownloads[i].url == sURL && gAsyncDownloads[i].used)
			{// downloading has started already
				gAsyncDownloads[i].sOnDownload += ";" + sOnDownload;// append the onDownload
				return gAsyncDownloads[i].xmlDOM;
			}
		}
	}

	var index = CreateXMLDOMDownload();

	if( index == -1 )
	{// maximum downloads have been reached
		//document.title = "D"+document.title;
		//window.setTimeout( "AsyncLoadXmlUrl_1(\"" + sURL + "\", \"" + sOnDownload + "\", " + bCache + ")", 1000 );// retry after 1 seconds
		return null;
	}
	
	gAsyncDownloads[index].url = sURL;
	gAsyncDownloads[index].sOnDownload = sOnDownload;
	gAsyncDownloads[index].available = false;
	gAsyncDownloads[index].cache = bCache;
	gAsyncDownloads[index].canExecute = false;

	gAsyncDownloads[index].xmlDOM.async = true;
	gAsyncDownloads[index].xmlDOM.load(sURL); 

	gAsyncDownloads[index].canExecute = true;

	return gAsyncDownloads[index].xmlDOM;
}

function onXMLDOMResponse( index )
{
	if( gAsyncDownloads[index] && IsXmlReady( gAsyncDownloads[index].xmlDOM ) )
	{
		gAsyncDownloads[index].available=true;
		XMLDOMOnDownload(index);
	}
}

function IsXmlReady(xmlDOM)
{
	if( xmlDOM && xmlDOM.readyState == 4 )
		return true;
	
	return false;
}

function getProgressBar(index, total, color)
{
	var progress = Math.floor( index * 100 / total );
	return "<div style='width:150px;border:solid 1px gray;text-align:left;padding:2px'><div style='width:" + progress + 
				"%;background:" + color + "' ><div style='position:absolute;width:150px' align=center>" + progress + "%</div>&nbsp;</div></div>" ;
}
////// call this to load cacheable pages, for non-cacheable, call AysncLoadXmlUrl_1
function AsyncLoadXMLUrl2(sURL, sOnDownload, bCache)
{
	return AsyncLoadXmlUrl2(sURL, sOnDownload, bCache);
}

function PostData( sUrl, sData, sOnDownload, bRefreshCache )
{
	if( bRefreshCache ){
		RefreshCache();
	}

	return AsyncLoadXmlUrl2(sUrl, sOnDownload, false, sData);
}


