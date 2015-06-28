
var gActiveSuraMenu;

var JCQuranIndex = DefineJClass( {

	getSuraCell:function(i){
		var sHTML = "";
		if( i < 114 ) {
			var sIndex = (i+1).toString();

			sHTML +="<div mClass='JCSuraCell' id='SuraCell" + sIndex + "' sIndex='" + sIndex + "' " + 
						" class='sura_cell " + ( QData.sura_info[i].t == 1 ? "madani" : "makki" ) + "' >" + 
						"<table cid='actions' class='cell_actions' cellpadding=0 style='visibility:hidden;'><tr>"+
							"<td style='width:" + (suraCellWidth - 56).toString() + "px'>&nbsp;</td>"+
							"<td>" + 
								"<img cid='showpage' class='suraAction' src='/images/read.gif' title='" + _S.read_quran_book + "'>"+ 
							"</td>"+
							"<td>" + 
								"<img cid='showtext' class='suraAction' src='/images/noon2.jpg' title='" + _S.display_sura_text + "'>"+ 
							"</td>"+
							"<td>" + 
								"<img cid='recite' class='suraAction' src='/images/speaker3.gif' title='" + _S.recite + "'>" + 
							"</td>"+
						"</tr></table>"+
						"<div cid='menu' class='suraMenu' style='visibility:hidden'></div>"+
						"<div style='position:absolute;padding:1px;width:" + (suraCellWidth - 2).toString() + "px'>" + 
							"<div cid='memPercent' class='memPercent'></div>" + 
						"</div>"+
						"<div class='suraCellName' cid='titleText' style='width:" + (suraCellWidth - 2).toString() + "px;'>" + 
							"<span style='width:20px;display:inline-block'>" + sIndex + "</span>" + 
							gStrings.sura_names[i] + 
						"</div>" + 
					"</div>";
		}else if(i==115){
			sHTML =	"<center><table style='background:silver' cellspacing='1' cellpadding='2'>" +
					"<tr>" +
						"<td style='background:#CEDEDE;'>" + _S.makki + "</td>" +
						"<td style='background:#EFEFE7;'>" + _S.madani + "</td>" +
						"<td style='background:#FFFFCC;'>" + _S.mem_percent + "</td>" +
					"</tr>"
				"</table></center>";
		}else{
			sHTML = "&nbsp;";
		}
		return sHTML;
	},

	//getHTML: function()
	getActiveHTML: function()
	{
		var sHTML = 
			"<table cellspacing='0' cellpadding='0' class='quranIndex'><tr>" + 
				"<td class='indexColumn' style='width:" + (suraCellWidth + 2).toString() + "px'>";

		for( var i=0; i<116; i++ ) 
		{
			if(i&& (i%29==0) )
			{
				sHTML+="</td><td class='indexColumn' style='width:" + (suraCellWidth + 2).toString() + "px'>";
			}
			sHTML+=this.getSuraCell(i);
		}

		return sHTML + "</td></tr></table>";
	},

	destroy:function(){}
} );


var JCSuraCell = DefineJClass( {

	init:function(){
		DU.copyAttr( this, {sIndex:0} );
		this.nIndex = parseInt(this.sIndex,10) - 1;
	},


	showUI: function(){
		var self = this;
		
		var $ = this.$ = DU.elementsByCID(this);

		$.titleText.style.zIndex = 120-this.nIndex;
		$.menu.style.zIndex = 122-this.nIndex;
		$.actions.style.zIndex = 123-this.nIndex;
		$.menu.style.width  = (suraCellWidth-2).toString() + "px";
		
		this.updateMemPercent();

		$.recite.onclick = function(e){
			U.ieEvent(e).stopPropagation();
			ISura.recite( self.nIndex );
		};
		
		$.showtext.onclick = function(e){
			U.ieEvent(e).stopPropagation();
			ISura.openText( self.sIndex );
		};

		$.showpage.onclick = function(e){
			U.ieEvent(e).stopPropagation();
			QViewer.gotoSura((self.nIndex+1).toString());
		};
	},
	
	onmouseover: function(e){
		if( this.$.actions.style.visibility == "hidden" && !this.hShowActions) {
			var self = this;
			this.hShowActions = window.setTimeout(
				function(){
					self.$.actions.style.visibility = "visible";
					self.hShowActions = 0;
				},
				500 
			);
		}
	},

	onmouseout: function(e)
	{
		var event = U.ieEvent(e);

		if( !IsChildOf( event.toElement, this ) ) //&& !document["bDragging"] )
		{
			if( !stopTimer( "hShowActions", this) ) {
				this.$.actions.style.visibility = "hidden";
			}
			this.hideMenu();
		}
	},

	updateMemPercent: function()
	{
		if( gMemPercent[this.nIndex] > 0){
			this.$.memPercent.style.width = Math.floor( ( suraCellWidth - 2 ) * gMemPercent[this.nIndex] / 100 ).toString() + "px";
			//this.title = "تحفظ " + gMemPercent[this.nIndex] + "% من آيات السورة";//TODO:use _S
		}
		else{
			this.$.memPercent.style.width = "0px";
			this.title = "";
		}

	},

	hideMenu: function(){
		if(gActiveSuraMenu){
			this.style.borderWidth = "1px";
			this.style.padding = "0px";

			gActiveSuraMenu.$.menu.style.visibility="hidden";
			gActiveSuraMenu = null;
			return true;
		}
		return false;
	},

	showMenu: function()
	{
		gActiveSuraMenu = this;

		this.$.menu.style.visibility = "visible";
		this.style.borderWidth = "0px";
		this.style.padding = "1px";
		this.$.menuContent = 1;
		this.$.menu.innerHTML = this.getMenuItems();
		
		InitDocObjects(this.$.menu);
	},
	
	onclick: function(e){
		if(gActiveSuraMenu)
			gActiveSuraMenu.hideMenu();
		else
			this.showMenu();
		return false;
	},

	getMenuItems: function()
	{
		var mem = gMemPercent[this.nIndex];
		var selReciter = IReciters.activeReciter;
		var bAudio = Zipper.unzip(RecitersInfo[selReciter].actv).substring(this.nIndex,this.nIndex+1) == "1";

		var	sRetValue = "<div mClass='JCMenuItem' bullet='read.gif' onclick='QViewer.gotoSura(" + this.sIndex + ")'>" + _S.read_quran_book + "</div>"+
						"<div mClass=JCMenuItem bullet='open_book.gif' onclick='QViewer.reviewSura(" + this.sIndex + ")'>" + _S.mem_review + "</div>" +
						( bAudio ? "<div bullet='speaker3.gif' mClass='JCMenuItem' onclick='ISura.recite(" + this.nIndex.toString() + ")'>" + _S.recite + ": " + _S.reciters[selReciter] + "</div>" : "" )+	
						"<div mClass='JCMenuItem' bullet='noon2.jpg' onclick='ISura.openText(" + this.sIndex + ")'>" + _S.display_sura_text + "</div>" +
						( ( mem == 100 ) ? "" : "<div bullet=yes.gif mClass=JCMenuItem onclick='Memorization.addSura(" + this.nIndex + ");'>" + _S.add_to_memorized + "</div>") +
						( ( mem == 0 ) ? "" : "<div bullet=delete.gif mClass=JCMenuItem onclick='Memorization.removeSura(" + this.nIndex + ");'>" + _S.delete_memorized + "</div>" )
						;
		return sRetValue;
	}/*,
	saveAs: function()
	{
		var selReciter = _E("idReciter").getAttribute("sel");
		this.$.menu.innerHTML = 
			"<div align=center style='font-size:13px;height:120px;padding:5px'>" + 
				"<a onclick='' href='" + GetSaveURL(this.nIndex) + "'>سورة " + gStrings.sura_names[this.nIndex] + " بصوت " + _S.reciters[selReciter] + "<br>" +
					"<img  width=64 border=0 src=/images/disk.gif><br>إضغط بزر الماوس الأيمن ثم إختر حفظ الهدف بإسم</a></div>";
	}*/
} );


function JCMenuItem()
{
	this.showUI = function(e)
	{
		this.className = "suraMenuItem";
		DU.copyAttr(this, {bullet:""} );
		this.internalText = this.innerHTML;
		if(this.bullet.length){
			this.innerHTML = "<span style='text-align:center;width:18px'><img src=/images/" + this.bullet + "></span>" + 
								this.innerHTML;
		}
	};
}

function JCFilterBtn()
{
	this.className = "tinyBtn";

	DU.copyAttr( this, { mKey: null, mList: "" } );
	this.showUI = function()
	{
		var sTitle = this.mKey ? this.mKey : _S.all;
		this.innerHTML = "&nbsp;" + sTitle + "&nbsp;";
	};

	this.onclick = function(e)
	{
		U.ieEvent(e).stopPropagation();
		var list = _E( this.mList );
		if(list){
			for(i=0; i< list.childNodes.length; i++)
			{
				var aChild = list.childNodes[i];
				if( aChild.innerHTML ){
					if( !this.mKey || aChild.innerHTML.indexOf( this.mKey ) == 0 ){
						aChild.style.display = "";
					}else{
						aChild.style.display = "none";
					}
				}
			}
		}
	};
}
