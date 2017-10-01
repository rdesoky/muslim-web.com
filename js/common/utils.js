var DDrop = {
	attach:function(el, target){
		var bDrag = false;
		var initMouse = {
			x:0, y:0
		};
		var initPos = {
			x:0, y:0
		};
		U.disableSelection(el);
		function mouseMove(e){
			var event = U.ieEvent(e);
			if(bDrag){
				target.style.left = ( initPos.x + (event.screenX - initMouse.x ) ).toString() + "px";
				target.style.top = ( initPos.y + (event.screenY - initMouse.y ) ).toString() + "px";
			}
		};
		function mouseUp(e){
			bDrag = false;
			if( document.removeEventListener ){
				document.removeEventListener("mousemove", mouseMove);
				document.removeEventListener("mouseup", mouseUp);
			}else{
				document.releaseCapture();
			}
		};
		el.onmousedown = function(e){
			bDrag = true;
			var event = U.ieEvent(e);
			initMouse.x = event.screenX;
			initMouse.y = event.screenY;
			initPos.x = target.offsetLeft;
			initPos.y = target.offsetTop;

			if( document.addEventListener ){
				document.addEventListener( "mousemove", mouseMove, true );
				document.addEventListener( "mouseup", mouseUp, true );
			}else{
				el.setCapture();
				el.onmousemove = mouseMove;
				el.onmouseup = mouseUp;
			}
		};
	}
};
var UI = {
	popupsCount:0,
	getScreenBlocker:function(){
		if(!this.blocker){
			this.blocker = DU.appendChild( document.body, "div", {id:"ScreenBlocker"} );
		}
		return this.blocker;
	},
	
	hideBlocker:function(){
		if( this.popupsCount <= 0 ){
			this.popupsCount = 0;
			DU.hide( "ScreenBlocker" );
		}
	},

	openPopup:function(sID, contents, sTitle){
		var popup = _E(sID);
		if( ! popup ){
			popup = DU.appendChild( document.body, "div", {id:sID, "class":"popup"} );
			DU.appendChild( popup, "div", {"class":"trans gray_bg wallpaper"} );
			var root = DU.appendChild( popup, "div", {"class":"white_bg box raised"} );
			var title = DU.appendChild( root, "div", {"class":"popup_title"} );
			DDrop.attach( title, popup );
			var closeBtn = DU.appendChild( title, "span", {"class":"button closeBtn"} );
			closeBtn.innerHTML = "X";
			closeBtn.onclick = function(){
				UI.closePopup(sID);
			};
			if( sTitle!=undefined ){
				DU.appendChild( title, "span", {"class": "popup_title_text"}, sTitle );
			}
			var popupClient = DU.appendChild( root, "div", {"class":"popupClient"} );
			popup.client = popupClient;
			this.popupsCount ++;
		}

		this.getScreenBlocker();
		DU.show( "ScreenBlocker" );
		popup.style.left = ( ( document.body.offsetWidth - popup.offsetWidth ) / 2 ).toString() + "px";
		popup.style.top = ( document.body.offsetHeight / 10 ).toString() + "px";

		if(contents){
			DU.removeChildren(popup.client);
			popup.client.appendChild(contents);
		}
		return popup.client;
	},
	
	closePopup:function(id){
		var popup = _E(id);
		if( popup ){
			popup.client = null;
			document.body.removeChild( popup );
			this.popupsCount --;
			this.hideBlocker();
		}
	}
};
var DU = {
	focus:function( el ){
		try{
			if( el ){
				if( el.constructor == String ){
					_E(el).focus();
				}else{
					el.focus();
				}
			}
		}
		catch(e){
		}
	},
	removeChildren:function( el ){
		while( el.firstChild ){
			el.removeChild( el.firstChild );
		}
	},

	hide:function( el ){
		if( el && el.constructor == String ){
			var aEl = el.split(",");
			for( var i =0 ; i< aEl.length; i++ ){
				this.hide(_E(aEl[i]));
			}
		}else if(el){
			el.style.display="none";
		}
	},
	show:function(el){
		if( el && el.constructor == String ){
			var aEl = el.split(",");
			for( var i =0 ; i< aEl.length; i++ ){
				this.show(_E(aEl[i]));
			}
		}else if(el){
			el.style.display="";
		}
	},
	
	mkVisible:function(sID){
		aEl = sID.split(",");
		for(var i=0;i<aEl.length;i++){
			if(_E(aEl[i])){
				_E(aEl[i]).style.display="";
			}
		}
	},

	mkUnvisible:function(sID){
		aEl = sID.split(",");
		for(var i=0;i<aEl.length;i++){
			if(_E(aEl[i])){
				_E(aEl[i]).style.display="none";
			}
		}
	},

	isHidden:function( sID ){
		return !this.isShown( sID );
	},
	isShown:function( sID ){
		var el = sID;
		if(sID.constructor==String){
			el = document.getElementById(sID);
		}
		if(el){
			return (el.style.display!="none");
		}
		return undef;
	},
	hasClass:function(el, cName){
		el = _E(el);
		if( el.className.match( RegExp("\\b" + cName + "\\b") ) ){
			return true;
		}
		return false;
	},
	addClass:function(el, cName){
		el = _E(el);

		if(!el){
			return false;
		}
		if( !this.hasClass(el, cName) ){
			el.className += (el.className.length?" ":"") + cName;
		}
		return true;
	},

	removeClass:function(el, cName){
		el = _E(el);
		
		if(!el){
			return false;
		}
		if( this.hasClass(el,cName) ){
			el.className = el.className.replace( RegExp("\\b" + cName + "\\b"), "" ).optimizeSpaces();
			return true;
		}
		return false;
	},
	toggleClass:function(el,cls){
		el = _E(el);
		if( this.hasClass(el,cls) ){
			this.removeClass(el,cls);
		}else{
			this.addClass(el,cls);
		}
	},
	createElement:function( sTag, attrs ){
		var el = document.createElement( sTag );
		for( var attr in attrs ){
			//child[attr] = attrs[attr];
			el.setAttribute(attr, attrs[attr]);
		}
		return el;
	},

	appendChild: function( el, sTag, attrs, sHTML ){
		var child = this.createElement(sTag, attrs);
		el.appendChild( child );
		if( sHTML ){
			child.innerHTML = sHTML;
		}
		return child;
	},

	copyAttr: function( el, attrDefaults )
	{
		for( var aName in attrDefaults )
		{
			var aValue= el.getAttribute( aName );
			if( aValue != undefined ){
				el[aName] = aValue;
			}else{
				el[aName] = attrDefaults[aName]
			}
		}
	},
	
	elementsByCID:function( el ){
		return this.elementsByAttr( el, "cid" );
	},

	elementsByAttr:function( el, attrName ){
		
		var retObj = { _elist:[] };
		
		var elArray = getElementsByAttribute( el, attrName );

		for( var i=0, len=elArray.length; i<len; i++ )
		{
			var foundEl = elArray[i];
			var cidValue = foundEl.getAttribute( attrName );
			retObj[ cidValue ] = foundEl;
			retObj._elist.push(cidValue);
		}

		return retObj;
	},

	applyStyles:function( el, styles ){
		for( var attr in styles ){
			el.style[attr] = styles[attr]
		}
	}
};

var U = Utils = 
{
	d: DU,

	extend:function(obj, classDef){
		for( var item in classDef )
		{
			obj[item] = classDef[item];
		}
	},
	
	parseParams:function(){
		var retVal = {};
		var myurl = window.location.href.split('?');
		
		if( myurl.length > 1 )
		{
			var params= myurl[1].split('&');

			for( var i=0; i < params.length; i++ )
			{
				var paramInfo = params[i].split("=");
				retVal[ paramInfo[0] ] = (paramInfo.length>1) ? paramInfo[1] : true;
			}
		}
		return retVal;
	},
	

	param:function( name, default_value )
	{
		if( ! this.currParams ){
			this.currParams = this.parseParams();
		}
		return undefined === this.currParams[name] ? default_value : this.currParams[name];
	},

	cookie:function( name, default_value )
	{
		var mycookies = document.cookie.split(";");
		
		for( var i=0; i < mycookies.length; i++ )
		{
			var cookieInfo = mycookies[i].split("=");
			
			if(cookieInfo[0]==name)
			{
				if(cookieInfo.length>1)
				{
					return cookieInfo[1];
				}
				else
				{
					return true;
				}
			}
		}

		return default_value;
	},
	
	ieEvent: function(e){
		// minimal normalization
		if( e ) {
			return {
				ctrlKey: e.ctrlKey,
				altKey: e.altKey,
				shiftKey: e.shiftKey,
				wheelDelta: e.detail ? e.detail * (-100) : e.wheelDelta,
				screenX: e.screenX,
				screenY: e.screenY,
				// relative to browser client area
				clientX: e.clientX,
				clientY: e.clientY,
				// relative to element firing the event
				offsetX: e.offsetX || (e.layerX - e.currentTarget.offsetLeft),
				offsetY: e.offsetY || (e.layerY - e.currentTarget.offsetTop),
				// offset to closest parent with "relative" position
				x:e.x,
				y:e.y,
				// offset to document top left corner
				pageX:e.pageX,
				pageY:e.pageY,
				preventDefault: function(){	e.preventDefault(); },
				stopPropagation: function(){ e.stopPropagation(); },
				target: e.target,
				srcElement: e.srcElement || e.originalTarget || e.currentTarget,
				toElement: e.relatedTarget,//e.target
				charCode: e.charCode,
				keyCode: e.keyCode,
				isChar: e.isChar
			}
		}

		if( window.event )
		{
			var event = window.event;
			return {
				ctrlKey: event.ctrlKey,
				altKey: event.altKey,
				shiftKey: event.shiftKey,
				wheelDelta: event.wheelDelta,
				screenX: event.screenX,
				screenY: event.screenY,
				clientX: event.clientX,
				clientY: event.clientY,
				offsetX: event.offsetX,
				offsetY: event.offsetY,
				x:event.x,
				y:event.y,
				pageX:event.offsetX,//+scrollX
				pageY:event.offsetY,//+scrollY
				stopPropagation: function(){
					event.cancelBubble = true;
				},
				srcElement: event.srcElement,
				preventDefault: function(){
					event.returnValue=false;
				},
				toElement: event.toElement,
				target: event.toElement,
				currentTarget: event.srcElement,
				charCode: event.keyCode,
				keyCode: event.keyCode,
				isChar: event.type == "keypress" ? true : false
			};
		}
		return {
		};
	},

	findPos:function(obj) {
		var x = y = 0;
		
		while(obj.offsetParent){
			x += obj.offsetLeft;
			y += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return {'x':x, 'y':y};
	},

	viewMouseValues:function(e){
		return;
		var de = _E("MouseValues");
		if( !de ){
			de = document.createElement("div");
			de.setAttribute("id", "MouseValues");
			document.body.appendChild(de);
		}
		de.innerHTML = 
			"x:" + e.x + "<br/>" +
			"y:" + e.y + "<hr/>" +
			"pageX:" + e.pageX + "<br/>" +
			"pageY:" + e.pageY + "<hr/>" +
			"offsetX:" + e.offsetX + "<br/>" +
			"offsetY:" + e.offsetY + "<hr/>" +
			"clientX:" + e.clientX + "<br/>" +
			"clientY:" + e.clientY + "<hr/>" +
			"screenX:" + e.screenX + "<br/>" +
			"screenY:" + e.screenY + "<hr/>" +
			"offsetTop:" + e.srcElement.offsetTop + "<br/>" +
			"offsetLeft:" + e.srcElement.offsetLeft + 
			"<hr/>" +
			"body.scrollTop:" + document.body.scrollTop;
		
	},

	DOM: function getElementById( sID )
	{
		return document.getElementById( sID );
	},

	DOMethod: function( sID, sMethod, args ){
		var dom = document.getElementById( sID );
		if( dom && dom[sMethod] ){
			if( args == undefined ){
				args = [];
			}
			return dom[sMethod].apply(dom, args);
		}
		return undefined;
	},


	DOMAttr: function( el, attr, defValue ){
		var ret=el.getAttribute( attr );
		return ret==undefined ? defValue : ret;
	},


	copyObject: function CopyObject( targetObj, srcObj, bNoOverwrite )
	{
		if( srcObj == undefined ){
			srcObj = targetObj;
			targetObj = {};
		}

		for( var item in srcObj )
		{
			if( ! bNoOverwrite || targetObj[item] == undefined )
			{
				targetObj[item] = srcObj[item];
			}
		}
		
		return targetObj;
	},

	loadCSS: function LoadCSS( url )
	{
		if( typeof(url) == "object" && url.constructor == Array )
		{
			for( var i=0, len=url.length ; i < len ; i ++ )
			{
				this.loadCSS( url[i] );
			}
			return;
		}

		var headID = document.getElementsByTagName("head")[0];
		var cssNode = document.createElement('link');

		this.copyObject( cssNode, {
							type:"text/css", 
							rel: "stylesheet", 
							href: url, media: "screen" } 
		);

		headID.appendChild(cssNode);
	},

	getDomParser: function()
	{
		if(window.DOMParser)
		{
			return new DOMParser();
		}
		else if(window.ActiveXObject) 
		{// branch for IE/Windows ActiveX version
			var xmlHttp;
			try {
				xmlHttp = new ActiveXObject("Msxml2.DOMDocument");
			}catch(e){
				return null;
			}

			return {
				xmlHttp:xmlHttp,
				parseFromString:function(theString){
					this.xmlHttp.loadXML(theString);
					return this.xmlHttp;
				}
			};
		}
		return undef;
	},

	httpGet: function( sURL, onLoad, callerInfo, onError ){
		var httpCtrl = this.getAJAX();

		httpCtrl.onreadystatechange= function(){ 
			if(	this.readyState == 4 ){
				if( this.status == 200 ){
					onLoad( this.responseText, callerInfo );
				}else{
					if(onError != undefined){
						onError( this );
					}
				}
			}
		};

		httpCtrl.open( "GET", sURL, true );
		httpCtrl.send("");
		return httpCtrl;
	},
	
	getAJAX: function GetAJAX()
	{
		var httpControl;

		if(window.XMLHttpRequest)
		{
			try{
				httpControl = new window.XMLHttpRequest();
			}
			catch(e){
			}
		}
		else if(window.ActiveXObject) 
		{// branch for IE/Windows ActiveX version
			try {
				httpControl = new window.ActiveXObject("Msxml2.XMLHTTP");
			}
			catch(e) 
			{
				try{
					httpControl = new ActiveXObject("Microsoft.XMLHTTP");
				}
				catch(e){
				}
			}
		}
		return httpControl;
	},

	setupCrossBrowser: function()
	{
		if( typeof HTMLElement!="undefined" && !HTMLElement.prototype.insertAdjacentElement )
		{
			HTMLElement.prototype.getElementsByCID = function(){
				var retObj = {};
				
				var elArray = getElementsByAttribute( this, "cid" );

				for( var i=0, len=elArray.length; i<len; i++ )
				{
					var foundEl = elArray[i];
					retObj[ foundEl.getAttribute("cid") ] = foundEl;
				}

				return retObj;
			};

			HTMLElement.prototype.insertAdjacentElement = function (where,parsedNode)
			{
				switch (where)
				{
				case 'beforeBegin':
					this.parentNode.insertBefore(parsedNode,this);
					break;
				case 'afterBegin':
					this.insertBefore(parsedNode,this.firstChild);
					break;
				case 'beforeEnd':
					this.appendChild(parsedNode);
					break;
				case 'afterEnd':
					if (this.nextSibling) 
						this.parentNode.insertBefore(parsedNode,this.nextSibling);
					else 
						this.parentNode.appendChild(parsedNode);
					break;
				}
			};

			HTMLElement.prototype.insertAdjacentHTML = function(where,htmlStr)
			{
				var r = this.ownerDocument.createRange();
				r.setStartBefore(this);
				var parsedHTML = r.createContextualFragment(htmlStr);
				this.insertAdjacentElement(where,parsedHTML);
			};


			HTMLElement.prototype.insertAdjacentText = function(where,txtStr)
			{
				var parsedText = document.createTextNode(txtStr);
				this.insertAdjacentElement(where,parsedText);
			};

			HTMLElement.prototype.applyElement = function(parentEl){
				parentEl.appendChild(this);
			};

		}
	},
	
	sCall:function uCall( context, sMethod, params ){
		if( context && context[sMethod] ){
			if(context[sMethod].apply) {
				return context[sMethod].apply(context, params);
			}else{
				return context[sMethod]();
			}
		}
		return undef;
	},

	pushToCookieArray:function( cookieName, val, maxLength )
	{
		var	valArray = readCookie(cookieName, "").split(",");

		for( var i=0; i<valArray.length; i++ )
		{// remove it from the list 
			if( valArray[i] == val )
			{
				valArray = DeleteArrayElements( valArray, i, 1 );
				i--;
			}
		}

		if(maxLength)
			valArray.length = maxLength;

		writeCookie(cookieName, val + "," + valArray.join(","));

	},
	
	disableSelection:function(target)
	{
		if( typeof target.onselectstart!="undefined" ){ //IE route
			target.onselectstart=function(){
				return false;
			};
		}
		else if (typeof target.style.MozUserSelect!="undefined"){ //Firefox route
			target.style.MozUserSelect="none";
		}
		else{ //All other route (ie: Opera)
			target.onmousedown=function(){
				return false;
			}
		}
		//target.style.cursor = "default"
	}
};

var _E = function(sID){
	if( sID && sID.constructor == String ){
		return document.getElementById(sID);
	}
	return sID;
}

var _C = function(css, el){
	el = el || document;
	return el.querySelector(css);
};

var _EA = function(el, sAttr, defaultVal){
	el = _E(el);
	if(!el){
		return defaultVal;
	}
	var ret = el.getAttribute(sAttr);
	return (ret==undefined) ? defaultVal : ret;
}

var _SA = function(el, sAttr, attrVal){
	el = _E(el);
	
	if(el){
		if( attrVal != undefined ){
			el.setAttribute(sAttr, attrVal);
		}else{
			el.removeAttribute(sAttr);
		}
	}
	return el;
}
var _TA = function(el,attr){
	if( _EA(el,attr) ) {
		_SA(el,attr);
	}else{
		_SA(el,attr,1);
	}
}

var Defined = function( ref ){
	return ( typeof( ref ) != "undefined" );
}, _D=Defined;

Array.prototype.find = function( searchFor )
{
	for( var i=0; i<this.length; i++ ){
		if( this[i] == searchFor ){
			return true;
		}
	}
	return false;
};

String.prototype.isNumber = function(){
	return ( this.search(/^\d+$/)!= -1 );
};

String.prototype.trim = function()
{
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

String.prototype.optimizeSpaces = function()
{
	return this.trim().replace(/\s+/g," ");
};

String.prototype.repeat = function(n){
	return new Array(n+1).join(this);
};

String.prototype.toArray = function(n){
	return this.split("");
};

var DefineVars = function( defs, parent ){
	
	parent = parent || this;

	for( var vName in defs ){
		parent[vName] = defs[vName];
	}
}

var Zipper = {
	
	zip: function( data ){
		var retVal, adata, reader;

		var closeReader = function(){
			if( !reader.count ){
				return;
			}

			var val = ( reader.val == ")" || reader.val == "(" ) ? "\\" + reader.val : reader.val;

			if( reader.count > 4 ){
				retVal += "(" + val + reader.count.toString()+ ")";
			}
			else{
				retVal += val.repeat( reader.count );
			}
		}

		adata = data.toArray();
		
		for( var i=0, retVal="", reader={count:0}, len=adata.length; i<len; i++ )
		{
			var currValue = adata[i];
			if( reader.val == currValue ){
				reader.count ++;
			}
			else{
				closeReader();
				reader = {val:currValue, count:1};
			}
		}

		closeReader();

		return retVal;
	},

	unzip:function(zdata){
		var retVal = "", reader={count:0};

		adata = zdata.toArray();
		
		for( var i=0, len=adata.length; i<len; i++ )
		{
			if( adata[i] == "\\" ){
				retVal += adata[++i];
			}
			else if( adata[i] == "(" ){
				var sCount = "";
				i++;
				var charVal = adata[i];
				if( charVal == "\\" ){
					charVal = adata[++i];
				}
				i++;
				while( adata[i] != ")" ){
					sCount += adata[i++];
				}
				retVal += charVal.repeat( parseInt(sCount,10) );

			}else{
				retVal += adata[i];
			}
		}

		return retVal;
	}
};

Number.prototype.toStringEx = function( minLen ){
	var retValue = this.toString(10);
	if( minLen > retValue.length ){
		retValue = "0".repeat(minLen-retValue.length) + retValue;
	}
	return retValue;
}

function stopTimer( sID , context ){
	if( context == undefined ){
		context = window;
	}
	if( context[sID] ){
		window.clearTimeout(context[sID]);
		//delete context[sID];
		context[sID] = null;
		return true;
	}
	return false;
}

function stopHttpRequest( sID , context ){
	if( context == undefined ){
		context = window;
	}
	if( context[sID] ){
		context[sID].abort;
		context[sID] = null;
		return true;
	}
	return false;
}

function ToInt( sNum ){
	if( sNum != undefined ){
		return parseInt(sNum, 10);
	}
	return 0;
}
function ParseIntArray( myArr ){
	for( var i=0, len=myArr.length; i<len; i++ ){
		myArr[i] = parseInt( myArr[i], 10 );
	}
	return myArr;
}

function CreateVolumeBar( sID, listenerContext ){
	var eRoot = _E(sID);
	DU.applyStyles(eRoot,{
		//display:"inline-block",
		direction:"ltr",
		//height:"12px",
		//verticalAlign:"middle",
		//backgroundColor:"#FFFFFF",
		//padding:"2px"
	});
		
	var eSpeeker = eRoot.appendChild( document.createElement("span") );
	DU.applyStyles(eSpeeker,{
		display:"inline-block",
		width:"14px",
		height:"12px",
		verticalAlign:"middle",
		backgroundImage:"url(images/common/volume_speaker.gif)",
		backgroundRepeat:"no-repeat"
	});
	var eBg = eRoot.appendChild( document.createElement("span") );
	DU.applyStyles(eBg,{
		position:"relative",
		display:"inline-block",
		width:"24px",
		height:"12px",
		verticalAlign:"middle",
		backgroundImage:"url(images/common/volume_bg.gif)",
		backgroundRepeat:"no-repeat"
	});

	var eScale = eBg.appendChild( document.createElement("span") );
	DU.applyStyles(eScale,{
		display:"inline-block",
		width:"24px",
		height:"12px",
		//verticalAlign:"middle",
		backgroundImage:"url(images/common/volume_scale.gif)",
		backgroundRepeat:"no-repeat"
	});

	eRoot.setVolume=function(value){
		if(value==undefined){
			value=parseFloat(this.getAttribute("vol"));
		}else{
			this.setAttribute("vol", value);
		}
		eBg.style.backgroundPosition = "-" + (24-value*24/100).toString() + "px 0px";
		if(value>50){
			eSpeeker.style.backgroundPosition = "0px 0px";
		}else if(value>0){
			eSpeeker.style.backgroundPosition = "-14px 0px";
		}else{
			eSpeeker.style.backgroundPosition = "-28px 0px";
		}
	};

	eRoot.setMute=function(bMute){
		if(bMute){
			eSpeeker.style.backgroundPosition = "-28px 0px";
			eBg.style.backgroundPosition = "-24px 0px";
		}else{
			this.setVolume();
		}
		this.setAttribute("muted",bMute?"1":"0");
	}

	eSpeeker.onclick = function(e){
		var bMute = (eRoot.getAttribute("muted")=="1") ? false:true;
		eRoot.setMute( bMute );
		if( listenerContext && listenerContext.onClickMute ){
			listenerContext.onClickMute(bMute);
		}
		else if( window[sID + "_onClickMute"] ){
			window[sID + "_onClickMute"](bMute);
		}
	};

	eScale.onclick = function(e){
		var event = U.ieEvent(e);
		var newVolume = event.offsetX*100/24;
		eRoot.setVolume(newVolume);
		var context = listenerContext || window;
		if( listenerContext && listenerContext.onChangeVolume ){
			listenerContext.onChangeVolume(newVolume);
		}
		else if( window[sID + "_onChangeVolume"] ){
			window[sID + "_onChangeVolume"](newVolume);
		}
	};
}

function SetHTML( sID, sHTML )
{
	var el = document.getElementById(sID);
	if(el){
		el.innerHTML = sHTML
	};
}

function int( sData )
{
	if( Defined(sData) ){
		return parseInt( sData, 10);
	}
	return 0;
}

var re, jsr;

function LoadJSON( sURL, callback, dataKey )
{
	var myScript  = document.createElement("script"); 
	myScript.type = "text/javascript"; 
	myScript.src  = sURL;
	var head = document.getElementsByTagName("head")[0] || document.documentElement;;
	var done = false;

	myScript.onload = myScript.onreadystatechange = function() {
		if(!done
			&& (  !this.readyState
				|| this.readyState === "loaded" 
				|| this.readyState === "complete"
			) 
		){
			done = true;

			if( callback ){
				var data = dataKey ? window[dataKey] : re;
				callback(data);
			}

			// Handle memory leak in IE
			myScript.onload = myScript.onreadystatechange = null;
			if( head && myScript.parentNode ) {
				head.removeChild( myScript );
			}
		}
	};
	head.insertBefore( myScript, head.firstChild );
}

function StopInterval( sHandle, context )
{
	if(!Defined( context ) ){
		context = window;
	}
	if( Defined(context[sHandle]) && context[sHandle] != 0 ){
		window.clearInterval( context[sHandle] );
		context[sHandle] = 0;
	}
}
//TODO: remove
function GetXMLHTTPControl()
{
	return U.getAJAX();
}
