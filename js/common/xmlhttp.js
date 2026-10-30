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

	this.getXMLHttp = function GetXMLHttp()
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

		if(this.mXMLHttp)
		{
			var self = this;
			this.mXMLHttp.onreadystatechange = function mXMLHttp_onreadystatechange()
			{
				if( document.getElementById( self.sID ) )
				{	
					self.onReadyStateChange();
				}
				else
				{
					self.abort();
				}
			};
			//	new Function( "if(document.getElementById('" + this.sID + "')){" + this.sID + ".onReadyStateChange()}" );
		}
		
		return this.mXMLHttp;
	};
	
	this.getData = function( url, sOnLoad )
	{
		if( this.getXMLHttp() )
		{
			if(sOnLoad)
			{
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

	this.onReadyStateChange = function XMLHttpOnReadStateChange()
	{
		if( this.mXMLHttp.readyState == 4 )
		{
			window.setTimeout( "if(document.getElementById('" + this.uniqueID + "')){" + this.uniqueID + ".execOnReady()}",1 );
			//this.execOnReady();
		}
	};

	this.execOnReady = function()
	{
		if( this.mXMLHttp )
		{
			if( this.mXMLHttp.readyState == 4 )
			{
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
		if( this.mXMLHttp && this.mXMLHttp.readyState != 4 )
		{
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

	timeValue -= (timeValue % (15 * 60000));// 15 minutes refresh interval

	timeValue += nCachePos;

	return SetURLParam( sURL, "tmc", timeValue );
}


function GetXMLHTTPControl()
{
	var httpControl;

	if(window.XMLHttpRequest) 
	{
		try
		{
			httpControl = new XMLHttpRequest();
		}
		catch(e)
		{
			return;	
		}
	} 
	else if(window.ActiveXObject) 
	{// branch for IE/Windows ActiveX version
		try
		{
			httpControl = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch(e)
		{
			try
			{
				httpControl = new ActiveXObject("Microsoft.XMLHTTP");
			} 
			catch(e)
			{
				return;
			}
		}
	}
	
	return httpControl;
}


/////// Cached HTTP contents
function GetData( sURL, sOnDownload, bCache, sPost )
{
	var asyncDownload;
	if( !sPost )
	{
		for( var i=0, len=gDownloadCache.length; i<len ; i++ )
		{// search cache
			var downloadCache = gDownloadCache[i];
			if( downloadCache && downloadCache.url == sURL )
			{// already downloaded in the cache
				downloadCache.sOnDownload += ";" + sOnDownload;// append the onDownload
				window.setTimeout( "ExecOnHTTPDownload(" + i + ",true)", 1 );
				return downloadCache.httpControl;
			}
		}

		for(var i=0, len=gAsyncDownloads.length; i<len ; i++ )
		{// search running downloads
			asyncDownload = gAsyncDownloads[i];
			
			if( asyncDownload && asyncDownload.url == sURL && asyncDownload.used )
			{// downloading has started already
				asyncDownload.sOnDownload += ";" + sOnDownload;// append the onDownload
				return asyncDownload.httpControl;
			}
		}
	}

	asyncDownload = CreateXMLHTTPDownload();// add or reuse existing download slot

	if( !asyncDownload ){
		return null;
	}

	CopyObject( asyncDownload,	
				{
					url: sURL,
					sOnDownload: sOnDownload,
					available: false,
					cache: bCache,
					canExecute: false
				}
	);
	
	if(sPost)
	{
		asyncDownload.httpControl.open("POST", sURL, true); 
		asyncDownload.httpControl.send(sPost);
	}
	else
	{
		var sGetURL = bCache ? ApplyPageVersion(sURL) : ApplyCache( sURL );
		asyncDownload.httpControl.open("GET", sGetURL , true); 
		asyncDownload.httpControl.send(null);
	}

	asyncDownload.canExecute = true;

	return asyncDownload.httpControl;
}

function XMLHTTPOnDownload( index )
{
	var myDownload = gAsyncDownloads[ index ];

	if( !myDownload || myDownload.used <=0 )
		return;
	
	if(myDownload.canExecute == false)
	{// wait until canExecute is true
		window.setTimeout( "XMLHTTPOnDownload(" + index + ")", 1 );
		return;
	}

	ExecOnHTTPDownload(index);
}

function CreateXMLHTTPDownload()
{
	var index;

	for( index=0; index< gAsyncDownloads.length; index++ ){
		if( 0 == gAsyncDownloads[index].used )
		{
			break;// found resusable item
		}
	}

	if( index >= gMaxConcurrentDownloads ){
		return null;
	}

	var asyncDownload = {
		used : 1,
		httpControl: GetXMLHTTPControl()
	};

	asyncDownload.httpControl.onreadystatechange= function OnReadtStateChange()
									{ 
										if(	IsXmlReady( gAsyncDownloads[index].httpControl ) )
										{ 
											gAsyncDownloads[index].available = true;
											XMLHTTPOnDownload( index );
										}
									};

	gAsyncDownloads[index] = asyncDownload;// update or push

	return asyncDownload;
}

function ExecOnHTTPDownload( index, bCache )
{
	var sOnDownload = bCache ? gDownloadCache[index].sOnDownload : gAsyncDownloads[index].sOnDownload;

	if( sOnDownload && sOnDownload.length )
	{
		var httpControl = bCache ? gDownloadCache[index].httpControl : gAsyncDownloads[index].httpControl;
		var saveXmlResponse = gXmlResponse;
		var saveTextResponse = gTextResponse;

		gXmlResponse  = httpControl.responseXML;
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
			gDownloadCache.push({	url : gAsyncDownloads[index].url, 
									httpControl : gAsyncDownloads[index].httpControl, 
									sOnDownload : "", 
									cache : 0 
								}
			);
		}
	}
}

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

