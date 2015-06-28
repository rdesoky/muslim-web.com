var gRevMode = false, gRevStart=0, gFirstRevAlert = true;

String.prototype.trim = function(){
	return this.replace(/(^\s*)|(\s*$)/g, "");
};

function ToggleRevMode(bRevMode, nStartAya)
{
	RemoveSelection();

	if( Defined(bRevMode) )
	{
		gRevMode = bRevMode;
		gRevStart = bRevMode ? ( Defined(nStartAya) ? nStartAya : 0 ) : 1000;
	}
	else
	{
		if(gRevMode){
			gRevMode = false;
			gRevStart = 1000;
		}else{
			gRevMode = true;
			gRevStart = 0;
		}
	}

	UpdateReviewColors(true);
	
	if(gRevMode && gFirstRevAlert){
		alert("انقر بالماوس على مربع الآية لإظهارها أو أخفائها.\nاضغط على زر 'مراجعة الحفظ' في أعلى الصفحة لإلغاء أو بدء عملية المراجعة.\nحرك مؤشر الماوس فوق رقم الآية للتذكير بأول كلمة من نص الآية.");
		gFirstRevAlert = false;
	}

	return gRevMode;
}

function UpdateReviewColors(bInit)
{
	for( var i=0; i<idAya.length; i++ )
	{
		if(i<gRevStart)
		{// show
			//if( idAya[i].org_color ) 
			//{
				//idAya[i].style.color = idAya[i].org_color;
				//idAya[i].style.background = "";
				//idAya[i].org_color = null;
				idAya[i].style.color = "";
			//}

		}
		else
		{// hide
			//if( !idAya[i].org_color ){
			//	idAya[i].org_color = idAya[i].style.color;
			//	idAya[i].style.color = idAya[i].style.background = "#FFFFCC";
			//}
			if(idAya[i].style.backgroundColor.length)
				idAya[i].style.color = idAya[i].style.backgroundColor  ;
			else
				idAya[i].style.color = "#efefde";
		}
	}
}

function updateAyatColor(sura_num)
{
//	return;

	gMemorizedInfo = GetMemorizedInfo();
	gPendingInfo   = GetPendingInfo();

	var mem_suras     = gMemorizedInfo.split('$');
	var bending_suras = gPendingInfo.split('$');


	var nextMemAyaIndex =0;
	var nextBendAyaIndex=0;
	var nextMemAya  = -1;
	var nextBendAya = -1;

	var mem_ayat  = mem_suras[sura_num].split('|');
	var bend_ayat = bending_suras[sura_num].split('|');


	if (mem_ayat.length > nextMemAyaIndex)
	{
		nextMemAya = parseInt(mem_ayat[nextMemAyaIndex]);
		nextMemAyaIndex++;
	}

	if (bend_ayat.length > nextBendAyaIndex)
	{
		nextBendAya = parseInt(bend_ayat[nextBendAyaIndex]);
		nextBendAyaIndex++;
	}

	for(aya_num=1; aya_num <= VerseNoInSoura[sura_num]; aya_num++)
	{
		//if(!idAya[aya_num-1].org_color)
		//{
		//	idAya[aya_num-1].style.color="";
		//	idAya[aya_num-1].style.background = "";
		//}
		//idAya[aya_num-1].style.borderColor = "#D0D0D0";
		idAya[aya_num-1].style.borderColor = "";
		//idAya[aya_num-1].style.background = "";

		if(nextMemAya == aya_num)
		{
			//if(idAya[aya_num-1].org_color)
			//	idAya[aya_num-1].org_color = 'green';
			//else
			//	idAya[aya_num-1].style.color='green';
			idAya[aya_num-1].style.borderColor = "#6C9D59";
			//idAya[aya_num-1].style.background = "#f8f8e7";

			if (mem_ayat.length > nextMemAyaIndex)
			{//
				nextMemAya = parseInt(mem_ayat[nextMemAyaIndex]);
				nextMemAyaIndex++;
			}
		}
		else if (nextBendAya==aya_num)
		{
			//if(idAya[aya_num-1].org_color)
			//	idAya[aya_num-1].org_color = 'maroon';
			//else
			//	idAya[aya_num-1].style.color='maroon';
			idAya[aya_num-1].style.borderColor = "orange";

			if (bend_ayat.length > nextBendAyaIndex)
			{
				nextBendAya = parseInt(bend_ayat[nextBendAyaIndex]);
				nextBendAyaIndex++;
			}
		}
		else
		{
			//if(idAya[aya_num-1].org_color)
			//	idAya[aya_num-1].org_color = 'black';
			//else
			//	idAya[aya_num-1].style.color='black';
			idAya[aya_num-1].style.borderColor = "";

		}

	}
}

function JumpToPage( nPage )
{
	if( nPage < gFirstPage ){
		if(gSuraNo>1){
			window.top.location.href = "/sura.htm?aya=" + toStringEx(gSuraNo-1,3) + "&page=" + nPage;
		}
	}
	else if( nPage > gLastPage ){
		if(gSuraNo<114){
			window.top.location.href = "/sura.htm?aya=" + toStringEx(gSuraNo+1,3) + "&page=" + nPage;
		}
	}
	else{
		window.location.href = "#p" + nPage;
	}
}

function InitPageButton( btnElement, nPage )
{
	var sNextPage, sPrevPage;
	sNextPage = sPrevPage = "<img src=/images/space.gif width=11 height=11>";

	var nPrevPage = nPage - 1;
	var nNextPage = nPage + 1;

	if(nPrevPage > 0){
		sPrevPage = "<img style='cursor:hand' id=idUp border=0 onclick='JumpToPage(" + nPrevPage + ")' width=11 height=11>";
	}
		
	if( nNextPage < 604 )
	{// last page
		sNextPage = "<img style='cursor:hand' id=idDown border=0 onclick='JumpToPage(" + nNextPage + ")' width=11 height=11>";
	}

	btnElement.style.cursor = "default";
	btnElement.pageNo = nPage;

	btnElement.innerHTML ="<a name=p" + nPage + "></a>" + 
						  "<span class=pageButton pageNo=" + nPage + " onclick='onClickPageButton()' onmousemove='onEnterPage()' onmouseout='onLeavePage()'>" + 
							sPrevPage + " " + 
							btnElement.innerText + " " + 
							sNextPage+
						  "</span>" ;
}

function onSuraLoad()
{
	//JClassInit();

	var nPagesCount = gLastPage - gFirstPage + 1;
	var sPageNo;

	document.oncontextmenu = showContextMenu;
	document.onmousemove = HideAya;
	
//	for (i=0; i< idAya.length ; i++){
//		idAya[i].insertAdjacentHTML( "afterBegin", "<img id=idBullet xsrc=bullet.gif width=14 height=14" + 
//										" onmouseover =\"enterBulletMenu(" + i.toString() + ")\" " + 
//										" onmouseout=\"leaveMenu()\">&nbsp;" );
//	}

	//if ( document.getElementById("idPage") )
	//{
	//	if( idPage.length )
	//	{
	//		for (i=0; i<idPage.length; i++)
	//		{
	//			var nPage = gFirstPage + i ;
	//			InitPageButton( idPage[i], nPage );
	//		}
	//	}
	//	else
	//	{
	//		var nPage = gFirstPage ;
	//		InitPageButton( idPage, nPage );
	//	}
	//}

	//document.body.insertAdjacentHTML( "afterBegin",
	//		"<table onmousewheel='return WheelScrollPages()' cellspacing=0 cellpadding=0 id=idPageViews scroll=1 onmouseover=\"ShowElement('idPageViews',500)\" onmouseout=\"HideElement('idPageViews',500)\" style='border:solid 1px silver;position:absolute;left:15px;display:none;'><tr>" + 
	//		"<td id=idPageViewFrame align=center style='background-repeat:repeat-y;cursor:hand;' onclick='PrevPage()'><div><img src=/images/prev.gif border=0> صفحة سابقة</div><img id=idPageView side=0 src='/images/space.gif' width=100%><div id=idPageNo></div></td>" +
	//		"<td id=idPageViewFrame align=center style='background-repeat:repeat-y;cursor:hand;' onclick='NextPage()'><div>صفحة تالية <img src=/images/next.gif border=0></div><img id=idPageView side=1 src='/images/space.gif' width=100%><div id=idPageNo></div></td>" +
	//		"</tr></table>" );

	//document.body.insertAdjacentHTML( "beforeEnd",
	//		"<div  onmouseover=\"ShowElement('idAyaPreview',500)\" onmouseout=\"HideElement('idAyaPreview',500)\" style=\"color:maroon;position:absolute;font-weight:bold;width:360px;display:none;background:#FFFF99;left:4px;filter:progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=70);border-top:solid 3px white;border-left:solid 3px white;border-bottom:solid 3px gray;border-right:solid 3px gray;\" id=\"idAyaPreview\"></div>" ); 
	
	document.onclick = OnDocumentClick;
	//document.body.addBehavior("#default#download");

	gPreloadedImages = PreloadImages(Array("/images/bullet.gif", "/images/top.gif", "/images/down.gif"), Array(showBullets, showUpButtons, showDownButtons));
	
	window.setTimeout( "LoadTahfeez();updateAyatColor(gSuraNo);", 1000 );

	UpdateResolution(true);//force low resolution

	if(window.parent && window.parent.HeaderFrame && window.parent.HeaderFrame.BtnReview )
	{
		window.parent.HeaderFrame.BtnReview.style.visibility = "visible";
	}
}

////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function onClickPageButton()
{
	if( event.srcElement.pageNo )
	{
		HidePage();
		SelectPage(event.srcElement.pageNo);
		document.URL = "#p" + event.srcElement.pageNo.toString(10);
	}
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function onEnterPage()
{
	var src = event.srcElement;
	if( src && src.pageNo)
	{
		ShowPage( src.pageNo);
		event.srcElement.style.backgroundColor = "white";
		if( !src.onmouseout ){
			src.onmouseout = onLeavePage;
		}
	}
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function onLeavePage()
{
	HidePage();
	event.srcElement.style.backgroundColor = "";
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function disableSelection()
{
	window.event.returnValue = false;
}

var gBullet,up_arrow, down_arrow, gBullet2;

////////////////////////////////////////////////////////////
function HideAya()
{
	HideElement('idAyaPreview',500);

	//if(gRevMode && event && event.srcElement && event.srcElement.id == "idAya")
	//{
	//	event.srcElement.title= event.srcElement.style.color.length ? "اضغط بالماوس لإظهار الآية": "اضغط بالماوس لإخفاء الآية";
	//}
}

function showBullets(do_it)
{
	if(do_it){
		for (var i=0; i<idBullet.length ; i ++)
		{
			idBullet[i].src = "/images/bullet.gif";
			idBullet[i].aya_index = i;
			idBullet[i].onmouseover = enterBulletMenu;
		}
	}else{
		window.setTimeout("showBullets(true)",10);
	}
}

function showUpButtons(do_it)
{
	if(do_it){
		if(document.getElementById("idUp"))
		{
			if (idUp.length)
			{
				for (var i=0; i<idUp.length ; i ++)
				{
					idUp[i].src = "/images/top.gif";
				}
			}
			else
			{
				idUp.src = "/images/top.gif";
			}
		}
	}else{
		window.setTimeout("showUpButtons(true)",10);
	}
}

function showDownButtons(do_it)
{
	if(do_it){
		if(document.getElementById("idDown"))
		{
			if (idDown.length)
			{
				for (var i=0; i<idDown.length ; i ++)
				{
					idDown[i].src = "/images/down.gif";
				}
			}
			else
			{
				idDown.src = "/images/down.gif";
			}
		}
	}else{
		window.setTimeout("showDownButtons(true)",10);
	}
}

function PreviewAya(nAya)
{
	var aya_preview = document.getElementById("idAyaPreview");
	if(aya_preview) {
		idAyaPreview.innerText= idAya[nAya-1].innerText;
		idAyaPreview.style.top = document.body.scrollTop + 0;
		ShowElement("idAyaPreview", 200);
	}
}

////////////////////////////////////////////////////////////
function OnDocumentClick()
{
	if( event.srcElement.id == "idAya" )
	{
		document.selection.empty();

		var nAyaIndex =  GetAyaIndex( event.srcElement ) ;
		
		if(gRevMode)
		{
			gRevStart = nAyaIndex + (nAyaIndex < gRevStart ? 0 : 1);

			UpdateReviewColors();
		}
		else{
			window.setTimeout ( "UpdateSelectedRange(" + nAyaIndex.toString() + ")", 1 );
		}
	}
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function GetAyaIndex( ayaElement )
{
	//var sAyaText = ayaElement.innerText;
	//var sAyaNumber = sAyaText.substring( sAyaText.indexOf( "(" ) + 1, sAyaText.indexOf( ")" ) );
	var sAyaNumber = ayaElement.getAttribute("aya");
	var nAyaIndex = parseInt( sAyaNumber, 10 ) - 1;

	return( nAyaIndex );
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function UpdateSelectedRange( nAyaIndex )
{
// gStartSelection, gEndSelection
	RemoveSelection();
	
	if( -1 == gStartSelection )
	{ // no selection 
		gStartSelection = gEndSelection = nAyaIndex;
	}
	else if (gStartSelection == gEndSelection)
	{ //one aya selected
		if (nAyaIndex == gStartSelection)
		{ // deselect
			gStartSelection = -1;
		}
		else if (nAyaIndex < gStartSelection)
		{
			gStartSelection = nAyaIndex;
		}
		else
		{
			gEndSelection = nAyaIndex ;
		}
	}
	else
	{
		if (nAyaIndex == gStartSelection)
		{
			gEndSelection = gStartSelection ;
		}	
		else if (nAyaIndex == gEndSelection )
		{
			gStartSelection = gEndSelection ;
		}
		else if (nAyaIndex < gStartSelection )
		{
			gStartSelection = nAyaIndex;
		}
		else
		{
			gEndSelection = nAyaIndex;
		}
	}
	
	UpdateAyatChart();

	DrawSelection();
}

function UpdateAyatChart()
{
	window.parent.parent.frames("header").showSelection(gStartSelection, gEndSelection);		
}

function RemoveSelection()
{
	if (gStartSelection == -1)
		return;

	for (var i = gStartSelection; i<=gEndSelection ; i++)
	{
		idAya[i].style.backgroundColor = "";
	}
}

function DrawSelection()
{
	if (gStartSelection == -1)
		return;

	for (var i = gStartSelection; i<=gEndSelection ; i++)
	{
		idAya[i].style.backgroundColor = "#FFFFCC";
	}
}

function UpdateAyatColorEx()
{
	updateAyatColor(gSuraNo);

	DrawSelection();

}

function SelectPage( nPageNum )
{
	if(!gRevMode)
		RemoveSelection();

	var nPageIndex = nPageNum - gFirstPage;

	if( nPageIndex == 0 ){
		gStartSelection = 0;
	}
	else
	{
		gStartSelection = parseInt( idPage[nPageIndex].aya ) - 1;
	}

	try{
		if( nPageNum == gLastPage )
		{
			gEndSelection = idAya.length -1;
		}
		else
		{
			gEndSelection = parseInt( idPage[nPageIndex + 1].aya ) - 2;
		}

		UpdateAyatChart();

		if(gRevMode)
		{
			gStartSelection = gEndSelection = -1;
		}
		else
		{
			DrawSelection();
		}
	}
	catch(e)
	{
	}
}


function UpdatePageButtons(nSuranNo)
{
	idPageViews.sura_number = nSuranNo;
}

////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function ShowPage(nPageNo, nDelay)
{
	if(!gRevMode){
		DisplayPage(nPageNo);
	}
}

function ah()
{
	var src = event.srcElement;
	var aya = src.getAttribute("aya");
	src.style.backgroundColor = "white";
	if(!src.onmouseout){
		src.onclick = OnClickAKey;
		src.onmouseout = function(){
				src.style.backgroundColor = "";
		};

		var preview  = src.parentElement.innerText.trim().replace(/\s.*/,"");
		src.title = preview;

	}
}

function OnClickAKey()
{
	if(!gRevMode){
		showAyaImage( parseInt(this.aya,10) );
	}
}
