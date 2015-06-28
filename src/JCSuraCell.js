try{ onLoadScriptFile(); } catch(e){};

var gActiveSuraMenu;

function JCSuraCell()
{
	this.nIndex = parseInt(this.sIndex);
	//this.Menu = null;
	this.id = "SuraCell" + this.sIndex;
	
	this.onmouseover = function(){
		this.style.border = "solid 1px black";

		if(!this.buttons){
			this.insertButtons();
		}
		eval("SuraActions_" + this.sIndex + ".style.visibility='visible';");
	};

	//if( gMemPercent[this.nIndex-1] > 0)
	//	this.title = "تحفظ " + gMemPercent[this.nIndex-1] + "% من آيات السورة";

	this.insertButtons = function()
	{
		var txtElement = this.childNodes[0];
		txtElement.insertAdjacentHTML(	"afterBegin", 
										"<div id=SuraActions_" + this.sIndex + " style='float:left;font-size:3px'>" +
											"<img mClass=JCSuraAction onclick='reciteSura(" + (this.nIndex-1).toString() + ");event.cancelBubble=true;' class='suraAction' src=images/speaker3.gif width=14 height=12 title='الإستماع الى التلاوة'>&nbsp;" +
											"<img mClass=JCSuraAction onclick='openSura(" + this.sIndex + ");event.cancelBubble=true;' class='suraAction' src=images/noon2.jpg width=14 height=12 title='عرض النص والتفسير والتراجم'>&nbsp;" +
											"<img mClass=JCSuraAction onclick='" + this.sID + ".showChart()' class='suraAction' src=images/magnifier.gif xtitle='عرض سريع لنص السورة'>" +
											//"<img mClass=JCSuraAction onclick='ShowPages(" + this.sIndex + ");event.cancelBubble=true;' class='suraAction' src=images/open_book.gif width=14 height=12 title='افتح المصحف لقراءة السورة'>" +
											//"<img id=SuraAction_" + this.sIndex + " src=images/down.gif>" + 
										"</div>"
									 );
		this.processInnerClasses();
		this.buttons=true;
	};
	
	this.onmouseout  = function(){
		this.style.border = "solid 1px " + this.style.background;
		this.hideActions();
		if( !IsChildOf( event.toElement, this ) && !document.bDragging ){
			this.hideMenu();
		}
	};

	this.hideActions = function(){
		var aButtons = document.getElementById( "SuraActions_" + this.sIndex );
		if( aButtons ){
			aButtons.style.visibility = "hidden";
		}
	};

	this.style.background = sura_type[this.nIndex-1] == 0 ? "#cedede" : "#efefe7";
	this.style.border = "solid 1px " + this.style.background;
	this.style.height = "18px";
	this.vAlign = "top";

	this.toString = function(){
		return	"<div style='z-index:" + (120 - this.nIndex) + ";position:absolute;width:100%'>" +	this.sIndex + "&nbsp;" + gSuraNames[this.sIndex] + 
					"<div onclick='event.cancelBubble=true' style='background:white;display:none' id=SuraChart_" + this.sIndex + "></div>" + 
				"</div>" +
				"<div id=MemPercent" + this.sIndex + " style='height:12px;background:#FFFFCC;width:" + gMemPercent[this.nIndex-1] + "%'></div>" +
				"<div style='z-index:" + (120 - this.nIndex) + ";position:absolute;display:none' class=sMenu id=SuraMenu_" + this.sIndex + "></div>";
	};

	this.updateMemPercent = function(){
		eval( "MemPercent" + this.sIndex + ".style.width='" + gMemPercent[this.nIndex-1] + "%';" );
		if( gMemPercent[this.nIndex-1] > 0)
			this.title = "تحفظ " + gMemPercent[this.nIndex-1] + "% من آيات السورة";
		else
			this.title = "";

	};
	//this.setTextColor = function(sColor){
	//};

	this.hideMenu = function(){
		if(gActiveSuraMenu){
			gActiveSuraMenu.menu.style.display="none";
			//eval("SuraAction_" + gActiveSuraMenu.sIndex + ".src='images/down.gif';");
			gActiveSuraMenu = null;
			return true;
		}
		return false;
	};

	this.showChart = function(){
		event.cancelBubble = true;
		if(!this.hideMenu()){
			this.showMenu(true);
		}
	};

	this.showMenu = function(bChart){
		gActiveSuraMenu = this;

		if( !this.menu ){
			this.menu =	document.getElementById( "SuraMenu_" + this.sIndex );
		}

		this.menu.style.display = "";
		this.menu.style.width = this.offsetWidth;
		this.menu.style.left = this.offsetLeft + 5 - document.body.scrollLeft;
		this.menu.style.top = this.menu.previousSibling.previousSibling.offsetTop + 15;
		
		if(bChart){
			if( this.menuContent != 2 ){
				this.menu.innerHTML = "<div suraNo=" + this.sIndex + " mClass=JCSuraViewer></div>";
			}
			this.menuContent = 2;
		}
		else{
			this.menuContent = 1;
			this.menu.innerHTML = this.getMenuItems();
		}
		
		//eval("SuraAction_" + this.sIndex + ".src='images/top.gif';");
		
		InitDocObjects(this.menu);
	};
	
	this.onclick = function(){
		if(gActiveSuraMenu)
			gActiveSuraMenu.hideMenu();
		else
			this.showMenu();
		return false;
	};

	this.getMenuItems = function()
	{
		var mem = gMemPercent[this.nIndex-1];
		var bAudio = reciterSuras[idReciter.selectedIndex].substring(this.nIndex-1,this.nIndex) == "1";

		var	sRetValue = "<div mClass=JCMenuItem bullet=open_book.gif onclick='ShowPages(" + this.sIndex + ")'>إفتح المصحف لقراءة السورة</div>"+
						( bAudio ? "<div bullet=speaker3.gif mClass=JCMenuItem onclick='reciteSura(" + (this.nIndex-1).toString() + ")'>تلاوة بصوت " + gReciterNames[idReciter.selectedIndex] + "</div>" : "" )+						
						"<div mClass=JCMenuItem bullet=noon2.jpg onclick='openSura(" + this.sIndex + ")'><img src=images/next.gif width=9 height=9> عرض النص والتفسير والتراجم</div>" +
						( bAudio ? "<div mClass=JCMenuItem bullet=disk2.gif onclick='" + this.sID + ".saveAs()'>تنزيل التلاوة على القرص</div>" : "" ) +
						( ( mem == 100 ) ? "" : "<div bullet=yes.gif mClass=JCMenuItem onclick='onClickMemSura(" + this.sID + ");'>أضف الى السور التي حفظتها</div>") +
						( ( mem == 0 ) ? "" : "<div bullet=delete.gif mClass=JCMenuItem onclick='onClickUnMemSura(" + this.sID + ");'>حذف من السور التي حفظتها</div>" ) + 
						"<div mClass=JCMenuItem bullet=edit.gif onclick='openControlPanel(" + this.sIndex + ")'>تعديل بيانات التحفيظ للسورة</div>" + 
						"<div mClass=JCMenuItem onclick='openTrainer(" + this.sIndex + ")'>تدرب على حفظ السورة</div>";
		return sRetValue;
	};

	this.saveAs = function()
	{
		this.menu.innerHTML = 
			"<div align=center style='font-size:13px;height:120px;padding:5px'>" + 
				"<a onclick='' href='" + GetSaveURL(this.nIndex-1) + "'>سورة " + gSuraNames[this.nIndex] + " بصوت " + gReciterNames[idReciter.selectedIndex] + "<br>" +
					"<img  width=64 border=0 src=images/disk.gif><br>إضغط بزر الماوس الأيمن ثم إختر حفظ الهدف بإسم</a></div>";
	};
}


function JCMenuItem()
{
	this.className = "suraMenuItem";
	if( !this.bullet ) this.bullet = "next.gif";
	this.onmouseover = function(){this.style.color="black";this.style.background="#CFE6A6";};
	this.onmouseout = function(){this.style.color="";this.style.background="#F0F0F0";};
	this.toString = function(){
		return "<span style='text-align:center;width:18px'><img src=images/" + this.bullet + " xwidth=12 xheight=9></span> " + this.innerText;
	};
}

function JCSuraAction()
{
	this.className = "suraAction";
	this.onmouseover = function(){ this.className = "suraActionHover"; };
	this.onmouseout = function(){ this.className = "suraAction"; };
}

function JCFilterBtn()
{
	this.implementClass( JCSuraAction );

	this.toString = function(){
		var sTitle = this.mKey ? this.mKey : "&nbsp;الكل&nbsp;";
		return "<span style='font-size:11px;width:13px;text-align:center;'>" + sTitle + "</span>";
	};

	this.onclick = function(){
		var list = document.getElementById(this.mList);
		if(list){
			for(i=0; i< list.childNodes.length; i++)
			{
				var aChild = list.childNodes[i];
				if( this.mKey )
				{
					if( aChild.innerText.indexOf(this.mKey) == 0 ){
						aChild.style.display = "";
					}else{
						aChild.style.display = "none";
					}
				}
				else
				{
					aChild.style.display = "";
				}
			}
		}
	};
}