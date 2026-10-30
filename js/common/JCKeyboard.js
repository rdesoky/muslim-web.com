
var arabic_keys = [
	["ذ","1","2","3","4","5","6","7","8","9","0","-","="],
	["ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د" ],
	["ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط"],
	["ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ"],
	
	["ّ","!","@","#","$","%","^","&","*","(",")","_",'+'],
	["َ","ً","ُ","ٌ","لإ","إ","‘","÷","×","؛","<",">"],
	["ِ","ٍ","[","]","لأ","أ","ـ","،","/",":","\""],
	["~","ْ","{","}","لآ","آ","’",",",".","؟"]
];

//var english_keys = new Array (
//	"`1234567890-=", "qwertyuiop[]", "asdfghjkl;'", "zxcvbnm,./", 
//	"~!@#$%^&*()_+", "QWERTYUIOP{}", "ASDFGHJKL:\"", "ZXCVBNM<>?"
//);

var JCKeyboard = DefineJClass({

	init:function(){
		this.keys = arabic_keys;
	},

	showUI:function(){

		DU.addClass(this,"keyboardHost");
		var kb = JCKeyboard.kb;
		if(!kb){
			kb = JCKeyboard.kb = document.createElement("div");
			kb.className = "keyboard";
			DU.hide(JCKeyboard.kb);
			kb.onmouseover=function(e){
				if( JCKeyboard.pendingHide ){
					stopTimer("pendingHide", JCKeyboard);
				}
			};
			kb.onmouseout=function(e){
				var event = U.ieEvent(e);
				if( !IsChildOf( event.toElement, JCKeyboard.kb ) && !IsChildOf( event.toElement, JCKeyboard.editor ) ) {
					stopTimer( "pendingShow", JCKeyboard );
					if(!JCKeyboard.pendingHide){
						JCKeyboard.pendingHide = window.setTimeout( 
							function(){
								DU.hide(JCKeyboard.kb);
								JCKeyboard.pendingHide=0;
							}, 
							500 
						);
					}
				}
			};
		}
		JCKeyboard.editor = this;
		kb.innerHTML = createKeys( this.keys );
	},

	onmouseover: function(e){
		if( JCKeyboard.kb.parentNode != this.parentNode ){
			this.parentNode.appendChild( JCKeyboard.kb);
		}

		if( JCKeyboard.pendingHide ){
			stopTimer("pendingHide", JCKeyboard);
		}

		if( DU.isHidden(JCKeyboard.kb) && !JCKeyboard.pendingShow ) 
		{
			JCKeyboard.pendingShow = window.setTimeout( 
				function(){
					DU.show(JCKeyboard.kb);
					JCKeyboard.pendingShow = 0;
				} , 
				500 
			); 
		}
	},

	onmouseout: function(e){
		var event = U.ieEvent(e);
		if( !IsChildOf( event.toElement, this ) && !IsChildOf( event.toElement, JCKeyboard.kb ) ) {
			this.hideKeyboard();
		}
	},
	
	hideKeyboard:function(){
		stopTimer( "pendingShow", JCKeyboard );
		if(!JCKeyboard.pendingHide){
			JCKeyboard.pendingHide = window.setTimeout( 
				function(){
					DU.hide(JCKeyboard.kb);
					JCKeyboard.pendingHide=0;
				}, 
				500 
			);
		}
	},

	toggleShift:function(){
		JCKeyboard.shift = (JCKeyboard.shift == true)? false:true;
		var self = this;
		window.setTimeout(
			function(){
				JCKeyboard.kb.innerHTML = createKeys( self.keys );
			},
			10
		);
	},

	addChar:function( nChar )
	{
		if (nChar == 8){// backspace
			this.value = this.value.substring(0,this.value.length-1);
		}
		else if (nChar == 0){// clear
			this.value = "";
		}
		else{
			this.value += String.fromCharCode(nChar);
		}

		window.setTimeout( 
			function(){
				DU.focus(JCKeyboard.editor);
			}, 
			10 
		);
	},

	xaddChar:function( sChar )
	{
		if (sChar == "BS"){
			this.value = this.value.substring(0,this.value.length-1);
		}
		else if (sChar == "&nbsp;"){
			this.value += " ";
		}
		else if (sChar == "CL"){
			this.value = "";
		}
		else{
			this.value += sChar;
		}

		var self=this;
		window.setTimeout( 
			function(){
				DU.focus(JCKeyboard.editor);
			}, 
			10 
		);
	},

	clearChar:function()
	{
		this.value = this.value.substring(0,this.value.length-1);
	}
});

function createKeys( arKeys )
{
	var sHTML = "";

	var shiftButtonClass = "keyButton";

	if( JCKeyboard.shift ){
		shiftButtonClass = "keyPressedButton";
	}

	for (var row= 0; row<4; row++)
	{
		var rowIndex = row;
		
		if(JCKeyboard.shift){
			 rowIndex += 4;
		}

		switch(row)
		{
		case 0:
			break;
		case 1:
			sHTML += "<span class=keyButton style='width:30px' " +  
					 " onmousedown=\"JCKeyboard.editor.addChar(32)\">Tab</span>";
			break;
		case 2:
			sHTML += "<span class=keyButton style='width:37px'>&nbsp;</span>";
			break;
		case 3:
			sHTML += "<span class=" + shiftButtonClass + " style='width:51px'" +  
					 " onclick='JCKeyboard.editor.toggleShift()'>Shift</span>";
			break;
		}


		for( var keyIndex=0; keyIndex < arKeys[rowIndex].length; keyIndex ++ )
		{
			var sChar, sDispChar;

			sChar = arKeys[rowIndex][ keyIndex ];
			var nChar = sChar.charCodeAt(0);

			sHTML += "<span class='keyButton' " + 
					 " onclick='JCKeyboard.editor.addChar(" + nChar.toString() + ")' >" + sChar + "</span>";
		}
		
		switch(row)
		{
		case 0:
			sHTML += "<span class=keyButton style='width:55px'" + 
					 " onclick='JCKeyboard.editor.addChar(8)' >BkSpace</span>";
			break;
		case 1:
			if( JCKeyboard.shift ) {
				sHTML += "<span class=keyButton style='width:45px'" +  
						 " onclick='JCKeyboard.editor.addChar(124)'>|</span>";
			}
			else{
				sHTML += "<span class=keyButton style='width:45px'" +  
						 " onclick='JCKeyboard.editor.addChar(92)'>\\</span>";
			}
			break;
		case 2:
			if( JCKeyboard.editor.getAttribute("sOnEnter") )
			{
				sHTML += "<span class=keyButton style='width:60px'" + 
					 " onclick=\"" + JCKeyboard.editor.getAttribute("sOnEnter") + ";HideElement(JCKeyboard.kb);\">Enter</span>";
			}
			else
			{
				sHTML += "<span class=keyButton style='width:60px'" + 
					 " onclick='JCKeyboard.editor.addChar(32)'>&nbsp;</span>";
			}
			break;
		case 3:
			sHTML += "<span class=" + shiftButtonClass + " style='width:68px'" +  
					 " onclick='JCKeyboard.editor.toggleShift()'>Shift</span>";
			break;
		}

		sHTML +=  "<br/>";
	}


	for(i=0;i<3;i++)
	{
		sHTML += "<span class=keyButton style='width:20px'>&nbsp;</span>";
	}

	sHTML += "<span class=keyButton style='width:187px' onclick=\"JCKeyboard.editor.addChar(32)\">Space</span>";
	
	for(i=0;i<4;i++)
	{
		sHTML += "<span class=keyButton style='width:20px'>&nbsp</span>";
	}
	
	return sHTML;
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

function ForceArabicKeys( el ){

	el.onkeypress = function(evt)
	{
		if(!Defined(evt)){
			evt = event;
		}

		var charCode = evt.cancelable ? evt.charCode : evt.keyCode;

		if(evt.keyCode==13){
			MemExercise.check();
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
