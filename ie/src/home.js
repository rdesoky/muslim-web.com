try{ onLoadScriptFile(); } catch(e){};

var gMemPercent;
var gUserID;
var gPageSpin;

function InitPage()
{
	if( document.domain != "quran.muslim-web.com" ){
		HideElement("AlterBookmarks");
	}

	//HideElement( "idProgress" );
	WaitingMsg.innerHTML = "<div style='color:gray'>تحميل الأيقونات .. </div>";//WriteSuraCells();

	JClassInit( [idProgress,ImageLoader] );
	window.setTimeout( "ImageLoader.download()", 1 );

	return;
}

function GetIndex()
{
	WaitingMsg.innerHTML = "<div style='color:green'>إنشاء الفهرس .. </div>";//WriteSuraCells();
	window.setTimeout("ShowIndex()",1);
}

function AddFav1(){
	window.external.addFavorite('http://www.muslim-web.com','www.muslim-web.com - القرآن الكريم - 1');
}
function AddFav2(){
	window.external.addFavorite('http://www2.muslim-web.com','www2.muslim-web.com - القرآن الكريم - 2');
}

function InsertListFilters()
{
	if( ListFilters.bDone ){
		return;
	}

	var ArabicAlpha = ['ا','ز','ع','س','ط','ه','م'];
	var sKeys = "<span mClass=JCFilterBtn mList=idReciterList></span>&nbsp;";

	for(var i=0; i< ArabicAlpha.length; i++){
		sKeys += "<span mClass=JCFilterBtn mKey='" + ArabicAlpha[i] + "' mList=idReciterList></span>&nbsp;";
	}
	ListFilters.innerHTML = sKeys;
	ListFilters.bDone = true;
	InitDocObjects(ListFilters);
}

function ConfirmEditMemorization( suraIndex )
{
	var currPercent = gMemPercent[suraIndex];
	if( currPercent > 0 && currPercent < 100 ){
		if( !window.confirm("سيتم تعديل بيانات التحفيظ الحالية لهذه السورة\nهل أنت متأكد؟.") )
			return false;
	}

	return true;
}

function onClickMemSura( suraCell )
{
	if( !ConfirmEditMemorization( suraCell.nIndex - 1 ) ){
		return;
	}
	memorizeSuraNo( suraCell.nIndex );
	gMemPercent = AllSuraMemPercent();
	UpdateMemPercentages();
	suraCell.updateMemPercent();
	//suraCell.onmouseout();
}

function onClickUnMemSura( suraCell )
{
	if( !ConfirmEditMemorization( suraCell.nIndex - 1 ) ){
		return;
	}
	unMemorizeSura( suraCell.nIndex );
	gMemPercent = AllSuraMemPercent();
	UpdateMemPercentages();
	suraCell.updateMemPercent();
	//suraCell.onmouseout();
}

function ShowIndex()
{
	gMemPercent = AllSuraMemPercent();

	GetData("qindex.html","onLoadIndex(gTextResponse)", 1);

	InitDocObjects( LeftMenu );
	InitDocObjects(FooterAds);

	new CKeyboard("idSearchText", arabic_keys, "SearchForm.submit()");
	
	gUserID = getCookie("user");

	if (gUserID.length)
		ShowUserInfo();
	else
		ShowUserLogin();

	gClickListen = false;
	
	//QueryToCookies();// for site migration

	LoadTahfeez("UpdateIndexMemorization()");	

	//LoadRecitersList(idReciter);
	FillReciters();
	
	ShowFavoriteReciters();
	ShowPageMarks();

	//window.setTimeout( "UpdateSaveURLs()", 500 );

	window.setTimeout("idKoboolAd.style.visibility='hidden'", 4000);
	window.setTimeout("idKoboolAd.style.visibility='visible'", 4500);
	window.setTimeout("idKoboolAd.style.visibility='hidden'", 5000);
	window.setTimeout("idKoboolAd.style.visibility='visible'", 5500);

	UpdateMemPercentages();

	idSelectVerticalIndex.selectedIndex = parseInt( getCookie("vi","0") );

	gPageSpin =	new McDhtmlSpin(1, 604, 1, null);

	idPageSpin.innerHTML = "<div align=left>ص: " + gPageSpin + "</div><div><input class=PageButton style='width:64px' type=button value='اعرض الصفحة' onclick='gotoPage(gPageSpin.getValue())'></div>";

	//window.setTimeout( "RotateAd()", 10 );

	UpdateResolution();	

}

function UpdateMemPercentages()
{
	var memPercent = quranMemPercent();
	idMemorized.innerHTML = "&nbsp;( " + memPercent.toString(10) + "% ) ";
	idMemChart.style.width = memPercent.toString(10) + "%";
}

function FillReciters()
{
	var sHTML = "";

	for( var index=0; index < gReciterNames.length; index++ ){
		sHTML += "<div mClass=JCMenuItem onclick='onSelectReciter(" + index + ")'>" + gReciterNames[index] + "</div>";
	}

	idReciterList.innerHTML = sHTML;

	InitDocObjects(idReciterList);
}

function onLoadIndex( sHTML )
{
	idQuranIndex.innerHTML = sHTML;
	InitDocObjects(idQuranIndex);
	//window.setTimeout( "UpdateIndexMemorization()", 10 );
}

function ToggleResolution()
{
	setCookie( "hr", gHighResolution ? "0" : "1" ); 
	UpdateResolution();

	SetPage(idPageViews.active_page,idPageViews.page_number);
}

function onChangeVerticalIndex()
{
	idVerticalIndex.focus();
	
	showVerticalIndex( idSelectVerticalIndex.selectedIndex );

	setCookie( "vi", idSelectVerticalIndex.selectedIndex ); 

}

function showVerticalIndex( index )
{
	if( index == -1 ){
		index = getCookie( "vi", "0" );
	}

	index = parseInt(index,10);

	if( idVerticalIndex.selectedIndex == index ){
		return;
	}

	switch( index )
	{
		case 0:
			idVerticalIndex.innerHTML = GetShaptersIndex();
			break;
		case 1:
			idVerticalIndex.innerHTML = GetSuraIndex();
			break;
		case 2:
			idVerticalIndex.innerHTML = GetSortedSuraIndex();
	}

	idVerticalIndex.selectedIndex = index;
}

function GetSuraIndex()
{
	var sRetValue = "";

	for( var i=1; i< 115; i++)
	{
		sRetValue += "<div id=idSura_" + i.toString() + " style='cursor:hand' onclick='gotoPage(" + gSuraPages[i-1] + ")' title='" + i.toString() + "' onmouseout=\"this.style.background=''\" onmouseover=\"this.style.background='white'\">" + gSuraNames[i] + "</div>";
	}
	return sRetValue;
}

function GetSortedSuraIndex()
{
	var sRetValue = "";

	for( var i=1; i< 115; i++)
	{
		var nSuraIndex = gSortedSura[i-1];

		sRetValue += "<div id=idSura_" + nSuraIndex.toString() + " style='cursor:hand' onclick='gotoPage(" + gSuraPages[nSuraIndex-1] + ")' title='" + nSuraIndex.toString() + "' onmouseout=\"this.style.background=''\" onmouseover=\"this.style.background='white'\">" + 
				gSuraNames[nSuraIndex] + "</div>";
	}
	return sRetValue;
}

function GetShaptersIndex()
{
	var sRetValue = "";

	for( var i =0; i< (gParts.length/3); i++){
		var offset = i * 3;
		var ordinal = (i+1).toString();
		sRetValue += "<div id=idChapter_" + i.toString() + " style='cursor:hand' onclick='javascript:gotoPage(" + gParts[offset+2].toString() + ")' title='" + gSuraNames[gParts[offset]] + "-آية:" + gParts[offset+1] + "' onmouseout=\"this.style.background=''\" onmouseover=\"this.style.background='white'\">" + 
					"جزء: " + ordinal + "</div>";
	}
	return sRetValue;
}

function Logout()
{
	if( false == confirm("Are you sure?") )
		return false;

	setCookie("user", ""); 
	setCookie("id", ""); 
	setCookie("mem", ""); 
	setCookie("memb", ""); 
	ShowUserLogin();
	LoginPanelSwitcher.doHide();
	UpdateIndexMemorization();
	return true;
	//window.location.href="/";
}

function ShowNewUser(bExpand)
{
	ShowUserLogin(bExpand);
	idLoginForm.newuser.checked = true;
	toggleNewUser(true);
}

function ShowUserLogin(bExpand)
{
	HideElement("CurrentUserInfo");
	ShowElement("LoginPanel");
	if(bExpand){
		LoginPanelSwitcher.doShow();
	}
	idLoginForm.newuser.checked = false;
	toggleNewUser(false);
	idLoginForm.idCancelLogin.style.display = gUserID ? "" : "none";
}

function ShowUserInfo()
{
	gUserID  = getCookie("user");
	CurrentUserName.innerHTML = gUserID;
	ShowElement("CurrentUserInfo");
	UserInfoSwitcher.doHide();
	HideElement("LoginPanel");
}


function toggleNewUser( bCheckValue )
{
	idEmail.style.display = bCheckValue ? "":"none";
	idLoginForm.idBtnLogin.value = bCheckValue ? "تسجيل":"دخول";
}

function onLoginSubmit(loginForm)
{
	if (loginForm.lname.value.length == 0)
	{
		alert("please enter user name");
		loginForm.lname.focus();
		return false;
	}

	if (loginForm.pw.value.length == 0)
	{
		alert("please enter password");
		loginForm.pw.focus();
		return false;
	}
	
	var sURL ;

	if (loginForm.newuser.checked)
	{
		sURL =	"http://cgi.muslim-web.com/cgi-bin/newuser.pl?" +
				"user=" + encodeURI( loginForm.lname.value ) + 
				"&password=" + encodeURI( loginForm.pw.value ) +
				"&email="+ encodeURI( loginForm.email.value ) +
				"&mem="  + (loginForm.keepdata.checked?getCookie("mem"):"") +
				"&memb=" + (loginForm.keepdata.checked?getCookie("memb"):"");

		//document.body.startDownload( sURL, onNewUserResponse);
		LoadData( sURL, "onNewUserResponse( gDataResponse )" );

	}
	else
	{
		sURL = "http://cgi.muslim-web.com/cgi-bin/login.pl?v=2&" + 
				"user=" + encodeURI( loginForm.lname.value ) + 
				"&password=" + encodeURI( loginForm.pw.value );


		//document.body.startDownload( sURL, onLoginResponse);
		LoadData( sURL, "onLoginResponse( gDataResponse )" );
	}
	
	ShowElement( "LoginProgress" );

	return false;
}

function onNewUserResponse(data)
{
	HideElement( "LoginProgress" );

	var xmlInfo = LoadXMLDoc(data, "/*");
	
	if (xmlInfo.getAttribute("success") == "1")
	{
		document.cookie = "sync=0";
		setCookie("id", xmlInfo.getAttribute("id"));
		setCookie("user", gUserID = xmlInfo.getAttribute("login_id"));
		
		LoadTahfeez( "UpdateIndexMemorization()" );
		ShowUserInfo();
		openControlPanel();
	}
	else
	{
		alert( xmlInfo.getAttribute("error") );
		ShowNewUser();
	}
}

function onLoginResponse(data)
{
	HideElement( "LoginProgress" );

	var xmlInfo = LoadXMLDoc(data, "/*");
	//alert(xmlInfo.xml);
	if (xmlInfo.getAttribute("success") == "1")
	{
		var sError = onLoadTahfeez(data);
		
		if( sError && sError.length ){
			alert( sError );
			ShowUserLogin();
		}
		else{
			ShowUserInfo();
			UpdateIndexMemorization();
		}
	}
	else{
		alert( xmlInfo.getAttribute("error") );
		ShowUserLogin();
	}
}

function ShowPageMarks()
{	
	var	pageMarks = readCookie("pgm", "");

	idBtnPageMark.value = "ضع علامة";

	if( pageMarks.length > 0 )
	{
		pageMarks = pageMarks.split(",");

		var nActivePage = idPageViews.page_number;
		var sRecentList = "";
	
		for (i=0; i<pageMarks.length; i++)
		{
			var nPageNo = parseInt( pageMarks[i] );

			if( nPageNo == nActivePage ){
				idBtnPageMark.value = "حذف العلامة";
			}

			var nSura = getSuraByPage( nPageNo );

			if(pageMarks[i].length){
				sRecentList += "<option value=" + pageMarks[i] + ">صفحة: " + pageMarks[i] + " : " + gSuraNames[ nSura ] + "</option>";
			}
		}

		if (sRecentList.length > 0){
			idPageMarks.innerHTML = "<select style='width:120px' onchange='onSelectPageMark(this.value);this.selectedIndex=0;FocusPage();'><option>علامات الصفحات ...</option>" + sRecentList + "</select>";
		}
	}
}

function FocusPage()
{
	window.setTimeout("doFocusPage()",100);
}
function doFocusPage()
{
	var curr_side = ( idPageViews.page_number % 2 ) ? 0 : 1;
	
	try{
		idPageViewFrame[curr_side].focus();
	}catch(e){
		FocusPage();
	}
}

function onSelectPageMark( nPage )
{
	ReciterListToggler.doHide();
	nPage=parseInt( nPage );
	ShowPages( -1 );
	gotoPage(nPage);
	PushToPageMarks( nPage );
	ShowPageMarks();
}

function TogglePageMark()
{
	var nPageNo = idPageViews.page_number;

	if( PageMarkFound( nPageNo ) )
	{
		var	pageMarks = readCookie("pgm", "").split(",");
		for( var i=0;i<pageMarks.length;i++)
		{// remove it from the list 
			if(pageMarks[i] == nPageNo)
			{
				pageMarks = DeleteArrayElements( pageMarks, i, 1 );
				i--;
			}
		}
		writeCookie("pgm", pageMarks.join(","));
	}
	else
	{
		PushToPageMarks( gPageSpin.getValue() );
	}
}

function PageMarkFound( nPageNo )
{
	var	pageMarks = readCookie("pgm", "").split(",");

	for( var i=0;i<pageMarks.length;i++)
	{// search for it in the list 
		if(pageMarks[i] == nPageNo)	{
			return true;
		}
	}

	return false;
}

function PushToPageMarks( nPage )
{
	if(!nPage){
		nPage = gPageSpin.getValue();
	}

	var	pageMarks = readCookie("pgm", "").split(",");

	for( var i=0;i<pageMarks.length;i++)
	{// remove it from the list 
		if(pageMarks[i] == nPage)
		{
			pageMarks = DeleteArrayElements( pageMarks, i, 1 );
			i--;
		}
	}

	pageMarks.length = 15;
	writeCookie("pgm", nPage.toString(10) + "," + pageMarks.join(","));
}


function ShowFavoriteReciters()
{
	//idRecitersList.innerHTML = GetRecitersList();

	var	lastReciter = readCookie("reciter", "");

	if( lastReciter.length > 0 )
	{
		var recentList = lastReciter.split(",");
		
		if( recentList.length ){
			SelectReciter( recentList[0] );
		}

		var sRecentReciters = "";
	
		for (i=0; i<recentList.length; i++){
			if(recentList[i].length){
				sRecentReciters += "<option value=" + i + ">" + gReciterNames[ parseInt(recentList[i],10) ] + "</option>";
			}
		}

		if( sRecentReciters.length > 0 ){
			idRecentReciters.innerHTML = "<select style='width:140px' onchange='onSelectRecentReciter(this.value);this.selectedIndex=0;'><option>آخر القراء استماعا ...</option>" + sRecentReciters + "</select>";
		}
	}
	else
	{
		SelectReciter(19);
	}

	var	lastSuras = readCookie("r_suras", "");

	if( lastSuras.length > 0 )
	{
		var recentList = lastSuras.split(",");

		var sRecentList = "";
	
		for (i=0; i<recentList.length; i++){
			if(recentList[i].length){
				sRecentList += "<option value=" + recentList[i] + ">" + recentList[i] + " " + gSuraNames[ parseInt(recentList[i],10) ] + "</option>";
			}
		}

		if (sRecentList.length > 0){
			idRecentSuras.innerHTML = "<select style='width:120px' onchange='onSelectRecentSura(this.value);this.selectedIndex=0;FocusPage();'><option>آخر السور استماعا ...</option>" + sRecentList + "</select>";
		}
	}
}

function onSelectRecentSura(index)
{
	ReciterListToggler.doHide();
	ShowPages(index);
}

function AddSelectedReciterToFav()
{
	SaveCurrentReciter(idReciter.selectedIndex);
	ShowFavoriteReciters()
}

function NumToString (numValue, digits)
{
	var retValue = numValue.toString (10);

	while (retValue.length < digits){
		retValue = "0" + retValue;
	}

	return retValue;
}

function openSura(index)
{
	if (index >=1 && index <= 114 ){
		window.open ( "/sura.htm?aya=" + NumToString (index, 3) , "_top");
	}
}

function reciteSura( index )
{
	var url;

	index = parseInt(index,10) + 1;

	url = idReciter.value.replace ("%1%", index.toString(10) );
	url = url.replace ("%2%", NumToString(index,3) );


	openReciter (url, index, idReciter.selectedIndex);
	
	//window.setTimeout( "ShowPages(" + index + ");", 1000 );

	return 1;
}

function GetSaveURL(index)
{
	var url;

	var nIndex = parseInt(index, 10) + 1;

	url = idReciter.value.replace( "%1%", nIndex.toString(10) );
	url = url.replace ( "%2%", NumToString(nIndex,3) );

	//url = url.replace ( ".ram" , ".rm" );
	//url = url.replace ( "audio", "http://audio.islamweb.net/quran" );
	return url;
}

var gTimeoutHandle = 0;

function onSelectReciter( nID )
{
	SelectReciter( nID );
	ReciterListToggler.doHide();
	document.body.scrollTop = 0;
}

//function changeReciter()
function SelectReciter( nID )
{
	idReciter.innerHTML = gReciterNames[nID];
	idReciter.selectedIndex = nID;
	idReciter.value = reciterLinks[nID];

	window.setTimeout ( "UpdateSaveURLs()",500 );

	if( document.getElementById("idPageViewAudio") )
	{
		var nSuraIndex = idPageViews.sura_number - 1;

		if( reciterSuras[idReciter.selectedIndex].substring(nSuraIndex,nSuraIndex+1) == "1" ) 
			idPageViewAudio.style.visibility = "visible";
		else
			idPageViewAudio.style.visibility = "hidden";
	}

}

function onSelectRecentReciter(index)
{

	var	lastReciter = readCookie("reciter");
	
	var lastReciterList = lastReciter.split(",");
	
	SelectReciter( lastReciterList[index] );

	ReciterListToggler.doHide();


	//SaveCurrentReciter( idReciter.selectedIndex );
	//ShowFavoriteReciters();

	//changeReciter();
}

function UpdateSaveURLs()
{
	var sReciterMap = reciterSuras[idReciter.selectedIndex];
	
	for (var i=1; i<=114; i++){
		var suraCell = document.getElementById( "SuraCell" + i.toString(10) );
		if(suraCell){
			suraCell.style.color = sReciterMap.substring( i-1, i  ) == "1" ? "" : "red";
		}
	}
}

function UpdateIndexMemorization()
{
	gMemPercent = AllSuraMemPercent(true);

	for (var i=1; i<=114; i++)
	{
		var suraCell = document.getElementById( "SuraCell" + i.toString(10) );
		if(suraCell){
			suraCell.updateMemPercent();
		}
	}
}

function openSearch()
{
	var myWindow = window.open("search.htm", "search","scrollbars=yes,resizable=yes,menubar=yes,width=624,height=300");
	myWindow.focus();
}

function openTrainer(nSura)
{
	var suraParam = nSura ? "?s=" + nSura : "";
	var myWindow = window.open("exercise.htm" + suraParam, "trainer","scrollbars=yes,resizable=yes,menubar=yes,toolbar=no,location=no,width=600,height=500");
	myWindow.focus();
}

function ShowPages(nSuraNo)
{
	idBtnShowPages.className = "ActivePageButton";
	idBtnShowIndex.className = "PageButton";

	HideElement("idQuranIndex");
	HideElement("idHeader");
	ShowElement("idHeader2");

	if(nSuraNo == -1)
	{
		if(idPageViews.page_number){
			FocusPage();
			ShowElement("idPageViews");
			return;
		}

		nSuraNo = idPageViews.sura_number;
	}

	showVerticalIndex(-1);

	UpdatePageButtons(nSuraNo);
	
	gotoPage( gSuraPages[nSuraNo-1] );

	FocusPage();

	//document.location.replace("#top");
	document.body.scrollTop = 0;

}

function ShowPage(nPageNo){// dummy to prevent script error
}

function gotoPage(nPageNo)
{
	DisplayPage(nPageNo, 1);
}

function UpdatePageButtons(nSuraNo)
{
	var nSuraIndex = nSuraNo - 1;
	idPageViews.style.background = sura_type[nSuraIndex] == 0 ? "#cedede":"#efefe7";
	idPageViews.sura_number = nSuraNo;
	

	if( reciterSuras[idReciter.selectedIndex].substring(nSuraIndex,nSuraIndex+1) == "1" )
		sDisplayAudio = "visible";
	else
		sDisplayAudio = "hidden";

	var sAudio = "<div id=idPageViewAudio align=center style='visibility:" + sDisplayAudio + ";padding:5px'><img id=idSpeakerIMG src='images/speaker.gif' onmouseover=\"this.src='images/listen.gif'\" onmouseout=\"this.src='images/speaker.gif'\" border=0 width=16 height=15 title='اضغط هنا لسماع التلاوة' " +
			" onclick=\"reciteSura('" + nSuraIndex + "')\" >&nbsp;" + 
			"<a href='#' onmouseover='this.href=GetSaveURL(" + nSuraIndex + ")' >" + 
			"<img src=images/disk.gif onmouseover=\"this.src='images/save.gif'\" onmouseout=\"this.src='images/disk.gif'\" id=idSaveIMG border=0 width=16 height=15 title='اضغط هنا بزر الماوس الأيمن و اختر Save Target As' ></a></div>";

	idPages.innerHTML = "<div >" + 
							"<table width=64 cellspacing=0><tr>" +
								"<td style='cursor:hand' onclick='PrevSura()' width=50%><img src=images/prev.gif ></td>" + 
								"<td NOWRAP align=center id=idSuraNo>" + nSuraNo + "</td>" +
								"<td style='cursor:hand' onclick='NextSura()' width=50% align=left><img src=images/next.gif></td>" + 
							"</tr></table>" +
							"<div align=center>" + 
								"<a href='javascript:openSura(" + nSuraNo + ")'>" + gSuraNames[nSuraNo] + "</a>" + 
							"</div>" + 
						"</div>" + sAudio +
						"<div>" + GetPagesButtons( nSuraNo, "<br>" ) + "</div>";
}

function HidePage()
{
}

function NextSura()
{
	var nCurrSura = parseInt(idSuraNo.innerHTML, 10);
	if(nCurrSura >= 114)
		return;

	UpdatePageButtons(nCurrSura + 1);
	gotoPage(gSuraPages[nCurrSura]);
}

function PrevSura()
{
	var nCurrSura = parseInt(idSuraNo.innerHTML, 10);
	if(nCurrSura <= 1)
		return;
	UpdatePageButtons(nCurrSura -1);
	gotoPage(gSuraPages[nCurrSura - 2]);
}

function GetPageButton(i)
{
	var sPageNo = i.toString(10);
	return "<input id=idPageBtn" + sPageNo + " class=PageButton style='width:31px' type=button onmouseover=\"this.style.backgroundColor='yellow';\" " + 
	"onmouseout=\"this.style.backgroundColor=''\" onclick='gotoPage(" + sPageNo + ")' value='" + sPageNo + "'><span style='width:1px'></span>";
}
function GetDummyPageButton()
{
	return "<input class=PageButton style='width:31px' type=button disabled=1><span style='width:1px'></span>";
}

function ClosePageView()
{
	idBtnShowPages.className = "PageButton";
	idBtnShowIndex.className = "ActivePageButton";

	HideElement("idPageViews");
	ShowElement("idQuranIndex");
}

var gMouseOffsetX, gCapture, gShiftX;

function StartDrag(nPageSide)
{
	var sElement = event.srcElement;
	if(! sElement )
		return;

	gotoSide(nPageSide);

	gShiftX = 0;
	gMouseOffsetX = event.x;
	
	sElement.setCapture();
	gCapture = true;
}

function Drag(nPageSide)
{
	if( gCapture == false)
		return;
		
	//idDebug.innerHTML = event.srcElement.id + ":" + event.x;

	gShiftX = event.x - gMouseOffsetX;

	idPageView[nPageSide].width = gPageWidth;

	if(nPageSide==0 && gShiftX < 0)
		idPageView[nPageSide].width += gShiftX;
	if(nPageSide==1 && gShiftX > 0)
		idPageView[nPageSide].width -= gShiftX;
}

function EndDrag(nPageSide)
{
	var sElement = event.srcElement;
	document.releaseCapture();

	gCapture = false;

	idPageView[nPageSide].width = gPageWidth;

	if(nPageSide == 0 && gShiftX < -5){
		PrevPage();
		window.setTimeout("gotoSide(0);gotoSide(1)", 1);
	}

	if(nPageSide == 1 && gShiftX > 5){
		NextPage();
		window.setTimeout("gotoSide(1);gotoSide(0)", 1);
	}
}

function SyncPageView(nSura, nPos, nLength)
{
	return;
	//if( nSura != idPageViews.sura_number )
	//{
	//	ShowPages(nSura);
	//	return;
	//}

	var startPage = gSuraPages[nSura-1];
	var endPage   = gSuraEndPages[nSura-1];
	var totalPages = endPage - startPage + 1 ;
	var curr_page = startPage + Math.floor ( (nPos/nLength) * totalPages );
	idDebug.innerHTML = "pos:" + nPos + ", length:" + nLength + ", total pages:" + totalPages;
	gotoPage( curr_page );
}


function doSearch( nPage )
{
	ShowElement( "idResults" );
	HideElement( "idSearchText_keyboard" );

	var sSearchText = SearchForm.idSearchText.value;
	sSearchText = ConvertUnicodeToCP1256(sSearchText);

	var sCgiUrl = "http://cgi.muslim-web.com/cgi-bin/search.pl?s=" + escape(sSearchText) + "&p=" + nPage;

	idStatus.innerHTML = "جاري البحث, من فضلك الإنتظار ... " + "<img src=images/loading.gif style='position:absolute'>";

	LoadData( sCgiUrl, "DisplaySearchResults( XMLDoc(gDataResponse) )" );

	return false;
}

function DisplaySearchResults( xmlDoc )
{
	var sHTML = "";

	var xmlRoot = xmlDoc.selectSingleNode("/*");
	var xmlRecords = xmlRoot.childNodes;
	
	if( 0 == xmlRecords.length )
	{
		idResults.innerHTML = "لم يعثر على آيات تحتوي علي: "+ " <b>" + xmlRoot.getAttribute("search_text") + "</b>";
		return;
	}

	sHTML  = "عبارة '<b>" + xmlRoot.getAttribute("search_text") + "</b>' عثر عليها في (<b>"+ 
		xmlRoot.getAttribute("total") + 
		"</b>) آية";
	sHTML  += "<div id=idStatus style='padding:4px;font-size:10px;color:gray'></div>";

	var sNavigator  = "<div align=center style='padding:4px' style='border-top:solid 1px silver' >" + 
				GetResultsNavigator(xmlRoot.getAttribute("total"), 
									parseInt( xmlRoot.getAttribute("page_size") ), 
									parseInt( xmlRoot.getAttribute("page"     ) ), 
									1, 
									"doSearch(%p%)", 
									false ) + 
			"</div>" ;

	sHTML  += sNavigator + "<table width=99% cellspacing=0 cellpadding=3>";

	for( var i=0; i<xmlRecords.length ; i++ )
	{

		var xmlRecord = xmlRecords.item(i);
		var nSura = parseInt( xmlRecord.getAttribute("sura_num") ) + 1;
		var nAya = parseInt( xmlRecord.getAttribute("aya_num") ) + 1;
		var nPage = parseInt( xmlRecord.getAttribute("page") ) + 1;

		if( i==0 ){
			ShowPages(-1);
			gotoPage(nPage);
		}

		var sHREF = "<a href='javascript:gotoPage(" + nPage + ")' onmouseover='displayAya(" + nSura + "," + nAya + ")' onmouseout='hideAya()'>";

		sHTML += "<tr><td NOWRAP style='border-top:solid 1px silver' valign=top align=left>" + sHREF +
					"<b>" + gSuraNames[ nSura ] + "</b>&nbsp;( آية:" + nAya + ") </a>:</td><td width=100% style='border-top:solid 1px silver'>" + 
					sHREF + ConvertCP1256ToUnicode( xmlRecord.getAttribute("aya_plain_text") ) + "</td></tr>";
	}
	sHTML  += "</table>&nbsp;" + sNavigator;

	idResults.innerHTML = sHTML;
}

function displayAya()
{
}

function hideAya()
{
}

function UpdateSuraMem( nSura )
{
	gMemPercent=AllSuraMemPercent(true);
	UpdateMemPercentages();

	var sura_cell = document.getElementById( "SuraCell" + nSura );
	if(sura_cell){
		sura_cell.updateMemPercent();
	}
}

function OnIndexMouseOut()
{
	//if( gActiveSuraMenu ){
	//	gActiveSuraMenu.hideMenu();
	//}
}

function toggleView()
{
	if(idBtnShowIndex.className == "ActivePageButton"){
		ShowPages(-1);
	}else{
		ClosePageView();
	}
}

function OnPageKeyPress()
{
	switch(event.keyCode)
	{
		case 36://home
			if(event.ctrlKey)
				ShowPages( 1 );
			else{
				PrevSura();
				NextSura();
			}
			break;
		case 35://end
			if(event.ctrlKey)
				ShowPages( 114 );
			else{
				NextSura();
				PrevPage();
			}
			break;
		case 32://space
		case 34://page down
		case 37://left
		case 40://down
			if(event.ctrlKey)
				NextSura();
			else
				NextPage();
			break;

		case 33://PgUp
		case 38://Up
		case 39://right
			if(event.ctrlKey)
				PrevSura();
			else
				PrevPage();
			break;
		case 27://ESC
			ClosePageView();
			break;
		default:
			//alert(event.keyCode);
			return true;
	}
	FocusPage();
	return false;
}