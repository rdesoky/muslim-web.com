//try{ onLoadScriptFile(); } catch(e){};


var gKeyboardColl = [];//new ActiveXObject("Scripting.Dictionary");

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

//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
function createKeys( arKeys, sKeyboardID )
{
	var sHTML = "";
	var sHooverEffect= " onmouseover=\"this.style.background='#FFFFAA'\" onmouseout=\"this.style.background=''\" ";
	var shiftButtonClass = "keyButton";

	if (gKeyboardColl[sKeyboardID].shift)
	{
		shiftButtonClass = "keyPressedButton";
	}

	for (var row= 0; row<4; row++)
	{
		var rowIndex = row;
		
		if (gKeyboardColl[sKeyboardID].shift)
		{
			 rowIndex += 4;
		}

		switch(row)
		{
		case 0:
			break;
		case 1:
			sHTML += "<span class=keyButton style='width:30px'" +  sHooverEffect +
					 " onmousedown=\"gKeyboardColl['" + sKeyboardID + "'].addChar(' ')\">Tab</span>";
			break;
		case 2:
			sHTML += "<span class=keyButton style='width:35px'>&nbsp;</span>";
			break;
		case 3:
			sHTML += "<span class=" + shiftButtonClass + " style='width:47px'" +  sHooverEffect +
					 " onclick=\"gKeyboardColl['" + sKeyboardID + "'].toggleShift()\">Shift</span>";
			
			break;
		}


		for( var keyIndex=0; keyIndex < arKeys[rowIndex].length; keyIndex ++ )
		{
			var sChar, sDispChar;

			sChar = arKeys[rowIndex][ keyIndex ];
			sDispChar = sChar;

			if(sChar == '"')
			{
				sChar = "\\x22";
			}

			sHTML += "<span class=keyButton " + sHooverEffect +
					 " ondblclick=\"gKeyboardColl['" + sKeyboardID + "'].addChar('" + sChar + "')\" onmousedown=\"gKeyboardColl['" + sKeyboardID + "'].addChar('" + sChar + "')\">" + sDispChar + "</span>";
		}
		
		switch(row)
		{
		case 0:
			sHTML += "<span class=keyButton style='width:55px'" +  sHooverEffect +
					 " onmousedown=\"gKeyboardColl['" + sKeyboardID + "'].addChar('BS')\" ondblclick=\"gKeyboardColl['" + sKeyboardID + "'].addChar('BS')\">BkSpace</span>";
			break;
		case 1:
			if( gKeyboardColl[sKeyboardID].shift ) {
				sHTML += "<span class=keyButton style='width:45px'" +  sHooverEffect +
						 " onmousedown=\"gKeyboardColl['" + sKeyboardID + "'].addChar('|')\">|</span>";
			}
			else{
				sHTML += "<span class=keyButton style='width:45px'" +  sHooverEffect +
						 " onmousedown=\"gKeyboardColl['" + sKeyboardID + "'].addChar('\\\\')\">\\</span>";
			}
			break;
		case 2:
			if (gKeyboardColl[sKeyboardID].sOnEnter.length)
			{
				sHTML += "<span class=keyButton style='width:60px'" + sHooverEffect + 
					 " onclick=\"" + gKeyboardColl[sKeyboardID].sOnEnter + ";HideElement('" + sKeyboardID + "_keyboard',0);\">Enter</span>";
			}
			else
			{
				sHTML += "<span class=keyButton style='width:60px'" + 
					 " onmousedown=\"gKeyboardColl['" + sKeyboardID + "'].addChar(' ')\">&nbsp;</span>";
			}
			break;
		case 3:
			sHTML += "<span class=" + shiftButtonClass + " style='width:68px'" +  sHooverEffect +
					 " onclick=\"gKeyboardColl['" + sKeyboardID + "'].toggleShift()\">Shift</span>";
			break;
		}


		sHTML +=  "<br>";
	}


	for(i=0;i<3;i++)
	{
		sHTML += "<span class=keyButton style='width:25px'>&nbsp</span>";
	}

	sHTML += "<span class=keyButton style='width:140px' " +  sHooverEffect + " onmousedown=\"gKeyboardColl['" + sKeyboardID + "'].addChar(' ')\">Space</span>";
	
	for(i=0;i<4;i++)
	{
		sHTML += "<span class=keyButton style='width:25px'>&nbsp</span>";
	}
	
	return sHTML;
}
//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
//function xcreateKeys( arKeys, sKeyboardID )
//{
//	var sHTML = "";
//	for (var i=0; i<arKeys.length; i++)
//	{
//		var sChar;
//		if(i%5 == 0 && i>0)
//			sHTML +=  "<br>";
//		sChar = arKeys[i];
//		if (sChar == " ")
//		{
//			sChar = "&nbsp;";
//		}
//		sHTML += "<span style='font-family:tahoma;font-size:11px;text-align:center;border-top:solid 1px white;border-left:solid 1px white;border-bottom:solid 1px gray;border-right:solid 1px gray;width:20px;cursor:hand;background:#efefde;' " + 
//				 " onmousedown=\"gKeyboardColl('" + sKeyboardID + "').addChar('" + arKeys[i] + "')\">" + sChar + "</span>";
//	}
//	return sHTML;
//} 
//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
function CKeyboard(sTextBoxID, arKeys, sOnEnter)
{
	var oTextBox = document.getElementById( sTextBoxID );

	if( null == oTextBox || oTextBox.bKeyboard ){
		//text editor not found or keyboard already created
		return null;
	}

	oTextBox.bKeyboard = true;
	
	this.text_box = oTextBox;
	this.text_box_id = sTextBoxID;
	this.shift = false;
	this.addChar   = CKeyboard_addChar;
	this.clearChar = CKeyboard_clearChar;
	this.toggleShift = CKeyboard_toggleShift;
	this.keys = arKeys;
	this.sOnEnter = "";

	if (sOnEnter){
		this.sOnEnter = sOnEnter;
	}
	
	gKeyboardColl[sTextBoxID] = this; // create a reference to the object

	var mySpan = document.createElement("div");

	mySpan.sTextBoxID  = sTextBoxID;
	mySpan.onmousemove = showKeyboard;
	mySpan.onmouseout  = hideKeyboard;
	mySpan.style.border = "solid 1px yellow";
	//mySpan.style.position = "absolute";
	
	// apply the frame on the target element
	oTextBox.applyElement(mySpan) ;
	//mySpan.appendChild( oTextBox );
	
	mySpan.insertAdjacentHTML(
					"beforeEnd", 
					"<br><img src=images/keyboard.gif >" + 
					"<div dir=LTR onselectstart=\"Utils.ieEvent(arguments[0]).preventDefault()\" NOWRAP " + 
					" id=" + sTextBoxID + "_keyboard " + 
					" style='filter:progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=85);padding:4px;z-index:200;position:absolute;display:none;border:1px solid yellow;background:#D7D7D7;color:blue;font-weight:bold;font-size:8px;' >" + 
						createKeys( arKeys, sTextBoxID ) + 
					"</div>" 
					);
	
	return this;
}
//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
function showKeyboard(e)
{
	var sTextBoxID;
	var event = Utils.ieEvent(arguments[0]);
	var oElement = event.srcElement ;
	
	while( oElement && !sTextBoxID )
	{ 
		sTextBoxID = oElement.sTextBoxID;
		oElement = oElement.parentElement;
	}
	if( sTextBoxID )
		ShowElement(sTextBoxID + "_keyboard", 300);
}
//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
function hideKeyboard()
{
	var sTextBoxID;
	var event = Utils.ieEvent(arguments[0]);
	var oElement = event.srcElement ;
	
	while( oElement &&	!sTextBoxID )
	{ 
		sTextBoxID = oElement.sTextBoxID;
		oElement = oElement.parentElement;
	}
	if( sTextBoxID )
		HideElement(sTextBoxID + "_keyboard", 300);
}
//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
function CKeyboard_toggleShift()
{
	this.shift = (this.shift == true)? false:true;
	document.getElementById(this.text_box.id + "_keyboard").innerHTML = createKeys(this.keys, this.text_box.id);
}
//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
function CKeyboard_clearChar()
{
	this.text_box.value = this.text_box.value.substring(0,this.text_box.value.length-1);
}
//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
function CKeyboard_addChar( sChar )
{
	//alert(this.text_box.id);
	if (sChar == "BS")
	{
		this.text_box.value = this.text_box.value.substring(0,this.text_box.value.length-1);
	}
	else if (sChar == "&nbsp;")
	{
		this.text_box.value += " ";
	}
	else if (sChar == "CL")
	{
		this.text_box.value = "";
	}
	else
		this.text_box.value += sChar;

	
	//var sFocusScript = "if( document.getElementById(\"" + this.text_box.uniqueID + "\") ) {" + this.text_box.uniqueID + ".focus(); }";
	sFocusScript = "gKeyboardColl['" + this.text_box_id + "'].text_box.focus();";
	//alert(sFocusScript);
	window.setTimeout( sFocusScript, 10 );
	//this.text_box.focus();
}
