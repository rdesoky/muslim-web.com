var QSearch = {

	ui:{
		showProgress:function(sKeyword){
			DU.show("SearchResultsRoot");
			_E("SearchTabs").addTab( "sresult_" + sKeyword, sKeyword, "SearchResults_" + sKeyword );
			_E("SearchResults_" + sKeyword).innerHTML = _S.searching + "..." ;
		},
		
		showResults:function(xmlResults){
			_E("idViewTabs").onClickTab( "pages" );
			//VerticalIndex.setTab("taf");
			
			var xmlParser = new XMLParser( xmlResults );
			var sHTML = "";

			var root = xmlParser.selectNode();
			var count = root.getAttribute("count");
			var total = parseInt( root.getAttribute("total"), 10);
			var page_size = parseInt( root.getAttribute("page_size"), 10);
			var curr_page = parseInt(root.getAttribute("page"),10);
			var search_text = root.getAttribute("search_text");
			var start = root.getAttribute("start");

			xmlParser.selectNodes("//aya");

			for( var i=0; i<xmlParser.resultsCount(); i++ ){
				var item_num = 1 + i + curr_page * page_size;
				var item = xmlParser.getItem(i);
				aya = parseInt(item.getAttribute("aya_num"),10) + 1;
				sura = parseInt(item.getAttribute("sura_num"),10) + 1;
				sHTML +="<div class='result_item' onclick='QSearch.ui.onClickResult(" + sura + "," + aya + ")'>" + 
							item_num.toString() + ". " + _S.sura_names[sura-1] + " (" + aya + ") :" + 
							item.getAttribute("aya_plain_text") + 
						"</div>";
			}

			//sHTML += "<div dir='ltr'>" + 
				//	xmlResults.replace(/\</g,"&lt;").replace(/\>/g, "&gt;") + 
			//"</div>";


			var eTab = _E("SearchTabs").addTab( "sresult_" + search_text, search_text, "SearchResults_" + search_text );

			DU.show("SearchResultsRoot");

			if(total==0){
				_E("SearchResults_" + search_text).innerHTML = _S.no_results;
			}else{
				_E("SearchResults_" + search_text).innerHTML = 
						"<table class='sresults_layout'><tr>" + 
							(total ? "<td class='sresutls_nav'>" + this.getVNavigator(search_text,total, page_size, curr_page) + "</td>" : "") + 
							"<td class='sresults_list'><div class='search_results'>" + sHTML + "</div></td>" + 
						"</tr></table>";
			}
			eTab.firstChild.nodeValue = search_text + " (" + total.toString() + ") ";
			var scroller = _E( "Scroller_" + search_text );
			if( scroller ){
				scroller.onclick= function(e){
					var event = U.ieEvent(e);
					if( e || event.srcElement==this ){
						var scrollY = event.offsetY;
						var page = Math.floor( ( scrollY / 50 * total ) / page_size );
						QSearch.cgi.doSearch( search_text , page );
					}
				};

				scroller.onmousemove= function(e){
					var event = U.ieEvent(e);
					if(event.srcElement==this){
						var scrollY = event.offsetY;
						var page = Math.floor( ( scrollY / 50 * total ) / page_size ) + 1;
						this.title = _S.p + ":" + page;
						U.viewMouseValues(event);
						//document.title = "Y:" + scrollY + " ;page:" + page;
					}else{
						//document.title = event.srcElement.tagName;
					}
				};
			}
		},

		getVNavigator:function(sKeyword, total, pageSize, currPage){
			var pagesCount = Math.floor( (total-1) / pageSize ) + 1;
			var sHTML = "";

			if(pagesCount<2){
				return "";
			}

			if( currPage>0 ){
				sHTML += "<tr><td title='" + _S.prev_page+ "' class='scrollButton' onclick=\"QSearch.cgi.doSearch('" + sKeyword + "'," + (currPage-1).toString() + ")\">&nbsp;<img src='images/up.gif'>&nbsp;</td></tr>";
			}else{
				sHTML += "<tr><td class='scrollDummyButton'></td></tr>";
			}

			var pageHeight = Math.floor( 48 / pagesCount );
			var topOffset = currPage * pageHeight;
			var bottomOffset = 48 - topOffset - pageHeight;

			sHTML += "<tr><td class='sresults_scroller' id='Scroller_" + sKeyword + "'>" + 
						_S.p + "<br/>" + 
						(currPage+1).toString() + "<br/>" +
						_S.from + "<br/>" +
						pagesCount.toString() + 
					"</td></tr>";

			if( currPage < pagesCount-1 ){
				sHTML += "<tr><td title='" + _S.next_page+ "' class='scrollButton' onclick=\"QSearch.cgi.doSearch('" + sKeyword + "'," + (currPage+1).toString() + ")\">&nbsp;<img src='images/down.gif'>&nbsp;</td></tr>";
			}else{
				sHTML += "<tr><td class='scrollDummyButton'></td></tr>";
			}
			return "<table class='vNavigator'>" + sHTML + "</table>";
		},

		onClickResult:function( suraNum, ayaNum ){
			QViewer.gotoAya(ayaNum-1, suraNum-1, 1);
		}
	},
	
	cgi:{
		doSearch:function( sKeyword, nPage, sOnSuccess ){
			if( !sKeyword || !sKeyword.length ){
				return;
			}
				
			if( !sOnSuccess ){
				sOnSuccess = "QSearch.ui.showResults(gDataResponse)";
			}
			if(nPage == undefined){
				nPage = 0;
			}

			var sCgiUrl = "http://cgi.muslim-web.com/cgi-bin/search.pl?s=" + 
					escape( ConvertUnicodeToCP1256( sKeyword ) ) + "&ps=5&p=" + nPage;// + "&t=" + (new Date()).getTime().toString();
			
			QSearch.ui.showProgress(sKeyword);

			LoadData( sCgiUrl, sOnSuccess, true );
		}
	}
};
