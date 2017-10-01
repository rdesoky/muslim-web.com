var gMenuTimer = 0;
var gMenuID = 0;
var gShownMenus = new Array();
var gContextMenusCount = 0;
var gStartSelection = -1;
var gEndSelection = -1;
var gMenuItems = 0; 
var gPreloadedImages;
var gTafseerBaseURL = "tafseer/";
//var gTafseerBaseURL = "http://www.reciter.org/";


////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function writeMenu()
{

	startMenu();
	
	startSubMenu("عـــرض تفســــــير الآية", 1);
		writeMenuItem("إبن كثـــــــير", 1);
//		startSubMenu( "إبن كثـــــــير", 101);
//			writeMenuItem(
//						"<div>التفسير من موقع reciter.org انقر بالماوس للعرض في نافذه منفصلة</div>"+
//						"<div id=idKatheer class=tafseerView></div>" ,
//						1);
//		endSubMenu();
		writeMenuItem("الجـلالــــــين", 2);
//		startSubMenu("الجـلالــــــين", 102);
//			writeMenuItem(
//						"<div>التفسير من موقع reciter.org انقر بالماوس للعرض في نافذه منفصلة</div>"+
//						"<div id=idGalaleen  class=tafseerView></div>" ,
//						2);
//		endSubMenu();
		writeMenuItem("الطــــــــبري"  , 3);
//		startSubMenu("الطــــــــبري"  , 103);
//			writeMenuItem(
//						"<div>التفسير من موقع reciter.org انقر بالماوس للعرض في نافذه منفصلة</div>"+
//						"<div id=idTabary  class=tafseerView></div>" ,
//						3);
//		endSubMenu();
		writeMenuItem("القــــــرطبي" , 4);
//		startSubMenu("القــــــرطبي" , 104);
//			writeMenuItem(
//						"<div>التفسير من موقع reciter.org انقر بالماوس للعرض في نافذه منفصلة</div>"+
//						"<div id=idKortoby  class=tafseerView></div>" , 
//						4);
//		endSubMenu();
	endSubMenu();

	writeMenuItem("تــلاوة الآيــات المحــددة", 7);

	writeMenuItem("تـــدرب عـــلى الحــــفظ", 500);

	writeMenuItem("مـــــــــــراجعة الحــــفظ", 501);

	writeMenuItem("عـــرض رســــم الآيــــة", 600);

	//startSubMenu("عـــرض رســــم الآيــــة",2);
	//	writeMenuItem("<img id=idAyaImage src='loading.gif' style='border-top:solid 2px gray;border-left:solid 2px gray;border-bottom:solid 2px white;border-right:solid 2px white;'><br>هذا العرض من موقع: الأزهر الشريف", 51);
	//endSubMenu();

	//startSubMenu("تــلاوة الآيــات المحــددة", 3);
	//	writeMenuItem("بصوت القارئ : الحصـري (من موقع: al-islam.com)" , 7);
		//writeMenuItem("بصوت القارئ : الحـذيفي (من موقع: al-islam.com)", 8);
	//endSubMenu();

	//startSubMenu("تلاوة الى نهـاية السـورة",4);
	//writeMenuItem("تلاوة الى نهـاية السـورة",5);
		//writeMenuItem("بصوت القارئ : الحصـري (من موقع: al-islam.com)" , 5);
		//writeMenuItem("بصوت القارئ : الحـذيفي (من موقع: al-islam.com)", 6);
	//endSubMenu();

	startSubMenu("<span align=left>Translation</span>", 5);
		writeMenuItem("<span style='width:75px;'>English</span>", 400);
		writeMenuItem("<span style='width:75px;'>Français</span>", 401);
		writeMenuItem("<span style='width:75px;'>Deutsch</span>", 402);
		writeMenuItem("<span style='width:75px;'>Turkish</span>", 403);
		writeMenuItem("<span style='width:75px;'>Indoneisan</span>", 404);
		writeMenuItem("<span style='width:75px;'>Malayu</span>", 405);
	endSubMenu();

	writeMenuSeparator();

	startSubMenu("تســــــــجيل حــــــــفظ", 6);
		//writeMenuItem("هذه الآية", 100);
		writeMenuItem("الآيات المحددة", 105);
		writeMenuItem("من بداية السورة", 101);
		writeMenuItem("الى نهاية السورة", 102);
		writeMenuItem("السورة بأكملها", 103);
		//writeMenuItem("الى الآية...", 104);
	endSubMenu();
	startSubMenu("تســجيل تحـت الحـــفظ", 7);
		//writeMenuItem("هذه الآية", 200);
		writeMenuItem("الآيات المحددة", 205);
		writeMenuItem("من بداية السورة", 201);
		writeMenuItem("الى نهاية السورة", 202);
		writeMenuItem("السورة بأكملها", 203);
		//writeMenuItem("الى الآية...", 204);
	endSubMenu();
	startSubMenu("إلغــــــــــــاء حـــــــــفظ", 8);
		//writeMenuItem("هذه الآية", 300);
		writeMenuItem("الآيات المحددة", 305);
		writeMenuItem("من بداية السورة", 301);
		writeMenuItem("الى نهاية السورة", 302);
		writeMenuItem("السورة بأكملها", 303);
		//writeMenuItem("الى الآية...", 304);
	endSubMenu();

	writeMenuSeparator();
	writeMenuItem("نسخ نص الآيات المحددة", 23);
	writeMenuItem("إضافة الآية الى التفضيلات", 22);
	endMenu();

}

function showAyaImage(ayaNo)
{
	var image = document.getElementById("aya_img_" + ayaNo);
	if( image )
	{
		if( image.style.display == "none" ){
			image.style.display="";
		}
		else{
			image.style.display="none";
		}
	}
	else
	{
		var imgSRC = gsAyatImageURL + gSuraNo + "_" + toStringEx(ayaNo,3) + ".gif";
		idAya[ayaNo-1].innerHTML = "<img onclick=\"this.style.display='none'\" style='border:solid 2px olive' " + 
				"  title='هذه صورة للآية من موقع الأزهر الشريف www.alazhr.com. اضغط بالماوس لإخفاء الصورة' align=left id=aya_img_" + ayaNo + " src=" + imgSRC + ">" + idAya[ayaNo-1].innerHTML + "<br clear=all>";
	}
}

////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function onShowMenu(myMenu, id)
{
	var ayaNo = gMenuID + 1;
	var sURL;
	//gShownMenus.push(myMenu);
	gShownMenus[gShownMenus.length] = myMenu;

	switch (id)
	{
	case 2:
		idAyaImage.src = gsAyatImageURL + gSuraNo + "_" + toStringEx(ayaNo,3) + ".gif";
		break;
	}
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function clickMenuItem(id)
{
	var ayaNo = gMenuID + 1;
	var tafHeight = screen.height - 160;
	
	switch (id)
	{
		case 1:
		case 2:
		case 3:
		case 4:
			break;// don't hide the menu in those cases
		default:
			hideMenu();				

	}
	//alert(id);

	switch (id)
	{
	case 1:
		window.parent.ShowTafseer( gSuraNo, ayaNo, "KATHEER" );
		break;
	case 2:
		window.parent.ShowTafseer( gSuraNo, ayaNo, "GALALEEN" );
		break;
	case 3:
		window.parent.ShowTafseer( gSuraNo, ayaNo, "TABARY" );
		break;
	case 4:
		window.parent.ShowTafseer( gSuraNo, ayaNo, "KORTOBY" );

		break;

	case 5:// hosary till end
		//openReciter("http://quran.al-islam.com/Recite/Recite_g2.asp?s="+ gSuraNo + "&f="+ayaNo+"&t=10&Reciter=0", gSuraNo, 33);
		openReciter( "http://cgi.muslim-web.com/cgi-bin/recite.pl?s=" + gSuraNo + "&f=" + ayaNo + "&t=" + VerseNoInSoura[gSuraNo] + "&r=0", gSuraNo, 33);
		break;

	case 6:// hozaify till end
		//openReciter("http://quran.al-islam.com/Recite/Recite_g2.asp?s="+ gSuraNo + "&f="+ayaNo+"&t=10&Reciter=1", gSuraNo, 19);
		openReciter("http://cgi.muslim-web.com/cgi-bin/recite.pl?s=" + gSuraNo + "&f=" + ayaNo + "&t=" + VerseNoInSoura[gSuraNo] + "&r=1", gSuraNo, 19);
		break;

	case 7:// hosary range
		if( gStartSelection == -1 || ayaNo < gStartSelection || ayaNo-1 > gEndSelection ) {
			openReciter( "http://cgi.muslim-web.com/cgi-bin/recite.pl?s=" + gSuraNo + "&f=" + ayaNo + "&t=" + ayaNo + "&r=0", gSuraNo, 33);
		}
		else {
			openReciter("http://cgi.muslim-web.com/cgi-bin/recite.pl?s=" + gSuraNo + "&f=" + (gStartSelection+1).toString() + "&t=" + (gEndSelection+1).toString() + "&r=0", gSuraNo, 33);
		}
		break;

	case 8:// hozaify range
		if( gStartSelection == -1 || ayaNo < gStartSelection || ayaNo-1 > gEndSelection ) {
			openReciter("http://cgi.muslim-web.com/cgi-bin/recite.pl?s=" + gSuraNo + "&f=" + ayaNo + "&t=" + ayaNo + "&r=1", gSuraNo, 19);
		}
		else {
			openReciter("http://cgi.muslim-web.com/cgi-bin/recite.pl?s=" + gSuraNo + "&f=" + (gStartSelection+1).toString() + "&t=" + (gEndSelection+1).toString() + "&r=1", gSuraNo, 19);
		}
		break;
	
	case 600:// show aya image
		showAyaImage(ayaNo);
		break;
	case 51: // open picture
		window.open("http://www.alazhr.com/");
		break;

	case 100:
		memorizeRange(gSuraNo,ayaNo,ayaNo);
		//MessageBox("تم إضافة الآية رقم " + ayaNo + " من سورة " + gSuraNames[parseInt(gSuraNo,10)] + " الى الآيات التي حفظتها", "تحفيظ القرآن الكريم");
		break;
	case 101:
		memorizeRange(gSuraNo,1,ayaNo);
				
		//MessageBox("تم إضافة الآيات من رقم 1 الى رقم " + ayaNo + " من سورة " + gSuraNames[parseInt(gSuraNo,10)] + " الى الآيات التي حفظتها", "تحفيظ القرآن الكريم");
		break;
	case 102:
		memorizeRange(gSuraNo,ayaNo,VerseNoInSoura[gSuraNo]);
				
		//MessageBox("تم إضافة الآيات من رقم " + ayaNo + "الى آخر سورة " + gSuraNames[parseInt(gSuraNo,10)] + " الى الآيات التي حفظتها", "تحفيظ القرآن الكريم");
		break;
	case 103:
		memorizeRange(gSuraNo,1,VerseNoInSoura[gSuraNo]);
				
		//MessageBox("تم إضافة سورة " + gSuraNames[parseInt(gSuraNo,10)] + " الى ما تحفظ من القرآن", "تحفيظ القرآن الكريم");
		break;
	case 104:
		window.showModalDialog("/mem_range.htm","sura=" + gSuraNo + "&aya=" + ayaNo + "&func=1","dialogHeight: 200px; dialogWidth: 200px; dialogTop: px; dialogLeft: px; edge: Raised; center: Yes; help: Yes; resizable: No; status: No;scroll: No");		
				
		break;
	case 105:
		if( gStartSelection == -1 || ayaNo < gStartSelection || ayaNo-1 > gEndSelection ) {
			memorizeRange(gSuraNo,ayaNo,ayaNo);
		}
		else {
			memorizeRange(gSuraNo,gStartSelection+1,gEndSelection+1);
		}
		break;

	case 200:
		memorizeBendingRange(gSuraNo,ayaNo,ayaNo);
				
		break;
	case 201:
		memorizeBendingRange(gSuraNo,1,ayaNo);
				
		break;
	case 202:
		memorizeBendingRange(gSuraNo,ayaNo,VerseNoInSoura[gSuraNo]);
				
		//MessageBox("تم إضافة الآيات من رقم " + ayaNo + "الى آخر سورة " + gSuraNames[parseInt(gSuraNo,10)] + " الى الآيات التي تقوم بحفظها", "تحفيظ القرآن الكريم");
		break;
	case 203:
		memorizeBendingRange(gSuraNo,1,VerseNoInSoura[gSuraNo]);
				
		//MessageBox("تم إضافة سورة " + gSuraNames[parseInt(gSuraNo,10)] + " الى ما تقوم بحفظه من القرآن", "تحفيظ القرآن الكريم");
		break;
	case 204:
		window.showModalDialog("mem_range.htm","sura=" + gSuraNo + "&aya=" + ayaNo + "&func=2","dialogHeight: 200px; dialogWidth: 200px; dialogTop: px; dialogLeft: px; edge: Raised; center: Yes; help: Yes; resizable: No; status: No;scroll: No");		
				
		break;
	case 205:
		if( gStartSelection == -1 || ayaNo < gStartSelection || ayaNo-1 > gEndSelection ) {
			memorizeBendingRange(gSuraNo,ayaNo,ayaNo);
		}
		else {
			memorizeBendingRange(gSuraNo,gStartSelection+1,gEndSelection+1);
		}
		break;

	case 300:
		unMemorizeRange(gSuraNo,ayaNo,ayaNo);
				
		//MessageBox("تم حذف الآية رقم" + ayaNo + " من سورة " + gSuraNames[parseInt(gSuraNo,10)] + " من الآيات التي حفظتها", "تحفيظ القرآن الكريم");
		break;

	case 305:
		if( gStartSelection == -1 || ayaNo < gStartSelection || ayaNo-1 > gEndSelection ) {
			unMemorizeRange(gSuraNo,ayaNo,ayaNo);
		}
		else {
			unMemorizeRange(gSuraNo,gStartSelection+1,gEndSelection+1);
		}
		break;
	case 301:
		unMemorizeRange(gSuraNo,1,ayaNo);
				
		//MessageBox("تم حذف الآيات من رقم 1 الى رقم " + ayaNo + " من سورة " + gSuraNames[parseInt(gSuraNo,10)] + " من الآيات التي حفظتها", "تحفيظ القرآن الكريم");
		break;
	case 302:
		unMemorizeRange(gSuraNo,ayaNo,VerseNoInSoura[gSuraNo]);
				
		//MessageBox("تم حذف الآيات من رقم " + ayaNo + "الى آخر سورة " + gSuraNames[parseInt(gSuraNo,10)] + " من الآيات التي حفظتها", "تحفيظ القرآن الكريم");
		break;
	case 303:
		unMemorizeRange(gSuraNo,1,VerseNoInSoura[gSuraNo]);
				
		//MessageBox("تم حذف سورة " + gSuraNames[parseInt(gSuraNo,10)] + " من ما تحفظ من القرآن", "تحفيظ القرآن الكريم");
		break;
	case 304:
		window.showModalDialog("mem_range.htm","sura=" + gSuraNo + "&aya=" + ayaNo + "&func=3","dialogHeight: 200px; dialogWidth: 200px; dialogTop: px; dialogLeft: px; edge: Raised; center: Yes; help: Yes; resizable: No; status: No;scroll: No");		
		break;

	case 500:
		if( gStartSelection == -1 || ayaNo < gStartSelection || ayaNo-1 > gEndSelection ) {
			startMemoryExercise( ayaNo - 1, ayaNo - 1);
		} else {
			startMemoryExercise( gStartSelection, gEndSelection );
		}
		break;

	case 501:
		ToggleRevMode(true, ayaNo-1);
		break;

	case 400:
		ShowAyaInfoFrame( ayaNo-1, "http://www.reciter.org/ENGLISH/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" );
		//ShowAyaInfoFrame( ayaNo-1, "http://www.usc.edu/dept/MSA/quran/" + toStringEx(gSuraNo,3) + ".qmt.html#" + toStringEx(gSuraNo,3) + "." + toStringEx(ayaNo,3), true );
		//transWindow = window.open( "http://www.usc.edu/dept/MSA/quran/" + toStringEx(gSuraNo,3) + ".qmt.html#" + toStringEx(gSuraNo,3) + "." + toStringEx(ayaNo,3) , "TAF", "top=20,left=20,height=" + tafHeight.toString(10) + ",width=400,location=no,menubar=no,toolbar=yes,resizable=yes,scrollbars=yes");
		//transWindow.focus();
		break;

	case 401:
		ShowAyaInfoFrame( ayaNo-1, "http://www.reciter.org/FRENSH/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" );
		//transWindow = window.open( "http://www.reciter.org/FRENSH/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" , "TAF", "top=20,left=20,height=" + tafHeight.toString(10) + ",width=400,location=no,menubar=no,toolbar=yes,resizable=yes,scrollbars=yes");
		//transWindow.focus();
		break;
	
	case 402:
		ShowAyaInfoFrame( ayaNo-1, "http://www.reciter.org/GERMAN/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" );
		//transWindow = window.open( "http://www.reciter.org/GERMAN/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" , "TAF", "top=20,left=20,height=" + tafHeight.toString(10) + ",width=400,location=no,menubar=no,toolbar=yes,resizable=yes,scrollbars=yes");
		//transWindow.focus();
		break;

	case 403:
		//TURKISH
		ShowAyaInfoFrame( ayaNo-1, "http://www.reciter.org/TURKISH/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" );
		//transWindow = window.open( "http://www.reciter.org/TURKISH/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" , "TAF", "top=20,left=20,height=" + tafHeight.toString(10) + ",width=400,location=no,menubar=no,toolbar=yes,resizable=yes,scrollbars=yes");
		//transWindow = window.open( "http://oregonstate.edu/groups/msa/quran/quran_d/" + gSuraNo + ".html#" + ayaNo , "TAF", "top=20,left=20,height=" + tafHeight.toString(10) + ",width=400,location=no,menubar=no,toolbar=yes,resizable=yes,scrollbars=yes");
		//transWindow.focus();
		break;

	case 404:
		ShowAyaInfoFrame( ayaNo-1, "http://www.reciter.org/INDONEISAN/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" );
		//transWindow = window.open( "http://www.reciter.org/INDONEISAN/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" , "TAF", "top=20,left=20,height=" + tafHeight.toString(10) + ",width=400,location=no,menubar=no,toolbar=yes,resizable=yes,scrollbars=yes");
		//transWindow = window.open( "http://oregonstate.edu/groups/msa/quran/quran_s/" + gSuraNo + ".html#" + ayaNo , "TAF", "top=20,left=20,height=" + tafHeight.toString(10) + ",width=400,location=no,menubar=no,toolbar=yes,resizable=yes,scrollbars=yes");
		//transWindow.focus();
		break;

	case 405:
		ShowAyaInfoFrame( ayaNo-1, "http://www.reciter.org/MALAYU/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" );
		//transWindow = window.open( "http://www.reciter.org/MALAYU/" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) + ".html" , "TAF", "top=20,left=20,height=" + tafHeight.toString(10) + ",width=400,location=no,menubar=no,toolbar=yes,resizable=yes,scrollbars=yes");
		//transWindow.focus();
		break;

	case 22:// add favorites
		window.external.addFavorite("http://" + window.parent.parent.location.hostname + "/sura.htm?aya=" + toStringEx(gSuraNo,3) + toStringEx(ayaNo,3) , "القرآن الكريم - سورة " + gSuraNames[parseInt(gSuraNo,10)] + " - آية " + ayaNo);
		break;
	case 23:// copy to clipboard
		{
			var ayaText   = "";
		if( gStartSelection == -1 || ayaNo < gStartSelection || ayaNo-1 > gEndSelection ) {
				ayaText = idAya[ayaNo-1].innerText ;
			} else {
				for (var i=gStartSelection; i <= gEndSelection ; i++ ){
					ayaText += idAya[i].innerText + "\r\n";
				}
			}
			window.clipboardData.setData("Text",ayaText);
		}
		break;
	}

	switch (id)
	{
		case 100:
		case 101:
		case 102:
		case 103:
		case 104:
		case 105:
		case 200:
		case 201:
		case 202:
		case 203:
		case 204:
		case 205:
		case 300:
		case 301:
		case 302:
		case 303:
		case 304:
		case 305:
			//window.parent.parent.frames("header").showMemReport( true );		
			//window.parent.parent.frames("side").location.reload();		
			window.parent.parent.HeaderFrame.showMemReport( true );		
			window.parent.parent.SideFrame.location.reload();		
			UpdateAyatColorEx();
	}
	//hideMenu();
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function startMemoryExercise( startAya, endAya )
{
	var suraIndex = gSuraNo -1;

	var ayaText   = "";
	
	for (var i=startAya; i <= endAya ; i++ )
	{
		ayaText += idAya[i].innerText;
		idAya[i].style.color = idAya[i].style.background;
	}

	ayaText = ayaText.replace(/\(\d\)/g, "");
	//ayaText = ayaText.replace(/[\x{06D6}-\x{06FF}]/g, "");

	window.showModalDialog( "../exercise2.htm", 
							"sura=" + suraIndex + 
							"&aya=" + startAya + 
							"&toaya=" + endAya + 
							"&text=" + ayaText ,  
							"dialogHeight:500px; dialogWidth:600px; dialogTop: px; dialogLeft: px; edge: Raised; center: Yes; help: Yes; resizable: Yes; status: No;scroll: Yes" );
	
	//UpdateAyatColorEx();
	for (var i=startAya; i <= endAya ; i++ )
	{
		idAya[i].style.color = "";
	}

}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function startMenu()
{
	document.write ("<span id=idContextMenu style='display:none' myIndex=" + gContextMenusCount + " onmouseover=\"cancelCloseMenuTimer()\" onmouseout=\"leaveMenu()\">" +
						"<table id=idMenuFrame border=0 cellspacing=0 cellpadding=0>"
					);
	gContextMenusCount ++;
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function endMenu()
{
	document.write (	"</table>" + 
					"</span>");
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function writeMenuItem(strTitle, id)
{
	document.write("<tr>" + 
						"<td id=idMenuItem NOWRAP style='padding:3px' " + 
							" onmouseover=\"EnterMenuItem(" + gMenuItems + ")\" " + 
							" onmouseout=\"LeaveMenuItem(" + gMenuItems + ")\" " + 
							" onclick=\"clickMenuItem(" + id + ")\" >" + 
							strTitle + 
						"</td>" + 
					"</tr>");
	gMenuItems ++;
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function writeMenuSeparator()
{
	document.write("<tr>" +		
						"<td bgcolor=#AAAAAA height=2>" + 
							"<div style='font-size:1px'></div>" +
							//"<hr>" +
						"</td>" + 
					"</tr>"
					);
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function startSubMenu(strTitle, id)
{
	document.write ("<tr>" + 
						"<td " +  
						"    onmouseover=\"EnterGroupMenuItem(" + gContextMenusCount + "," + id + ")\" " + 
						"    onmouseout=\"LeaveGroupMenuItem(" + gContextMenusCount + "," + id + ")\" >" + 

							"<table id=idGMenuItem border=0 cellspacing=0 cellpadding=0 width=100% >" + 
							"<tr>" + 
								"<td style='padding:3px' NOWRAP width='100%'>" + 
									strTitle + 
								"</td>" + 
								"<td>" + 
									"<img src=/images/next.gif align=absmiddle>" + 
								"</td>" + 
								"<td valign=top>" + 
									"<span id=idContextMenu style='display:none' myIndex=" + gContextMenusCount + " >" + 
										"<table id=idMenuFrame border=0 cellspacing=0 cellpadding=2>" );
	gContextMenusCount ++;
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function endSubMenu()
{
	document.write (					"</table>"+
									"</span>" + 
								"</td>"+
							"</tr>"+
							"</table>" + 
						"</td>" + 
					"</tr>" );
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function enterBulletMenu()
{
	var src = event.srcElement;

	idBullet[gMenuID].src="/images/bullet.gif";

	if(src){
		src.src = "/images/bullet2.gif";
		src.onmouseout = leaveMenu;
		gMenuID = src.getAttribute("aya_index");
	}

	enterMenu();
}
////////////////////////////////////////////////////////////
function showContextMenu()
{
	if( event.srcElement.id == "idAya")
	{
		gMenuID = GetAyaIndex(event.srcElement);
		idContextMenu[0].style.left= event.x - 138;// + document.body.scrollLeft;
		idContextMenu[0].style.top = event.y + document.body.scrollTop - 10;
		idContextMenu[0].style.display = "";
		return false;
	}

	return true;
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function enterAyaMenu(n)
{
	gMenuID = n;
	enterMenu();
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function enterMenu()
{
	var xpos,ypos;
	cancelCloseMenuTimer();

	idContextMenu[0].style.display = "";

	xpos = document.body.scrollWidth - 152;
	ypos = event.y + document.body.scrollTop - event.offsetY - 2;

	idContextMenu[0].style.left= xpos;// + document.body.scrollLeft;
	idContextMenu[0].style.top = ypos;
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function EnterMenuItem( nMenuItemIndex )
{

	idMenuItem[nMenuItemIndex].bgColor="brown";
	idMenuItem[nMenuItemIndex].style.color="white";
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function LeaveMenuItem( nMenuItemIndex )
{
	idMenuItem[nMenuItemIndex].bgColor='#dcdcb6';
	idMenuItem[nMenuItemIndex].style.color="black";
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function EnterGroupMenuItem(nMenuIndex, id)
{
	idGMenuItem[nMenuIndex-1].bgColor="brown";
	idGMenuItem[nMenuIndex-1].style.color="white";

	var myMenu = idContextMenu[nMenuIndex]; 
	myMenu.style.display='';

	onShowMenu (myMenu, id);
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function LeaveGroupMenuItem( nMenuIndex, id )
{
	idGMenuItem[nMenuIndex-1].bgColor='#dcdcb6';
	idGMenuItem[nMenuIndex-1].style.color="black";
	
	var myMenu = idContextMenu[nMenuIndex];
	myMenu.style.display='none';
	
	onHideMenu(myMenu, id);
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function leaveMenu()
{
	cancelCloseMenuTimer();
	gMenuTimer = window.setTimeout ("hideMenu()", 500);
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function hideMenu()
{
	cancelCloseMenuTimer();

	while (gShownMenus.length)
	{
		gShownMenus[0].style.display="none";
		//gShownMenus.pop();
		if(	gShownMenus.length > 0 )
			gShownMenus.length = gShownMenus.length - 1;
	}
	idContextMenu[0].style.left = 0;	
	idContextMenu[0].style.display = "none";
	idBullet[gMenuID].src="/images/bullet.gif";
	//idBullet[gMenuID].innerHTML="+";
	//idBullet[gMenuID].className = "bullet";


}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function cancelCloseMenuTimer()
{
	if (gMenuTimer)
	{
		window.clearTimeout(gMenuTimer);
		gMenuTimer = 0;
		return true;
	}
	return false;
}


////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function onHideMenu (myMenu, id)
{
	//gShownMenus.pop();
	if(	gShownMenus.length > 0 )
		gShownMenus.length = gShownMenus.length - 1;

	switch (id)
	{
	case 1:
		//idAyaImage.src = "loading.gif";
		break;
	}
}


function ShowAyaInfoFrame( nAya, sURL, bSnapAya )
{
	var info = document.getElementById("info_" + nAya);
	var parentElement;

	if(info)
	{
		info.style.display = "";
		var frame=document.getElementById( "info_frame_" + nAya );
		if(frame){
			frame.src = sURL;
			parentElement = document.getElementById("AyaParent_" + nAya);
		}
	}
	else
	{
		var docElement = idAya[nAya];
		parentElement = document.createElement("div");
		docElement.applyElement(parentElement);
		parentElement.id = "AyaParent_" + nAya;

		parentElement.insertAdjacentHTML("beforeEnd", 
				"<div id='info_" + nAya + "' align=center style='width:100%'>" + 
				"<iframe id='info_frame_" + nAya + "' style='width:100%' height=120 src='" + sURL + "'></iframe><br>" + 
				"<input id='close_info_" + nAya + "' type=button value='إغلاق' style='width:100px' onclick=\"closeInfo(" + nAya + ")\">" + 
				"</div>" );
	}

	parentElement.style.background = "#dcdcb6";
	parentElement.style.borderTop = parentElement.style.borderLeft = "solid 2px white";
	parentElement.style.borderBottom = parentElement.style.borderRight = "solid 2px gray";
	parentElement.style.padding = "2px";
	
	eval( "close_info_" + nAya + ".focus()" );
	//parentElement.scrollIntoView(false);

	//window.location.replace( "#" + toStringEx(nAya,3) );
}

function closeInfo( nAya )
{
	infoElement = document.getElementById("info_" + nAya);
	infoElement.style.display = "none";
	parentElement = document.getElementById("AyaParent_" + nAya);
	parentElement.style.background = "";
	parentElement.style.border = "";
	parentElement.style.padding = "";
}