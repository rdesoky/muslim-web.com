Number.prototype.toStringEx = function( minLen ){
	var retValue = this.toString(10);
	if( minLen > retValue.length ){
		retValue = "0".repeat(minLen-retValue.length) + retValue;
	}
	return retValue;
};

String.prototype.repeat = function(n){
	return new Array(n+1).join(this);
};

String.prototype.isNumber = function(){
	return ( this.search(/^\d+$/)!= -1 );
};

function _E(sID){
	return document.getElementById(sID);
}

function MakePlainText(sInput)
{
	var sRetText = sInput
	sRetText = sRetText.replace( /(\s|[\u064B-\u0652]|[\x21-\x2F]|[\x3A-\x40]|[\x5B-\x60]|[\x7B-\xA0])/g, "" );
	sRetText = sRetText.replace( /[\u0622\u0623\u0625]/g, "\u0627");
	sRetText = sRetText.replace( /\u0629/g,			"\u0647");
	sRetText = sRetText.replace( /\u0649/g,			"\u064A");
	sRetText = sRetText.replace( /[\u0624\xu0626]/g,"\u0621");

	return sRetText;
}


function compairText(sFirst, sSecond)
{// returns -1 if strings are matching or offset of the first mismatch

	var sPlainFirst  = MakePlainText(sFirst);
	var sPlainSecond = MakePlainText(sSecond);

	for (nFirst=0,nSecond=0; nFirst<sFirst.length && nSecond<sPlainSecond.length; nFirst++,nSecond++ )
	{
		while (nFirst < sFirst.length)
		{
			var sPlainChar = MakePlainText( sFirst.substr(nFirst, 1) );

			if (sPlainChar.length)
			{
				if (sPlainChar != sPlainSecond.substr(nSecond, 1) )
				{
					return nFirst;
				}
				break;
			}
			nFirst ++;
		}
	}

	if( sPlainFirst.length == sPlainSecond.length )
		return -1;
	else
		return nFirst;
}

function GetXMLHTTPControl()
{
	var httpControl;

	if( window.XMLHttpRequest ) 
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

var DU = {
	show:function(sIDs){
		var aEl = sIDs.split(",");
		for( var id in aEl ){
			_E(aEl[id]).style.display = "";
		}
	},
	hide:function(sIDs){
		var aEl = sIDs.split(",");
		for( var id in aEl ){
			_E(aEl[id]).style.display = "none";
		}
	}
};

function int( sData )
{
	if( Defined(sData) ){
		return parseInt( sData, 10);
	}
	return 0;
}

var	ApplyStyles = function( el, styles ){
	for( var attr in styles ){
		el.style[attr] = styles[attr]
	}
};

var InstallSpin = function( eText, min, max ){
	var lastGoodValue = eText.value;
	eText.setAttribute("min", min);
	eText.setAttribute("max", max);
	var eParent = eText.parentNode;
	var eRoot = eParent.insertBefore( document.createElement("span"), eText );
	eRoot.appendChild(eText);
	var spinImage = eRoot.appendChild( document.createElement("img") );
	var eMap = eRoot.appendChild( document.createElement("map") );
	eMap.setAttribute("name", eText.id + "_map");
	spinImage.setAttribute("usemap", "#" + eText.id + "_map");
	var upArea = eMap.appendChild( document.createElement("area") );
	var downArea = eMap.appendChild( document.createElement("area") );
	upArea.coords  ="0,0,15,8";
	downArea.coords="0,8,15,16";
	
	var startUp = function(){
		moveUp();
		stopInterval( "up" );
		intervals["up"] = setTimeout( function(){ intervals["up"] = setInterval(moveUp,100) }, 300 );;
	};

	var startDown = function(){
		moveDown();
		stopInterval( "down" );
		intervals["down"] = setTimeout( function(){ intervals["down"] = setInterval(moveDown,100) }, 300 );;
	};

	var moveUp = eText.increment = function(){
		var currVal = parseInt( eText.value, 10 );
		if(currVal<parseInt(eText.getAttribute("max"),10)){
			lastGoodValue = eText.value = ( currVal + 1 ).toString();
			return true;
		}
		return false;
	};
	var moveDown = eText.decrement = function(){
		var currVal = parseInt( eText.value, 10 );
		if(currVal>parseInt(eText.getAttribute("min"),10)){
			lastGoodValue = eText.value = ( currVal - 1 ).toString();
			return true;
		}
		return false;
	};
	
	var intervals = {
		up:0,
		down:0
	};
	var stopInterval = function( id ){
		if(intervals[id]){
			clearInterval( intervals[id]);
			intervals[id] = 0;
			spinImage.setAttribute("src", "/images/spin_btns.gif" );
		}
	};
	upArea.onmousedown = function(e){
		startUp();
		spinImage.setAttribute("src", "/images/spin_btns_up.gif" );
	};
	upArea.onmouseup = upArea.onmouseout = function(e){
		stopInterval( "up" );
	};

	downArea.onmousedown = function(e){
		startDown();
		spinImage.setAttribute("src", "/images/spin_btns_down.gif" )
	};
	downArea.onmouseup = downArea.onmouseout = function(e){
		stopInterval( "down" );
	};
	
	ApplyStyles(spinImage, {
		borderWidth: "0px",
		backgroundColor: "#DDDDDD",
		verticalAlign: "top"
	} );

	ApplyStyles(eRoot, {
		display:"inline-block",
		background:"silver",
		padding:"1px",
		height:"16px",
		whiteSpace:"nowrap"
	} );

	ApplyStyles(eText, {
		height:"16px",
		borderWidth:"0px",
		padding:"0px"
	} );

	spinImage.setAttribute("src", "/images/spin_btns.gif" )
	eText.onchange = function(e){
		var max = parseInt(this.getAttribute("max"),10);
		var min = parseInt(this.getAttribute("min"),10);
		if( this.value.isNumber() ){
			if( parseInt(this.value,10) < min){
				this.value = min;
			}
			if( parseInt(this.value,10) > max ){
				this.value = max;
			}
			lastGoodValue = this.value;
		}
		else{
			this.value = lastGoodValue;
		}
	};
};

function ForceArabicKeys( el ){

	el.onkeypress = function(evt)
	{
		if(!Defined(evt)){
			evt = event;
		}

		var charCode = evt.cancelable ? evt.charCode : evt.keyCode;

		if(evt.keyCode==13){
			CheckAnswer();
			evt.returnValue = false;
			return;
		}

		if( Defined(key_map[charCode]) ) {
			if( evt.cancelable && ( evt.initKeyEvent != undefined ) ) 
			{// firefox
				var new_event = document.createEvent("KeyboardEvent");
				new_event.initKeyEvent(
					"keypress",			//  in DOMString typeArg
					true,				//  in boolean canBubbleArg,
					true,				//  in boolean cancelableArg,
					null,				//  in nsIDOMAbstractView viewArg,  Specifies UIEvent.view. This value may be null.
					false,				//  in boolean ctrlKeyArg,
					false,				//  in boolean altKeyArg,
					false,				//  in boolean shiftKeyArg,
					false,				//  in boolean metaKeyArg,
					0,					//  in unsigned long keyCodeArg,
					key_map[charCode]);

				evt.preventDefault();
				this.dispatchEvent(new_event);
			}
			else
			{//IE
				evt.keyCode = key_map[charCode];
			}
		}
		else if( evt.keyCode != 32 )
		{
			//alert(evt.keyCode);
		}
			//this.fireEvent("onkeypress", evt);
			//return false;
	};
}

var key_map={
	39:1591,	// '
	41:40,		// (
	40:41,		// )
	44:1608,	// ,
	46:1586,	// .
	47:1592,	// /
	
	59:1603,	// ;
	63:1567,	// ?
	91:1580,	// [
	93:1583,	// ]
	96:1584,	// `

	123:60,		// {
	125:62,		// }

	65:1588		,//A
	97:1588		,//a
	
	66:1575		,//b
	98:1575		,//b
	
	67:1572		,//c
	99:1572		,//c
	
	68:1610		,//d
	100:1610	,//d
	
	69:1579		,//e
	101:1579	,//e
	
	70:1576		,//f
	102:1576	,//f
	
	71:1604	,//g
	103:1604	,//g
	
	72:1571	,//H
	104:1575	,//h
	
	73:1607	,//i
	105:1607	,//i
	
	74:1578	,//j
	106:1578	,//j
	
	75:1606	,//k
	107:1606	,//k
	
	76:1605	,//l
	108:1605	,//l
	
	77:1577	,//m
	109:1577	,//m
	
	78:1570	,//N
	110:1609	,//n
	
	79:1582	,//o
	111:1582	,//o

	80:1581	,//p
	112:1581	,//p

	81:1590	,//q
	113:1590	,//q

	82:1602	,//r
	114:1602	,//r

	83:1587	,//s
	115:1587	,//s

	84:1601	,//t
	116:1601	,//t

	85:1593	,//u
	117:1593	,//u

	86:1585	,//v
	118:1585	,//v

	87:1589	,//w
	119:1589	,//w

	88:1569	,//x
	120:1569	,//x

	89:1573	,//Y
	121:1594	,//y

	90:1574	,//z
	122:1574	//z

};
