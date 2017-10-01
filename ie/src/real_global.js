/**** Define global variables ****/
var loaded = false;
var refreshRate = 7200000; //// Milliseconds between refreshes.  Default is 2 hours, to override, use ?refreshtimeout=5000
var navCookie = "realNav"; //// Name of cookie used for remembering state.
var navCookieLife = 360; //// Days for the nav cookie to live

/****
    Get the arguments from the query string & 
    put them into an object of name/value pairs.  
    Accessible by obj.name=value 
****/
var obj = getArgs(); 

function init(){
    //// alert ("Running Init");
    if(!document.getElementById) {
        ////alert("Older than 4.0 browser.");
        document.write("Your browser is not supported by this application.");
    } 
    else if (obj.state == true && document.getElementById('nav')){ // if state=1 is in the URL query string, remember what nav layers are open or not.
        if (getCookieValue(navCookie)){ // If there's a navCookie, open it up & get the list of what layers to open
            var cookieVal = getCookieValue(navCookie);
            groupCategories = cookieVal.split('|');
            for (var i=0; i < groupCategories.length; i++) {
                ////alert(groupCategories[i]);
                if (groupCategories[i].length > 1){
                    /**** 
                        for each item in the cookie, open that layer up...
                    ****/
                    toggleLayer(groupCategories[i]); 
                }
            }
        }
        /****
            sets colors/icons/styles for the category which maps to the page you're on
        ****/
        if (topicCenter == "null"){
            topicCenter = "";
        }
        if (currentPage == "null"){
            currentPage = "";
        }
        setMenuItems(topicCenter); 
    }
    else{
        if (document.getElementById('nav')){
            /****
                sets colors/icons/styles for the category which maps to the page you're on
            ****/
            if (topicCenter == "null"){
                topicCenter = "";
            }
            if (currentPage == "null"){
                currentPage = "";
            }
            setMenuItems(topicCenter); 
        }
    }
    
    /****
        If you're in the player, refresh the page every 2 hours (or whatever ?refreshtimeout is)
    ****/
    if(is_in_player){
        if (obj.refreshtimeout) {
            refreshRate = obj.refreshtimeout.length>1?obj.refreshtimeout:refreshRate;
        }
        startRefreshTimer();
    }
}

function openPopup(theURL, theTitle, width, height) {
	var strSettings = 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width='+width+',height='+height;  
	var win = window.open(theURL, theTitle, strSettings);
	win.focus();
} 

function isViper() {
	var pv = plyrObj.PlayerProperty("PRODUCTVERSION");
	var beamerVersion = "6.0.11.000";
	return versionCompare( pv, beamerVersion ) == -1;
}

function isBoxter() {
	var pv = plyrObj.PlayerProperty("PRODUCTVERSION");
	var boxterVersion = "6.0.11.999";
	return versionCompare( pv, boxterVersion ) == 1;
}

/* Compares 2 versions as #.#.#.# strings... */
function versionCompare(a,b) {
	var testver1 = a.split(".");
	var testver2 = b.split(".");

	if( testver1.length != testver2.length ) {
		return 0;
	}
		
	for( var i=0 ; i<testver1.length ; i++ ) {
		var t1 = testver1[i]-0;
		var t2 = testver2[i]-0;

		if( t1 != t2 ) {
			if( t1 < t2 ) {
				return -1;
			}
			if( t1 > t2 ) {
				return 1;
			}
		}
	}
	return 0;
}

function navigateToTab( tab, theURL ) {
	if( is_in_player ) {		
		if (!isBoxter() && (tab == "home" || tab == "musicguide" || tab == "musicstore" || tab == "browser" || tab == "channels")) {
			tab = "web";
		}
		plyrObj.OpenURLInPlayerBrowser(theURL,"_rp" + tab);
	} else {
		document.location.href = theURL; 
	}
}

function getArgs() {
	
    var args = new Object(); 
	var query = location.search.substring(1); //// Get Query String 
	var pairs = query.split("&"); //// Split query at the ampersand
	
	for(var i = 0; i < pairs.length; i++) {	//// Begin loop through the querystring

		var pos = pairs[i].indexOf('='); //// Look for "name=value"
		if (pos == -1) continue; //// if not found, skip to next
		var argname = pairs[i].substring(0,pos); //// Extract the name
		
		var value = pairs[i].substring(pos+1); //// Extract the value
		args[argname] = unescape(value); //// Store as a property
	}
	return args; //// Return the Query string name/value pairs as an Object
}

/****
    Set the refreshRate from the querystring if present 
    and refresh the page that often.  Otherwise, use the 
    default 2 hour timer. 
****/
function startRefreshTimer( ) {
	if( !loaded ){
		setTimeout("startRefreshTimer()",1000);
    } else{
		setTimeout("pageRefresh();",refreshRate);
    }
}

function pageRefresh() {
    if (is_in_player) {
	    var plyrObj = top.parent.window.external;
    } else {	
	    document.write("<object id=\"IERPCtl\" width=0 height=0 classid=\"CLSID:FDC7A535-4070-4B92-A0EA-D9994BCC0DC5\"></object>");
    	var plyrObj = document.getElementById("IERPCtl");
    }
	
    if( refreshURL && plyrObj.IsNetConnected() && plyrObj.PlayerProperty("WORKOFFLINE")!=1 ){
  		document.location.href = refreshURL; 
	} else{
		setTimeout("pageRefresh();",refreshRate);
    }
}

/****
    Next two functions encode string as UTF-8.
****/
function encodeChar( val )
{
    /* Create URL encoded utf-8 values from a scalar int */
    var output = "";
    /* Single Byte Values */
    if( (val & 0x7F) == val )
    {
        return escape( String.fromCharCode(val) );
    }
    /* Two Byte translation */
    if( ( val & 0x07FF ) == val )
    {
        output += "%" + ( ( val>>6 ) | 0xC0 ).toString(16);
        output += "%" + ( ( val & 0x3F ) | 0x80 ).toString(16);
        return output;
    }
    /* Three byte translation */
    if( (val & 0xFFFF) == val )
    {
        output += "%" + (( val >> 12 ) | 0xE0 ).toString(16);
        output += "%" + ((( val >> 6 ) &  0x3F ) | 0x80 ).toString(16);
        output += "%" + (( val & 0x3F ) | 0x80 ).toString(16);
        return output;
    }
    /* Four Byte translation */
    if( (val & 0x1FFFFF) == val )
    {
        output += "%" + (( val >> 18 ) | 0xF0).toString(16);
        output += "%" + ((( val >> 12 ) & 0x3F ) | 0x80 ).toString(16);
        output += "%" + ((( val >> 6) & 0x3F ) | 0x80 ).toString(16);
        output += "%" + (( val & 0x3F ) | 0x80 ).toString(16);
        return output;
    }
}
function urlHexEncode( str )
{
    var ret = "";
    for( var i=0; i<str.length; i++ )
    {
        ret += encodeChar( str.charCodeAt( i ) );
    }
    return ret;
}


function RPOnStateChange(play_state){
    if (document.getElementById("flash")){
        switch(play_state) {
            case 0:
                // stopped state
                flash.Play();
                break
            case 3:
                // playing state
                flash.StopPlay();
                break;
        }
    }
