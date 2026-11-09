//try{ OnLoadScriptFile("CPageUrl");}catch(e){}

var gPageUrl;

//////////////////////////////////////////////////////////////////////////
function CPageUrl( sURL )
{
	this.m_sPage = document.body.default_page;// default
	this.m_sBaseURL = "";
	//this.m_params = new Object();//new ActiveXObject("Scripting.Dictionary");
	this.setURL = CPageUrl_setURL;
	this.setParam = CPageUrl_setParam;
	this.getParam = CPageUrl_getParam;
	this.getIntParam = function(pName, defValue){
		return parseInt( this.getParam(pName, defValue), 10);
	};
	this.getURL   = CPageUrl_getURL;
	this.getQuery = CPageUrl_getQuery;
	this.copy = CPageUrl_copy;
	
	this.setParams = function(objParams)
	{
		for(var param in objParams )
		{
			if(objParams[param] == null )
			{
				this.removeParam(param);
			}
			else
			{
				this.setParam(param, objParams[param]);
			}
		}
	};

	this.removeParam = function(sName){
		//if(this.m_params.Exists(sName)){
		//	this.m_params.Remove(sName);
		//}
		delete this.m_params[sName];
	};

	this.toString = CPageUrl_getURL;

	if (sURL && sURL.length > 0)
	{
		this.setURL( sURL );
	}
	else
	{
		this.setURL( window.location.href );
	}
}

//////////////////////////////////////////////////////////////////////////
function CPageUrl_setURL( sURL )
{
	//this.m_params.RemoveAll();
	this.m_params = {};

	this.m_sBaseURL = sURL.split("?")[0];

	if( this.m_sBaseURL.indexOf("#") ){
		var sPage = this.m_sBaseURL.split("#")[1];
		if(sPage && sPage.length)
			this.m_sPage = sPage;
	}

	if( sURL.indexOf("?") > 0 )
	{
		var sQuery = sURL.split("?")[1].split("#")[0];
		//var sQuery = sURL.split("#")[1];

		var aQueryItems = sQuery.split("&");
		
		for( i=0; i< aQueryItems.length; i++ )
		{
			var aParamPair = aQueryItems[i].split("=");

			if( aParamPair.length > 1)
			{
				this.m_params[aParamPair[0]] = UnescapeEx(aParamPair[1]);
			}
			else
			{
				if(aParamPair[0].length)
					this.m_params[aParamPair[0]] = 1;
			}
		}
	}
}
//////////////////////////////////////////////////////////////////////////
function CPageUrl_setParam (sName, sValue)
{
	var value = sValue ? sValue.toString() : "0";
	this.m_params[sName] = value;
}

//////////////////////////////////////////////////////////////////////////
function CPageUrl_getParam (sName, sDefault)
{
	if( Defined( this.m_params[sName] ) )
	{
		return this.m_params[sName];
	}
	return sDefault;
}
//////////////////////////////////////////////////////////////////////////
function CPageUrl_getQuery()
{
	var sRetVal = "";
	for( var name in this.m_params )
	{
		if (sRetVal.length>0) {
			sRetVal += "&";
		}
		sRetVal += name + "=" + EscapeEx( this.m_params[name] );
	}
	return sRetVal;
}
//////////////////////////////////////////////////////////////////////////
function CPageUrl_getURL()
{
	var sRetVal = this.m_sBaseURL;
	var sQuery  = this.getQuery();
	
	if (sQuery.length)
	{
		sRetVal += "?" + sQuery;
	}
	return sRetVal;
}
//////////////////////////////////////////////////////////////////////////
function CPageUrl_copy()
{
	var newPageUrl = new CPageUrl( this.getURL() );
	return newPageUrl;
}
//////////////////////////////////////////////////////////////////////////
//function CPageUrl_item(sKey, defaultValue)
//{
//	var retVal = this.m_query.item(sKey);
//	if( retVal && retVal.length )
//	{
//		return retVal;
//	}
//	return defaultValue;
//}

