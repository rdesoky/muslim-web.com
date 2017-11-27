var gMemPercent;
var gUserID;

var HomePage = {
	showHelp:function(){
		if(this.helpContent==undefined){
			this.helpContent = _E("HelpFrame");
		}
		var popup = UI.openPopup( "RecitersUI", this.helpContent, _S.help );
	},
	init:function(){
		CK.remove("reciter,lpg,vi");
		AudioPlayer.init();
		MemApp.init();
		DU.mkVisible("RandomPlayLink");
		
		_E("cHelp").onclick=function(){
			DU.toggleClass(document.body,"help_on");
		};
		
		_E("SearchForm").onsubmit = function(){
			if(this.keyword.hideKeyboard!=undefined){
				this.keyword.hideKeyboard();
			}
			var keyword = this.keyword.value.trim();
			if( keyword.length ){
				QSearch.cgi.doSearch(keyword);
			}
			return false;
		};

		gMemPercent = AllSuraMemPercent();

		InitDocObjects();

		IMember.updateUI();

		gClickListen = false;
		
		LoadTahfeez("Memorization.updateIndex()");	

		IReciters.populate();
		var lastSura = ISura.showRecent();
		AudioPlayer.loadRange(0,{sura:lastSura});
		this.showPageMarks();

		var nBlinks = 4;
		setTimeout( 
			function blinkAd(){
				_E("idKoboolAd").style.visibility = (nBlinks%2) ? "visible" : "hidden";
				nBlinks --;
				if(nBlinks){
					setTimeout(blinkAd, 500);
				}
			},
			4000 
		);

		Memorization.updateTotal();

		QViewer.updateResolution();	
		
		var selTab = getCookie("dvw","pages");

		_E("idViewTabs").onClickTab( selTab, true );

		this.setupEvents();

		PageLayout.update();
	},

	setupEvents:function(){
		var self = this;

		window.onresize = function(e){
			PageLayout.update();
		};

		_E("idBtnPageMark").onclick = function(e){
			PageMarks.toggle();
			HomePage.showPageMarks();
		};

		_E("SpinnerBtn").onclick = function(e){
			QViewer.onGotoPage(_E('gPageSpin').getValue());
		};

		_E("ZoomButton").onclick = function(e){
			setCookie( "hr", gHighResolution ? "0" : "1" ); 
			QViewer.updateResolution();
			Hover.hide();
			QViewer.gotoPage();
			PageLayout.update();
			PageMap.refresh();
			if(Mask.active){
				QViewer.cancelReviewMode();//TODO: refresh mask instead of removing it
			}
			
		};

		_E("RightNavCell").onclick = function(e){
			if(Mask.active){
				Mask.decrement();
			}else{
				QViewer.prevPage();
			}
			QViewer.focus();
		};
		_E("LeftNavCell").onclick = function(e){
			if(Mask.active){
				Mask.increment();
			}else{
				QViewer.nextPage();
			}
			QViewer.focus();
		};
		_E("VerticalIndex").onclick = function(e){QViewer.focus();};
		_E("SiteTitle").onclick = function(e){
			if( _E("idViewTabs").getSelectedTab() == "index"){
				_E("idViewTabs").onClickTab("pages");
			}else{
				_E("idViewTabs").onClickTab("index");
			}
		};
		_E("idCancelLogin").onclick = function(e){IMember.onCancelLogin()};
		_E("SearchTabsRoot").onmouseover = function(e){
			stopTimer("hideTimer", this);
			if(!this.showTimer && !DU.isShown("SearchResultsRoot")){
				var self = this;
				this.showTimer = setTimeout( 
					function(){
						self.showTimer = null;
						DU.show("SearchResultsRoot");
					},
					500
				);
			}
		};
		_E("SearchTabsRoot").onmouseout = function(e){
			stopTimer("showTimer", this);
			if(!this.hideTimer){
				var self = this;
				this.hideTimer = setTimeout( 
					function(){
						self.hideTimer = null;
						DU.hide("SearchResultsRoot");
					},
					1000
				);
			}
		};
	},

	showPageMarks:function(){
		var	pageMarks = readCookie("pgm", "");

		_E("idBtnPageMark").innerHTML = _S.bookmark;

		if( pageMarks != undefined )
		{
			pageMarks = pageMarks.split(",");

			var nActivePage = QViewer.currPageNum;
			var sRecentList = "";
		
			for (i=0; i<pageMarks.length; i++)
			{
				var nPageNo = parseInt( pageMarks[i] );

				if( nPageNo == nActivePage ){
					_E("idBtnPageMark").innerHTML = _S.remove_page_mark;
				}

				var nSura = QData.pageSura(nPageNo);

				if(pageMarks[i].length){
					sRecentList += "<option value=" + pageMarks[i] + ">" + 
							_S.page + ": " + pageMarks[i] + " : " + gStrings.sura_names[ nSura ] + 
						"</option>";
				}
			}

			if( sRecentList.length > 0 )
			{
				_E("idPageMarks").innerHTML = "<select id='idSelectPageMark' style='width:120px'>" + 
													"<option>" + _S.pageMarks + "...</option>" + 
													sRecentList + 
												 "</select>";
				
				_E('idSelectPageMark').onchange = function( e ){
					var nPage = parseInt(this.value,10);
					nPage=parseInt( nPage );
					QViewer.onGotoPage(nPage);
					PageMarks.pushPage( nPage );
					HomePage.showPageMarks();
					QViewer.focus();
				};
			}
		}
	}
};

var PageLayout = {
	update:function(){
		width = document.body.offsetWidth;
		minWidth = _E("idViewTabs").getSelectedTab() == "index" ? 756: (gHighResolution ? 1000:940);
		if(width<minWidth){
			DU.hide("RightMenu");
		}
		else{
			DU.show("RightMenu");
		}
	}
};

var Memorization = {

	updateIndex:function(){
		gMemPercent = AllSuraMemPercent(true);

		for (var i=1; i<=114; i++){
			this.updateCell( i );
		}
		this.updateTotal();
	},
	confirmChange:function( suraIndex ){
		var currPercent = gMemPercent[suraIndex];
		if( currPercent > 0 && currPercent < 100 ){
			if( !window.confirm("سيتم تعديل بيانات التحفيظ الحالية لهذه السورة\nهل أنت متأكد؟.") )
				return false;
		}

		return true;
	},

	addSura:function( nSura ){
		if( !this.confirmChange( nSura ) ){
			return;
		}
		memorizeSuraNo( nSura + 1 );
		gMemPercent = AllSuraMemPercent();
		this.updateTotal();
		this.updateCell( nSura + 1 );
	},
	removeSura:function( nSura ){
		if( !Memorization.confirmChange( nSura ) ){
			return;
		}
		unMemorizeSura( nSura + 1 );
		gMemPercent = AllSuraMemPercent();
		this.updateTotal();
		this.updateCell( nSura + 1 );
	},

	updateCell:function( suraNum ){
		suraCell = _E("SuraCell" + suraNum.toString());
		if(suraCell.updateMemPercent){
			suraCell.updateMemPercent();
		}else{
			ActivateJC("SuraCell" + suraNum, true );
		}
	},

	updateTotal:function(){
		if( _E("idMemorized") ){
			var memPercent = quranMemPercent();
			_E("idMemorized").innerHTML = memPercent.toString(10);
			//_E("idMemChart").style.width = memPercent.toString(10) + "px";
		}
	}
};

var IReciters = {
	init:function(){
		if( this.initDone ){
			return;
		}
		//save references to DOM elements
		this.uiPanel = _E( "idRecitersPanel" );
		this.recentReciters = _E("idRecentReciters");
		this.initDone = true;
		this.insertFilters();
	},

	openPopup:function(){
		this.init();
		var popup = UI.openPopup( "RecitersUI", this.uiPanel, _S.selectReciter );
	},

	closePopup:function(){
		UI.closePopup( "RecitersUI" );
	},
	populateRecent:function(){
		var sRecentList = "";
		var	recentReciters = CK.get("reciter","hozefee,hosaree,baset,affassi");
		var recentList = recentReciters.split(",");

		for (i=0; i<recentList.length; i++)
		{
			if(recentList[i].length && RecitersInfo[recentList[i]]!==undefined){
				sRecentList += "<option value=" + recentList[i] + ">" + 
									ReciterName(recentList[i]) + 
								"</option>";
			}
		}
		_E("RecentReciters").innerHTML = 
			"<select id='RecentRecitersList'>" + 
				sRecentList + 
				"<option value='more'>" + _S.more + "...</option>" + 
			"</select>";
		
		_E("RecentRecitersList").onchange = function(e)	{
			if(this.value == "more"){
				IReciters.openPopup();
				this.value = IReciters.activeReciter;
			}else{
				IReciters.select(this.value);
			}
		};
	},
	select:function( reciterID, bNoPush )
	{
		if(!bNoPush){
			this.pushToRecent(reciterID);
		}

		this.activeReciter = reciterID;

		window.setTimeout ( 
			function(){
				var reciterID = IReciters.activeReciter;
				var sReciterMap = Zipper.unzip(RecitersInfo[reciterID].actv);
				
				for( var i=1; i<=114; i++ ){
					var suraCell = _E( "SuraCell" + i.toString(10) );
					if(suraCell){
						suraCell.style.color = sReciterMap.substring( i-1, i  ) == "1" ? "" : "red";
					}
				}
			},
			500 
		);

		if( _E("idPageViewAudio") )
		{
			var pageViews = _E("idPageViews");
			var pageViewAudio = _E("idPageViewAudio");
			var nSuraIndex = QViewer.currSuraNum - 1;
			
			if( Zipper.unzip(RecitersInfo[reciterID].actv).substr(nSuraIndex,1) == "1" ) 
				_E("idPageViewAudio").style.visibility = "";
			else
				_E("idPageViewAudio").style.visibility = "hidden";

		}
		
		this.closePopup();
	},

	insertFilters:function(){
		return;
		if( this.filterd ){
			return;
		}

		this.filterd = true;

		var Filters = _S.reciter_filters;//['ا','ز','ع','س','ط','ه','م'];
		var sKeys = "<span mClass='JCFilterBtn' mList='idReciterList'></span>";

		for(var key in Filters){
			sKeys += "<span mClass='JCFilterBtn' mKey='" + Filters[key] + "' mList=idReciterList></span>";
		}
		_E("idListFilters").innerHTML = sKeys;
		InitDocObjects("idListFilters");
	},
	
	populate:function(){
		this.init();
		var sHTML = "";

		this.showRecent();

		sHTML = "";
		
		for( var reciter in RecitersInfo ){
			if (RecitersInfo[reciter].suraAudio === undefined){
				continue;
			}
			if(sHTML.length){
				sHTML += " ";
			}
			sHTML +="<span class='menu_item' onclick=\"IReciters.select('" + reciter + "')\">" + 
						ReciterName(reciter) +
					"</span>";
		}


		_E("idReciterList").innerHTML = sHTML;
		_E("idReciterList").onclick = function(e){
			//U.ieEvent(e).stopPropagation();
		};

	},

	showRecent:function(){
		var	recentReciters = CK.get("reciter","hozefee");

		this.populateRecent();

		var recentList = recentReciters.split(",");
		
		if( recentList.length ){
			this.select( recentList[0], true );// bNoBush=true
		}
	},

	pushToRecent:function( reciterID ){
		SaveCurrentReciter( reciterID );
		this.showRecent();
	},

	audioAvailable:function( nSura ){

		var selReciter = IReciters.activeReciter;
		if( Zipper.unzip( RecitersInfo[selReciter].actv ).substr(nSura, 1) == "1" ){
			return true;
		}
		return false;
	}
};

var IMember = {
	doneInit:false,

	confirmUpdate:function(){
		this.init();
		var popup = UI.openPopup("ConfirmUpdateDlg", this.confUpdate );
	},

	syncMemorization:function(){
		UI.closePopup("ConfirmUpdateDlg");
		ReloadTahfeez("IMember.onLoadTahfeez()");
	},
	
	onLoadTahfeez:function(){
		IMemReport.generate(_E('MemReport'));
		GetMemorizedInfo(true);
		GetPendingInfo(true);
		Memorization.updateIndex();
		QViewer.showSuraChart();
		MemorizationMap.redraw();
	},

	init:function(){
		if(this.doneInit){
			return;
		}
		this.doneInit = true;
		this.loginPanel = _E("LoginPanel");
		this.userOptions = _E("UserOptions");
		this.confUpdate = _E("ConfirmUpdate");
	},

	openPopup:function(){
		this.init();
		var popup = UI.openPopup('UserManager', 
			gUserID.length ? this.userOptions : this.loginPanel,  
			gUserID.length ? "" : _S.login_form
		);
		return popup;
	},
	closePopup:function(){
		UI.closePopup("UserManager");
	},
	
	updateUI:function(){
		gUserID = getCookie("user","");

		if( gUserID.length )
			IMember.showUserInfo();
		else
			IMember.showGuestInfo();

		this.onLoadTahfeez();
	},

	showUI:function(){
		this.openPopup();
		if(!gUserID.length){
			_E("idLoginForm").lname.focus();
		}
	},

	logout:function(){
		//DU.hide("UserInfo");
		setCookie("user", ""); 
		setCookie("id", ""); 
		setCookie("mem", ""); 
		setCookie("memb", ""); 
		this.closePopup();
		this.updateUI();
		IMember.onLoadTahfeez();
		return true;
	},

	login:function( loginForm ){

		if( loginForm.lname.value.length == 0 ){
			alert("please enter user name");
			loginForm.lname.focus();
			return false;
		}

		if (loginForm.pw.value.length == 0){
			alert("please enter password");
			loginForm.pw.focus();
			return false;
		}

		DU.show( "LoginProgress" );
		
		var sURL ;

		if( loginForm.newuser.checked ){

			sURL =	"http://cgi.muslim-web.com/cgi-bin/newuser.pl?" +
					"user=" + encodeURI( loginForm.lname.value ) + 
					"&password=" + encodeURI( loginForm.pw.value ) +
					"&email="+ encodeURI( loginForm.email.value ) +
					"&mem="  + (loginForm.keepdata.checked?getCookie("mem",""):"") +
					"&memb=" + (loginForm.keepdata.checked?getCookie("memb",""):"");

			LoadData( sURL, "IMember.onNewUserResponse( gDataResponse )" );

		}
		else{
			sURL = "http://cgi.muslim-web.com/cgi-bin/login.pl?v=2&" + 
					"user=" + encodeURI( loginForm.lname.value ) + 
					"&password=" + encodeURI( loginForm.pw.value ) + 
					"&t=" + (new Date()).getTime().toString();


			LoadData( sURL, "IMember.onLoginResponse( gDataResponse )" );
		}
		
		return false;
	},

	onLoginResponse:function(data)
	{
		DU.hide( "LoginProgress" );
		this.closePopup();

		var xmlInfo = LoadXMLDoc(data, "*");
		if (xmlInfo.getAttribute("success") == "1")
		{
			var sError = onLoadTahfeez(data);
			
			if( sError && sError.length ){
				alert( sError );
				IMember.showLoginForm();
			}
			else{
				Memorization.updateIndex();
			}
		}
		else{
			alert( xmlInfo.getAttribute("error") );
		}

		this.updateUI();
	},

	onNewUserResponse:function(data)
	{
		DU.hide( "LoginProgress" );

		var xmlInfo = LoadXMLDoc(data, "*");
		
		if (xmlInfo.getAttribute("success") == "1")
		{
			document.cookie = "sync=0";
			setCookie("id", xmlInfo.getAttribute("id"));
			setCookie("user", gUserID = xmlInfo.getAttribute("login_id"));
			
			LoadTahfeez( "Memorization.updateIndex()" );
			this.closePopup();
			this.updateUI();
		}
		else{
			alert( xmlInfo.getAttribute("error") );
		}

	},
	showGuestInfo:function(){
		//_E("idCurrentUserName").innerHTML = _S.login_form;
		_E("UserInfoPanel").innerHTML = "<span class='href' onclick='IMember.showUI()'>" + _S.login_form + "</span>";
	},
	showUserInfo:function(){
		gUserID  = getCookie("user","");
		_E("UserInfoPanel").innerHTML = _S.welcome + " " + gUserID + 
				" | " + "<span class='href' onclick='IMember.confirmUpdate()'>" + _S.update_mem + "</span>" +
				" | " + "<span class='href' onclick='IMember.logout()'>" + _S.logout + "</span>";
	},

	showLoginForm:function(){
		var popup = this.openPopup(this.loginPanel);
		DU.removeChildren( popup );
		popup.appendChild( this.loginPanel );
		_E("idLoginForm").lname.focus();

		var loginForm = document.forms["idLoginForm"];
		if(!loginForm){
			return;
		}
		loginForm.newuser.checked = false;
		this.toggleNewUser(false);
	},

	showNewUserForm:function(){
		this.showLoginForm();
		document.forms["idLoginForm"].newuser.checked = true;
		document.forms["idLoginForm"].lname.value = document.forms["idLoginForm"].pw.value = "";
		this.toggleNewUser(true);
	},
	
	onCancelLogin:function(){
		this.closePopup();
		this.updateUI();
	},

	toggleNewUser:function( bCheckValue )
	{
		var loginForm = document.forms["idLoginForm"];

		_E("idEmail").style.display = bCheckValue ? "":"none";
		_E("idBtnLogin").value = bCheckValue ? _S.register : _S.login;
	}
};

var ISura = {
	showRecent:function(){
		var	lastSuras = readCookie("r_suras", "");
		//populate recent suras
		if( lastSuras.length > 0 )
		{
			var recentSuraList = lastSuras.split(",");

			if(recentSuraList.length>0){
				var sRecentSuraList = "";
				
				for (i=0; i<recentSuraList.length; i++){
					if(recentSuraList[i].length){
						sRecentSuraList += 
							"<option value=" + recentSuraList[i] + ">" + 
								recentSuraList[i] + " " + gStrings.sura_names[ parseInt(recentSuraList[i],10) - 1 ] + 
							"</option>";
					}
				}
				
				_E("idRecentSuras").innerHTML = 
					"<select id='idRecentSurasList'>" + 
						"<option>" + _S.recently_played + "..." + "</option>" + 
						sRecentSuraList + 
					"</select>";
				
				_E("idRecentSurasList").onchange = function(e)
				{
					var suraNum = parseInt(this.value,10);
					QViewer.gotoSura(suraNum);
					U.pushToCookieArray("r_suras", suraNum, 10);
					window.setTimeout(ISura.showRecent.bind(ISura),1);
					QViewer.focus();
					// AudioPlayer.stop();
					// AudioPlayer.loadRange(0,{sura:suraNum});
				};
				
				return parseInt(recentSuraList[0],10);
			}
		}
		
		return 1;//
	},

	reciteRandom:function(){
		while( true ){
			var nSura = Math.floor( 112 * Math.random() );
			if( IReciters.audioAvailable(nSura) ) {
				QViewer.gotoSura( nSura + 1 );
				this.recite( nSura );
				break;
			}
		}
	},
	
	reciteByVerse:function(nSura){
		if(nSura == undefined){
			nSura = QViewer.currSuraNum - 1;
		}
		var suraNum = nSura + 1;

		if( !AudioPlayer.playRange(1, {sura:ToInt(suraNum),aya:1}, { sura:ToInt(suraNum), aya:QData.sura_info[nSura] }) ){
			this.recite(nSura);
		}
	},

	recite:function(nSura){//TODO: use processString()
		if(nSura == undefined){
			nSura = QViewer.currSuraNum - 1;
		}
		var selReciter = IReciters.activeReciter;
		var suraNum = nSura + 1;
		
		if( RecitersInfo[selReciter].suraAudio 
			&& AudioServers[RecitersInfo[selReciter].suraAudio.server].cross_domains == true ) {
			if(	AudioPlayer.playRange( 0, {sura:suraNum, aya:1} ) ){
				this.pushToRecent(suraNum);
				return;
			}
		}

		AudioPlayer.stop(true);
		
		//Fallback to Real Player popup
		var url = GetAudioURL(selReciter, suraNum);
		openReciter( url, suraNum , selReciter);
		
		return 1;
	},

	pushToRecent:function(suraNum){
		U.pushToCookieArray("r_suras", suraNum, 20);
		this.showRecent();
	},

	openText:function(suraNum){
		if( suraNum >=1 && suraNum <= 114 ){
			window.location.href = "sura/?s=" + suraNum;
		}
	}
};

function onChangeView(tid){
	switch(tid){
		case "exercise":
			QViewer.cancelReviewMode();
			MemAppUI.onFocus();
			break;
		case "pages":
			QViewer.gotoPage();
			break;
		case "mem":
			IMemReport.generate(_E("MemReport"));
	}

	setCookie("dvw",tid);
	PageLayout.update();
}

var IMemReport = {
	generate:function( eRoot ){
		var sHTML = "";
		var sPendData = GetPendingInfo();
		var aPendData = sPendData.split("$");
		var sMemData = GetMemorizedInfo();
		var aMemData = sMemData.split("$");
		for( var suraNum=1; suraNum<=114; suraNum++ ){
			var totalAyat = QData.sura_info[suraNum-1].ac;
			var sSuraData = aMemData[suraNum];
			var sSuraPendData = aPendData[suraNum];
			if( sSuraData.length || sSuraPendData.length ){
				var aSuraData = ParseIntArray( sSuraData.split("|") );
				if( aSuraData.length != totalAyat ){// partial sura memorized
					sHTML +="<div class='mem_report_line'>" + 
								"<span class='part_mem' onclick='QViewer.gotoSura(" + suraNum + ")'>" + 
									_S.sura_names[suraNum-1] + 
								"</span>" + 
								"<span class='mem_chart'>" + SuraMemChart(suraNum, sMemData) + "</span>" + 
							"</div>";
				}else{
					sHTML += "<span class='full_mem' onclick='QViewer.gotoSura(" + suraNum + ")'>" + _S.sura_names[suraNum-1] + "</span>";
				}
			}
		}
		if(sHTML.length){
			eRoot.innerHTML = sHTML;

			var chartList = getElementsByAttribute(eRoot, "state");
			for( var i=0; i<chartList.length; i++ ){
				chartList[i].onclick=function(e){
					QViewer.gotoAya( ToInt( this.getAttribute("startAya") - 1 ) , ToInt( this.getAttribute("sura") - 1 ), 2 );
				};
				chartList[i].oncontextmenu=function(e){
					var event = U.ieEvent(e);
					event.preventDefault();
					var info = {
						sura:ToInt(this.getAttribute("sura")),
						aya:ToInt(this.getAttribute("startAya")),
						endAya:ToInt(this.getAttribute("endAya"))
					};
					var menu = createMenu( 
						GetRangeContextMenu( info )
					);
					menu.attach(document.body, 
						"mouse", 				{
							x: event.clientX, 
							y: event.clientY
						}
					);
				}
			}
		}else{
			eRoot.innerHTML = _S.no_memorization;
		}

	}
};