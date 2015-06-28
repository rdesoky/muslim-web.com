
var PageMap = {
	mapInfo:[],
	
	refresh:function(){
		for( var nSide=0; nSide<2; nSide++ ){
			if( PageMap.mapInfo[nSide] != undefined ){
				PageMap.mapInfo[nSide] = undefined;
				var pageNum = QViewer.sidePageNumber(nSide);
				this.load( pageNum, "PageMap.redraw(" + pageNum + ")" );
			}
		}
	},

	redraw:function(pageNum){
		var nSide = QViewer.pageSide(pageNum-1);
		MemorizationMap.draw(pageNum);
		Selection.draw(nSide);
	},
	
	removePage:function(pageNum){
		var nSide = QViewer.pageSide(pageNum-1);
	},
	
	removeSide:function(nSide){
		Selection.hide(nSide);
		Hover.hide();
		this.mapInfo[nSide]=null;
	},

	getLinesY:function(){
		return gHighResolution ? [0,29,57,86,114,143,172,200,229,258,287,315,344,373,401,432] : 
								[0,27,53,80,107,134,161,188,214,241,268,295,322,348,375,404];
	},
	
	getPageHeight:function(){
		return gHighResolution ? 432:404;
	},
	
	yPos2LineNum:function( ypos ){
		var linesY=this.getLinesY();
		for( var i=0; i<linesY.length; i++ ){
			if( ypos < linesY[i] ){
				return i-1;
			}
		}
		return linesY.length;
	},
	//TODO: associate sOnload with pending page and eval it in onLoad() handler, that gives us control over duplicate loading
	load:function(pageNum, sOnload){
		if( pageNum == undefined ){
			pageNum = QViewer.currPageNum;
		}

		if( this.pageMapLoaded(pageNum) ){
			if(sOnload){
				window.setTimeout( sOnload, 1 );
			}
			return;
		}

		var nSide = QViewer.pageSide( pageNum );

		PageMap.mapInfo[nSide] = null;
		Selection.hide(nSide);
		Hover.hide();

		//this.lnHeight = gHighResolution ? 28.9 : 27;
		this.lnWidth  = gHighResolution ? 292 : 266;

		if( !sOnload ){
			sOnload = "";
		}
		//var ver = (d.getFullYear()).toString() + "-" + (d.getMonth()+1).toString() + "-" + (d.getDate()).toString();
		var ver = "2010-11-23";
		if(document.domain.indexOf( "cgi" ) == 0){//|| document.domain.indexOf( "new" ) == 0 ){
			var d = new Date();
			ver = d.getTime().toString();
			LoadData( 
				PgMapBase + "get_page_layout.pl" + 
					"?pg=" + pageNum.toString() + "&v=" + ver, 
				"if(PageMap.onLoad(" + nSide + ")){" + sOnload + "};"
			);
		}
		
		U.httpGet(
			"pg_map/pm_" + pageNum.toString() + ".json",
			function(t){
				gDataResponse = eval( "(" + t + ")" );
				if(PageMap.onLoad(nSide)){
					eval(sOnload);
				}
			}
		);
	},
	
	onLoad:function(nSide){
		if(_E("EditorOutput")){
			_E("EditorOutput").innerHTML = gDataResponse;
		}

		var layout = eval(gDataResponse);
		
		if( layout.success > "0" ){
			if( QViewer.sidePageNumber(nSide) != parseInt( layout.page,10 ) ){
				return false;//invalid map
			}
			verse_list = layout.child_list;
		}else{
			return false;
		}

		for( var i=0; i<verse_list.length; i++ ){
			for( var propName in verse_list[i] ){
				verse_list[i][propName] = parseInt( verse_list[i][propName], 10 );
			}
		}
		
		//if( PageMap.mapInfo[nSide] && PageMap.mapInfo[nSide][0].page == layout.page ){
		//	return false;// map has been loaded already
		//}

		PageMap.mapInfo[nSide] = verse_list;
		MemorizationMap.draw( ToInt(layout.page) );
		Selection.draw( QViewer.pageSide( ToInt(layout.page) ) );
		return true;
	},

	pageMapLoaded:function( nPage ){
		var nSide = QViewer.pageSide(nPage);
		return( PageMap.mapInfo[nSide] && PageMap.mapInfo[nSide][0].page == nPage );
	},

	ayaMapLoaded:function( sura, aya ){
		var nPage = QData.ayaPage( sura-1, aya-1 ) + 1;
		return this.pageMapLoaded(nPage);
	},
	
	selectAya:function( suraNum, ayaNum, sOnSelect ){

		if( !this.ayaMapLoaded( suraNum, ayaNum ) ){
			this.load( 
				QData.ayaPage( suraNum-1, ayaNum-1 ) + 1, 
				"PageMap.selectAya(" + suraNum + "," + ayaNum + "," + "'" + sOnSelect + "')" 
			);
			return false;
		}

		var nPage = QData.ayaPage( suraNum-1, ayaNum-1 ) + 1;
		var nSide = QViewer.pageSide(nPage);
		var layout = PageMap.mapInfo[nSide];
		if( !layout ){
			return false;
		}

		for( var i=0; i<layout.length ; i++ ){
			var aInfo = layout[i];

			if( nPage !=aInfo.page){
				return false;
			}

			if( aInfo.sura == suraNum && aInfo.aya == ayaNum ){
				this.selection = U.copyObject(aInfo);
				//Selection.info = U.copyObject(aInfo);
				if( sOnSelect ){
					window.eval( sOnSelect );
				}
				return this.selection;
			}
		}
		return false;
	},

	xpix:function(x){
		return Math.floor( x*this.lnWidth/100 );
	},

	findAya:function( nSide, x, y ){
		if( !PageMap.mapInfo[nSide] ){
			return false;
		}

		var pageNo = QViewer.sidePageNumber(nSide);
		var lineNo = this.yPos2LineNum(y);
		x = this.lnWidth - x;//toggle mouse x

		var pageNo = QViewer.sidePageNumber( nSide )
		var layout = PageMap.mapInfo[nSide];

		var matchedInfo = null;
		
		for( var nAya =0,nCount=layout.length; nAya < nCount; nAya ++ )
		{
			var aInfo = layout[nAya];

			if(pageNo != aInfo.page ){
				break;
			}

			var spos = this.xpix( aInfo.spos );
			var epos = this.xpix( aInfo.epos );

			if( lineNo == aInfo.sline )
			{
				if( aInfo.sline == aInfo.eline )
				{//one line aya
					if( epos >= x && spos <= x ){// matched
						matchedInfo = aInfo;
						break;
					}
				}
				else
				{// multiple lines
					if( spos <= x ){// matched
						matchedInfo = aInfo;
					}
					break;
				}
			}
			else if( lineNo > aInfo.sline && lineNo<aInfo.eline)
			{
				matchedInfo = aInfo;
				break;
			}
			else if( lineNo == aInfo.eline )
			{
				if( x <= epos ){// matched
					matchedInfo = aInfo;
					break;
				}
			}
		}

		return matchedInfo;
	},
	
	infoListToHtml:function( infoList ){
		var sHTML = "";
		for( var i=0; i< infoList.length; i++ ){
			sHTML += this.infoToHtml(infoList[i]);
		}
		return sHTML;
	},
	infoToHtml:function( aInfo ){
		var nSide = QViewer.pageSide(aInfo.page);

		var fixSide= function(x){
			return (nSide ? 0:1) * PageMap.lnWidth + x;
		};
		var spos = this.xpix( aInfo.spos );//- (aInfo.spos>2?2:0) );//adding 2% margin to aya start 
		var epos = this.xpix( aInfo.epos );
		var aLinesY = this.getLinesY();
		var nCount = aInfo.eline - aInfo.sline + 1;

		//draw first part
		var width = ( nCount==1 ? epos : this.lnWidth ) - spos ;
		var top = aLinesY[aInfo.sline];
		var height = aLinesY[aInfo.sline+1] - top - 1;
		var style = [
			"top:" + top + "px",
			"height:" + height + "px",
			"left:" + fixSide( this.lnWidth - spos - width ) + "px",
			"width:" + width.toString() + "px"
		].join(";");

		var attr = [
			"side='" + nSide + "'",
			"sura='" + aInfo.sura + "'",
			"aya='"	+ aInfo.aya + "'",
			"class='map_item'"
		].join(" ");

		var sHTML = "<div " + attr + 
			" style='" + style + "'" + 
		"></div>";

		for(var i=1; i<nCount-1; i++ )
		{// draw middle part
			top = aLinesY[aInfo.sline+i];
			height = aLinesY[aInfo.sline+i+1]-top-1;
			style = [
				"height:" + height + "px",
				"top:" + top + "px",
				"left:" + fixSide(0) + "px",
				"width:" + this.lnWidth + "px"
			].join(";");
			
			sHTML += "<div " + attr + 
				" style='" + style + "'" + 
			"></div>";
		}

		if( nCount > 1 )
		{// draw last line
			top = aLinesY[aInfo.eline];
			height = aLinesY[aInfo.eline+1] - top - 1;
			width = epos;
			style = [
				"top:" + top + "px",
				"height:" + height + "px",
				"left:" + fixSide( this.lnWidth - width ) + "px",
				"width:" + width.toString() + "px"
			].join(";");

			sHTML += "<div " + attr + 
				" style='" + style + "'" + 
			"></div>";
		}
		return sHTML;
	}

};

var Hover={
	hide:function(){
		_E("VerseHover").innerHTML = "";
	},

	handleEvent:function(e){
		var event = U.ieEvent(e);
		U.viewMouseValues(event);
		var nSide = ToInt( this.getAttribute("side") );
		Hover.handleMouse( nSide, this.offsetLeft - ( nSide ? 0 : PageMap.lnWidth ), this.offsetTop);
	},

	handleMouse:function(nSide, xpos, ypos){
		this.draw( PageMap.findAya( nSide, xpos, ypos ) );
	},

	draw:function( aInfo ){
		if( aInfo == undefined ){
			aInfo = this.info;
		}else{
			this.info = U.copyObject(aInfo);
		}

		if( aInfo == undefined ){
			_E("VerseHover").innerHTML = "";
			return;
		}

		var suraNum = aInfo.sura;
		var ayaNum = aInfo.aya;

		var sHTML = PageMap.infoToHtml(aInfo);
		var nSide  = QViewer.pageSide(aInfo.page);

		_E("VerseHover").innerHTML = sHTML;

		for(var mapItem=_E("VerseHover").firstChild; 
			mapItem; 
			mapItem=mapItem.nextSibling )
		{
			mapItem.onclick = function(e){
				var evt = U.ieEvent(e);
				evt.stopPropagation();
				var activeSide = QViewer.getActiveSide();
				if( activeSide!=nSide ){
					QViewer.gotoSide(nSide)
				}
				QViewer.focus();
				QViewer.setCurrentSura( suraNum );
				if(Mask.active){
					var increment = ( Mask.sura == suraNum && Mask.aya== ayaNum );
					QViewer.gotoAya(ayaNum-1, suraNum-1);
					if( increment ){
						Mask.increment();
					}
					return;
				}
				if(evt.ctrlKey){
					Selection.setStart(suraNum, ayaNum );
					return;
				}
				if(evt.shiftKey){
					Selection.setEnd(suraNum, ayaNum);
					return;
				}
				if(activeSide==nSide){
					VerticalIndex.setTab("taf");
					TafPage.update( suraNum , ayaNum );
				}
			};
						
			mapItem.oncontextmenu=function(e){
				var event = U.ieEvent(e);
				event.preventDefault();
				U.viewMouseValues(event);
				var menu = createMenu( 
					QViewer.getAyaContextMenu( suraNum, ayaNum )
				);
				menu.attach(document.body, 
					"mouse", 				{
						x: event.clientX, 
						y: event.clientY
					}
				);
			};

			mapItem.onmouseout=function(e){
				var event = U.ieEvent(e);
				var toClass = event.toElement ? event.toElement.className : "";
				if( toClass.indexOf( "menuItem" ) == -1 && toClass.indexOf( "aMenu" ) == -1 && toClass != "map_item" ) {
					Hover.hide();
				}
			};

			mapItem.onmousewheel=WheelScrollPages;

			if( window.addEventListener ){//For Firefox
				mapItem.addEventListener("DOMMouseScroll", WheelScrollPages, false);
			}

			mapItem.onselectstart = function(e){
				var evt = U.ieEvent(e);
				evt.stopPropagation();
				evt.preventDefault();
			};
		}
	}
};

var Selection ={
	start:null,// {sura:x, sAya:x}
	end:null,
	suraEndAya:function(suraNum){
		if(!this.end){
			return this.start.aya;
		}
		if( suraNum==this.end.sura ){
			return this.end.aya;
		}

		return QData.sura_info[suraNum-1].ac;
	},
	copyText:function(){
		var endAya = this.suraEndAya(this.start.sura);
		copyTextRange(this.start.sura, this.start.aya, endAya);
	},
	recite:function(){
		var endAya = this.suraEndAya(this.start.sura);
		QViewer.menuHandler.reciter.range( this.start.sura, this.start.aya, endAya );
	},
	getContextMenu:function(){
		return [
			{ label:_S.remove_selection, handler:"clearSelection", context: this },
			{ label:_S.recite+"*", handler:"recite", context: this },
			{ label:_S.copy_selected, handler:"copyText", context: this },
			{ label:_S.add_to_memorized, handler:"addMem", context: this },
			{ label:_S.add_to_pending, handler:"addPending", context: this },
			{ label:_S.delete_memorized, handler:"removeMem", context: this }
		];
	},
	addMem:function(){
		for( var suraNum = this.start.sura; suraNum<=(this.end?this.end.sura:this.start.sura); suraNum ++ ){
			var startAya = suraNum > this.start.sura ? 1 : this.start.aya;
			var endAya = this.suraEndAya(suraNum);
			memorizeRange( suraNum, startAya, endAya );
		}
		MemorizationMap.redraw();
		QViewer.showSuraChart();
	},
	addPending:function(){
		for( var suraNum = this.start.sura; suraNum<=(this.end?this.end.sura:this.start.sura); suraNum ++ ){
			var startAya = suraNum > this.start.sura ? 1 : this.start.aya;
			var endAya = this.suraEndAya(suraNum);
			memorizePendingRange( suraNum, startAya, endAya );
		}
		MemorizationMap.redraw();
		QViewer.showSuraChart();
	},
	removeMem:function(){
		for( var suraNum = this.start.sura; suraNum<=(this.end?this.end.sura:this.start.sura); suraNum ++ ){
			var startAya = suraNum > this.start.sura ? 1 : this.start.aya;
			var endAya = this.suraEndAya(suraNum);
			unMemorizeRange( suraNum, startAya, endAya );
		}
		MemorizationMap.redraw();
		QViewer.showSuraChart();
	},
	startSelection:function( menuItem ){
		var ayaNum = menuItem.getContextAya();
		var suraNum = menuItem.getContextSura();
		this.setStart( suraNum, ayaNum );
	},

	setStart:function( suraNum, ayaNum, bForce ){
		if( this.start && this.start.sura == suraNum && this.start.aya == ayaNum ){
			if(!bForce){
				this.start = null;
			}
		}else{
			this.start = {sura:suraNum, aya:ayaNum};
		}
		this.end = null;
		this.updateViewer();
	},
	extendSelection:function( menuItem ){
		var ayaNum = menuItem.getContextAya();
		var suraNum = menuItem.getContextSura();
		this.setEnd( suraNum, ayaNum );
	},
	
	setEnd:function( suraNum, ayaNum ){
		if(!this.start){
			this.start = {sura:suraNum, aya:ayaNum};
			this.end = null;
		}else if(suraNum<this.start.sura || ( suraNum==this.start.sura && ayaNum < this.start.aya ) ){
			if(!this.end){
				this.end = this.start;
			}
			this.start = {sura:suraNum, aya:ayaNum};
		}else{
			this.end = {sura:suraNum, aya:ayaNum};
		}
		this.updateViewer();
	},
	
	attachMenu:function(el){
		if(el.menu){
			el.menu.detach();
			return;
		}
		var menu = createMenu(this.getContextMenu());
		menu.attach(el);
	},

	updateViewer:function(){
		var sHTML = "";
		if( this.start ){
			sHTML = "&nbsp;<span class='fake_combobox' onclick='Selection.attachMenu(this)'>" + _S.selected_verses + "</span>: <span class='href' onclick='QViewer.gotoAya(" + ( this.start.aya - 1).toString() + "," + (this.start.sura-1).toString() + ", 2)'>" + 
						_S.sura_names[this.start.sura-1] + " (" + _S.aya + " " + this.start.aya + ") " +
					"</span>&nbsp;";
		}

		if( this.end ){
			sHTML += _S.to + ": <span class='href' onclick='QViewer.gotoAya(" + ( this.end.aya - 1).toString() + "," + (this.end.sura-1).toString() + ", 2)'>" + 
						( (this.end.sura != this.start.sura) ? _S.sura_names[this.end.sura-1] : "" ) + " (" + _S.aya + " " + this.end.aya + ")" +
					"</span>&nbsp;"; 
		}
		if( sHTML.length ){
			_E("SelectionViewer").innerHTML = sHTML;
		}else{
			_E("SelectionViewer").innerHTML = _S.selection_help;
		}

		this.draw();
	},
	
	clearSelection:function(){
		this.start = this.end = null;
		_E("Selection_0").innerHTML = _E("Selection_1").innerHTML = "";
		this.updateViewer();
	},

	ayaSelected:function(suraNum, ayaNum){
		if(this.end){// range
			if(  ( suraNum>this.start.sura || ( suraNum==this.start.sura && ayaNum>=this.start.aya ) )
			   &&( suraNum<this.end.sura   || ( suraNum==this.end.sura   && ayaNum<=this.end.aya   ) )  )
			{
				return true;
			}
		}else if(this.start) {// single aya
			return( suraNum == this.start.sura && ayaNum == this.start.aya );
		}
		return false;
	},

	hide:function( nSide ){
		if(nSide == undefined){
			_E("Selection_0").innerHTML = _E("Selection_1").innerHTML = 
			_E("Memorized_0").innerHTML = _E("Memorized_1").innerHTML = 
			_E("Pending_0").innerHTML   = _E("Pending_1").innerHTML = 
			"";
		}else{
			_E("Selection_" + nSide).innerHTML = 
			_E("Memorized_" + nSide).innerHTML = 
			_E("Pending_" + nSide).innerHTML   = 
			"";
		}
	},
	
	draw:function(nSide){
		if(this.start==null){
			_E("Selection_0").innerHTML = _E("Selection_1").innerHTML = "";
			return;
		}

		if(nSide == undefined ){
			this.draw(0);
			this.draw(1);
			return;
		}

		var sHTML = "";
		var verse_list = PageMap.mapInfo[nSide];
		if(verse_list){
			for( var i=0; i< verse_list.length; i++ ){
				if( this.ayaSelected( verse_list[i].sura,verse_list[i].aya ) ){
					sHTML += PageMap.infoToHtml(verse_list[i]);
				}
			}
		}
		_E("Selection_" + nSide).innerHTML = sHTML;
		this.setupEvents( "Selection_" + nSide );
	},

	setupEvents:function( sContainer ){
		for( var mapItem=_E(sContainer).firstChild; mapItem; mapItem=mapItem.nextSibling ){
			if( mapItem ){
				mapItem.onmousemove = Hover.handleEvent;
				mapItem.onmousewheel = WheelScrollPages;

				if( window.addEventListener ){
					mapItem.addEventListener("DOMMouseScroll", WheelScrollPages, false);
				}
			}
		}
	}
};

var MemorizationMap = {
	redraw:function(){
		this.draw(QViewer.sidePageNumber(0));
		this.draw(QViewer.sidePageNumber(1));
	},
	clear:function(){
		_E("Memorized_0").innerHTML = _E("Pending_0").innerHTML = 
		_E("Memorized_1").innerHTML = _E("Pending_1").innerHTML = "";
	},
	draw:function( pageNum ){
		var nSide = QViewer.pageSide(pageNum);
		if(!pageNum || nSide<0){
			this.clear();
			return;
		}

		_E("Memorized_" + nSide).innerHTML = this.getSelectionHtml( pageNum, GetMemorizedInfo() );
		_E("Pending_" + nSide).innerHTML = this.getSelectionHtml( pageNum, GetPendingInfo() );

		Selection.setupEvents("Memorized_" + nSide);
		Selection.setupEvents("Pending_" + nSide);
	},

	getSelectionHtml:function( pageNum, selInfo ){// scan layout and add selection blocks for selected verses
		var nSide = QViewer.pageSide(pageNum);
		var verse_list = PageMap.mapInfo[nSide];
		if(!verse_list){
			return "";
		}
		var selSuras = selInfo.split("$");
		var sHTML = "";

		var ayaSelected=function(suraNum, ayaNum){
			var selVerses = selSuras[suraNum].split("|");
			if( selVerses.find( ayaNum.toString() ) ){
				return true;
			}
			return undefined;
		};
		
		for( var i=0; i< verse_list.length; i++ ){
			if( ayaSelected( verse_list[i].sura,verse_list[i].aya ) ){
				sHTML += PageMap.infoToHtml(verse_list[i]);
			}
		}

		return sHTML;
	}
};

var Mask ={
	active:false,
	sideMasks:[0,0],//0: not, 1:partial, 2:quick full, 3:mapped full

	maskSide:function( nSide ){

		var pageNum = QViewer.sidePageNumber(nSide);
		if( PageMap.pageMapLoaded(pageNum) ){
			if( this.sideMasks[nSide] < 3 ){
				_E("Mask_" + nSide).innerHTML = PageMap.infoListToHtml(PageMap.mapInfo[nSide]);
				this.setupEvents( nSide );
				this.sideMasks[nSide] = 3;
			}
		}
		else{//quick mask
			if(this.sideMasks[nSide]<2){
				this.sideMasks[nSide] = 2;
				_E("Mask_" + nSide).innerHTML = 
					"<div class='map_item' style='left:" + (nSide==0?PageMap.lnWidth:0).toString() + "px;width:" + PageMap.lnWidth + "px;height:" + PageMap.getPageHeight() + "px'></div>";
				PageMap.load( pageNum, "Mask.maskSide(" + nSide + ")" );
			}
		}
	},

	unmaskSide:function( nSide ){
		_E("Mask_" + nSide).innerHTML = "";
		this.sideMasks[nSide] = 0;
		PageMap.load( QViewer.sidePageNumber(nSide) );
	},

	increment:function(){
		//if current aya is first in right side, and page is not active, goto the page without incrementing
		var nPage = QData.ayaPage( this.sura-1, this.aya-1 ) + 1;
		var nSide = QViewer.pageSide(nPage);
		if( nSide == 0 && ( QViewer.sidePageNumber(0) != nPage ) ){
			var pageInfo = QData.pagesInfo[nPage-1];
			if(pageInfo.s == this.sura && pageInfo.a == this.aya){
				this.show(this.sura, this.aya);
				return;
			}
		}

		var aInfo = QData.nextAya( this.sura, this.aya );
		if(aInfo == null){// reached last aya in quran
			Mask.hide();
			return;
		}
		//Check if moving to first aya of the right page
		nPage = QData.ayaPage( aInfo.sura-1, aInfo.aya-1 ) + 1;
		nSide = QViewer.pageSide(nPage);
		if( nSide == 0 ){
			var pageInfo = QData.pagesInfo[nPage-1];
			if(pageInfo.s == aInfo.sura && pageInfo.a == aInfo.aya){
				Mask.hide();
				this.sura = aInfo.sura;
				this.aya = aInfo.aya;
				return;
			}
		}
		this.show( aInfo.sura, aInfo.aya );
		QViewer.setCurrentSura(aInfo.sura);
	},

	decrement:function(){
		var aInfo = QData.prevAya( this.sura, this.aya );
		this.show( aInfo.sura, aInfo.aya );
		QViewer.setCurrentSura(aInfo.sura);
	},

	show:function( sura, aya ){//suraNum, ayaNum

		if( !Defined(sura) ){// neither sura nor aya are defined
			sura = this.sura;
			aya = this.aya;
		}else if(!Defined(aya)){// only sura defined
			aya = 1;
		}

		if(!Defined(sura) || !Defined(aya)){// bad call
			return;
		}
		
		if( !this.active ){
			this.active = true;
			_SA("MemReviewTitle","checked",1);
			//_E("MemReviewTitle").innerHTML = _S.stop_mem_review;
		}

		this.sura = sura;
		this.aya = aya;

		var nPage = QData.ayaPage( sura-1, aya-1 ) + 1;

		var nSide = QViewer.pageSide(nPage);
		
		QViewer.gotoPage( nPage );

		if( nSide ==0 ){
			this.maskSide( 1 );
		}else{
			this.unmaskSide( 0 );
		}

		if(! PageMap.pageMapLoaded( nPage ) ){
			this.maskSide( nSide );
			PageMap.load( nPage, "Mask.show()" );
			return;
		}

		var sHTML="";
		var verseList = PageMap.mapInfo[nSide];
		for( var i=0; i< verseList.length; i++ ){
			if( verseList[i].sura > sura || ( verseList[i].sura == sura && verseList[i].aya>=aya ) ){
				if(sHTML == "" && verseList[i].spos>2 ){
					var aInfo = U.copyObject(verseList[i]);
					aInfo.spos -= 2;
					sHTML += PageMap.infoToHtml( aInfo );
				}else{
					sHTML += PageMap.infoToHtml( verseList[i] );
				}
			}
		}

		_E("Mask_" + nSide).innerHTML = sHTML;
		this.sideMasks[nSide] = 1;
		this.setupEvents( nSide );
	},

	setupEvents:function( nSide ){
		for( var mapItem=_E("Mask_" + nSide).firstChild; mapItem; mapItem=mapItem.nextSibling ){
			if( mapItem ){
				mapItem.onmousemove = Hover.handleEvent;
				mapItem.onclick = function(e){
					Mask.increment();
				};
				mapItem.onmousewheel = WheelScrollPages;

				if( window.addEventListener ){
					mapItem.addEventListener("DOMMouseScroll", WheelScrollPages, false);
				}
			}
		}
	},
	
	remove:function(){
		this.active = false;
		this.hide();
	},
	hide:function(){
		_E("Mask_0").innerHTML = _E("Mask_1").innerHTML = "";
		this.sideMasks[0] = this.sideMasks[1] = 0;
		//this.unmaskSide( 1 );
	}
};
