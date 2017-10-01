var gClickListen;
var gMemPercent;
var gUserID;

gMemPercent = AllSuraMemPercent();

function InitPage()
{
	//document.body.addBehavior("#default#download")	;

	//alert("pause");
	gUserID = getCookie("user");
	if (gUserID.length)
	{
		ShowUserInfo();
	}
	else
	{
		ShowUserLogin();
	}


	gClickListen = false;
	
	QueryToCookies();// for site migration
	LoadTahfeez();	

	window.name = "quran";

	if(window!=top)
	{
		top.location=document.location.href;
	}
	
	ShowFavoriteReciters();
	
	UpdateSaveURLs();

	var memPercent = quranMemPercent();
	idMemorized.innerHTML = "&nbsp;( " + memPercent.toString(10) + "% ) ";
	idMemChart.style.width = memPercent.toString(10) + "%";
}

function ShowUserInfo()
{
	gUserID  = getCookie("user");
	idLogin.innerHTML = "«·„” Œœ„ «·Õ«·Ì:" +
						" <b>'" + gUserID +  "'</b>" +
						"<div style='height:5px;font-size:1px;'></div>" + 
						"<input style='width:80px' type=button onclick='ShowUserLogin()' value='„” Œœ„ ¬Œ—' >" + 
						"<input style='width:80px' type=button onclick='ShowNewUser()' value='„” Œœ„ ÃœÌœ' >"  
						;
}

function ShowNewUser()
{
	ShowUserLogin();
	idLoginForm.newuser.checked = true;
	toggleNewUser(true);
}

function ShowUserLogin()
{
	idLogin.innerHTML = 
	"<table width=164 cellpadding=4><form id=idLoginForm onsubmit=\"return onLoginSubmit(this)\"><tr><td style='line-hieght:25px'>" +
	"<div>" +
		"<span style='width:65px'>«”„ «·œŒÊ·</span>" +
		"<input name=lname type=edit style='width:85px'>" +
	"</div>" +
	"<div>" +
		"<span style='width:65px'>ﬂ·„… «·”—</span>" +
		"<input name=pw type=edit style='width:85px'>" +
	"</div>" +
	"<div>" +
		"<input name=newuser type=checkbox onclick=\"toggleNewUser(this.checked)\"> ”ÃÌ· „” Œœ„ ÃœÌœ" +
	"</div>" +
	"<div id=idEmail style='display:none'>" +
		"<input name=keepdata type=checkbox onclick=\"toggleNewUser(this.checked)\"> «Õ ›Ÿ »«·»Ì«‰«  «·Õ«·Ì…" +
		"<span style='width:65px'>»—Ìœ «·Ìﬂ —Ê‰Ì</span>" +
		"<input name=email type=edit style='width:85px'>" +
	"</div>" +
	"<div align=left style='padding-top:3px'>" +
		"<input type=submit id=idBtnLogin value='œŒÊ·' style='width:75px'>" + 
		(gUserID.length>0?"<input type=button value='«·€«¡' style='width:75px' onclick='javascript:ShowUserInfo()'>":"") + 
	"</div>" +
	"</td></tr></form></table>";

	window.setTimeout("idLoginForm.lname.focus()", 10);
}

function toggleNewUser( bCheckValue )
{
	idEmail.style.display = bCheckValue ? "":"none";
	idLoginForm.idBtnLogin.value = bCheckValue ? " ”ÃÌ·":"œŒÊ·";
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
		sURL =	"cgi-bin/newuser.pl?" +
				"user=" + loginForm.lname.value + 
				"&password=" + loginForm.pw.value +
				"&email="+ loginForm.email.value +
				"&mem="  + (loginForm.keepdata.checked?getCookie("mem"):"") +
				"&memb=" + (loginForm.keepdata.checked?getCookie("memb"):"");

		document.body.startDownload( sURL, onNewUserResponse);
	}
	else
	{
		sURL = "cgi-bin/login.pl?" + 
				"user=" + loginForm.lname.value + 
				"&password=" + loginForm.pw.value;


		document.body.startDownload( sURL, onLoginResponse);
	}
	
	idLogin.innerHTML = "Ã«—Ì «·≈ ’«· »ﬁ«⁄œ… «·»Ì«‰«  ....";

	return false;
}

function onNewUserResponse(data)
{
	var xmlInfo = LoadXMLDoc(data, "/opt");
	
	if (xmlInfo.getAttribute("success") == "1")
	{
		document.cookie = "sync=0";
		setCookie("id", xmlInfo.getAttribute("id"))
		setCookie("user", xmlInfo.getAttribute("login_id"))
		
		LoadTahfeez();
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
	var xmlInfo = LoadXMLDoc(data, "/opt");
	
	if (xmlInfo.getAttribute("success") == "1")
	{
		var sError = onLoadTahfeez(data);
		
		if( sError && sError.length )
		{
			alert( sError );
			ShowUserLogin();
		}
		else
		{
			ShowUserInfo();
		}
	}
	else
	{
		alert( xmlInfo.getAttribute("error") );
		ShowUserLogin();
	}
}

function ShowFavoriteReciters()
{
	idRecitersList.innerHTML = GetRecitersList();

	var	lastReciter = readCookie("reciter");

	if (lastReciter.length > 0)
	{
		var recentList = lastReciter.split(",");

		idReciter.selectedIndex = parseInt(recentList[0],10);
		
		var sRecentReciters = "";

		for (i=1; i<recentList.length && i<6 ; i++)
		{
			if(recentList[i].length)
				sRecentReciters += "<a href=\"javascript:onSelectReciter(" + i + ")\">" + gReciterNames[ parseInt(recentList[i],10) ] + "</a><br>";
		}

		if (sRecentReciters.length > 0)
			idRecentReciters.innerHTML =  "√ÕœÀ „« «” „⁄  „‰ «·ﬁ—«¡<br>" + sRecentReciters;
	}
}

function GetRecitersList()
{
	var sListHTML = "";
	
	sListHTML += "<select id=\"idReciter\" style=\"font-weight:normal;width:160px\" NAME=idReciter onchange=\"javascript:changeReciter()\">";

	for	(var index=0; index<gReciterNames.length; index++)
	{
		sListHTML += "<option value=" + reciterLinks[index] + ">" + (index+1).toString(10) + " " + gReciterNames[index] + "</option>";
	}

	sListHTML += "</select>";
	
	return sListHTML;
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
	if (index >=0 && index < 114 && gClickListen == false)
		window.open ( "sura.htm?aya=" + NumToString (index+1, 3) , "_self");
	gClickListen = false;
}

function WriteSuraCells()
{
	var retValue = "";

	for (var row=0; row<29; row++)
	{
		document.write ( "<tr>" );

		for (var col=0; col<4; col ++ )
		{
			WriteSuraCell( row + 29*col ) ;
		}

		document.write( "</tr>" );
	}
}

function WriteSuraCell(index)
{
	var bgColor, hilightColor;
	var cell_text;
	var cellClass;

	if (sura_type[index] == 0)
	{
		bgColor = "#cedede";
		hilightColor = "#e1ecec";
	}
	else
	{
		bgColor = "#efefe7";
		hilightColor = "#fafaf5";
	}

	if (gSuraNames[index+1].length > 0)
	{
		var sTitle;

		cellClass = "class=SuraCell";

		if( gMemPercent[index] > 0) 
			sTitle = " title=\" Õ›Ÿ "+ gMemPercent[index].toString(10) + "% „‰ ¬Ì«  «·”Ê—…\" ";
		else		
			sTitle = "";

		cell_text = "<td width=100% style=\"border-left:dotted 1px #FFFFCC\" dir=RTL height=10 " + sTitle + ">";

		//cell_text += "<span style='position:absolute'>&nbsp;" + (index+1).toString(10) + "&nbsp;" + gSuraNames[index+1] + "</span>"; // write the sura order and name

		if( gMemPercent[index] > 0) 
		{
			cell_text += "<span style='position:absolute'>&nbsp;" + (index+1).toString(10) + "&nbsp;" + gSuraNames[index+1] + "</span>"; // write the sura order and name
			cell_text += "<span id=idSMemChart style=\"height:15px;padding:0;border:solid 1px silver;background:#FFFFCC;width:" + gMemPercent[index].toString(10) + "%\">&nbsp;" + 
						 "</span>" ;
		}
		else
		{
			cell_text += "<span >&nbsp;" + (index+1).toString(10) + "&nbsp;" + gSuraNames[index+1] + "</span>"; // write the sura order and name
		}

		cell_text += "</td><td>";

		cell_text += "<span id=idRecite" + index.toString(10) + " style=\"xwidth:100%;xposition:absolute\">";

		cell_text +="<img border=0 onmouseover=\"this.src='listen.gif'\" onmouseout=\"this.src='speaker.gif'\" width=16 height=15 xalign=left title='«÷€ÿ Â‰« ·”„«⁄ «· ·«Ê…' src=speaker.gif " +
						" onclick=\"javascript:return reciteSura('" + index + "')\" " + 
					">" + 
					//"<a href='#' xonmouseover=\"window.status='test'\" xonmouseout=\"window.status=''\" id=idSaveURL" + index + ">" + 
						"&nbsp;" +
					"<img src=disk.gif id=idSaveURL" + index + " href='#' border=0 width=16 height=15 " + 
						" onclick=\"javascript:return SaveAudio(this)\" " + 
						//" onclick=\"javascript:return reciteSura('" + index + "')\" " + 
						" onmouseover=\"this.src='save.gif'\" " + 
						" onmouseout=\"this.src='disk.gif'\" " + 
						" title='«÷€ÿ Â‰« »“— «·„«Ê” «·√Ì„‰ Ê «Œ — Save Target As' "+ 
					">" + 
					//"</a>" +
					""; 


		cell_text += "</span></td>";
	
	}
	else
	{
		cellClass = "";
		cell_text = "&nbsp;";
	}

	document.write ("<td valign=center width=25% NOWRAP " + cellClass + " bgColor=" + bgColor + 
					" onclick=\"javascript:openSura(" + index.toString(10) + ")\" " + 
					" onmouseover=\"javascript:this.bgColor='" + hilightColor + "';this.style.color='red'\" " + "onmouseout=\"javascript:this.bgColor='" + bgColor + "';this.style.color='#003399'\">" +
					"<table cellspacing=0 cellpadding=1 xborder width=100% dir=RTL><tr>" ); 
	document.write ( cell_text ) ;
	document.write ( "</tr></table></td>" );
}

function SaveAudio(element)
{
	gClickListen = true;
	
	url = "cgi-bin/save.pl?url=" + element.href;
	
	window.open (url, "telawa", "width=480,height=120");

	return 1;
}

function reciteSura (index)
{
	var url;

	gClickListen = true;

	index = parseInt(index,10);

	idCurrRecite.innerHTML = "  „  ‘€Ì·  ·«Ê… ”Ê—… <a href='sura.htm?aya=" + NumToString(index+1,3) + "'>" + gSuraNames[index+1] + "</a> »’Ê  «·ﬁ«—∆ <b>" + idReciter[idReciter.selectedIndex].innerHTML.substring(2) + "</b>";

	index ++;


	url = idReciter.value.replace ("%1%", index.toString(10) );
	url = url.replace ("%2%", NumToString(index,3) );


	//if (url.indexOf("islamway") >= 0)
	//{
	//	url = url.replace ("http:", "pnm:");
	//	url = url.replace (".ram", ".rm");
	//}

	openReciter (url);

	return false;
}

function GetSaveURL (index)
{
	var url;
	var myIndex = parseInt(index, 10);
	myIndex ++;

	url = idReciter.value.replace ("%1%", myIndex.toString(10) );
	url = url.replace ("%2%", NumToString(myIndex,3) );

	url = url.replace (".ram", ".rm" );
	url = url.replace ("24.6.182.32", "audio.islamweb.net" );
	return url;
}

var gTimeoutHandle = 0;

function changeReciter()
{
	SaveCurrentReciter( idReciter.selectedIndex );

	ShowFavoriteReciters();
	
	clearReciterChangeTimer();

	gTimeoutHandle = window.setTimeout ("UpdateSaveURLs()",1000);
}

function DeleteArrayElements( myArray, index, count)
{
	var retArray = new Array();

	for(i = 0; i< index; i++)
	{
		retArray[i] = myArray[i];
	}

	for (i = index + count; i< myArray.length ; i ++)
	{
		retArray[ i - count ] = myArray[ i ];
	}

	return retArray;
}

function onSelectReciter(index)
{

	var	lastReciter = readCookie("reciter");
	
	var lastReciterList = lastReciter.split(",");
	
	idReciter.selectedIndex = lastReciterList[index];

	lastReciterList = DeleteArrayElements( lastReciterList, index, 1 );
	
	writeCookie("reciter", lastReciterList.join(",") );

	changeReciter();
}

function clearReciterChangeTimer()
{
	if (gTimeoutHandle)
	{
		window.clearTimeout(gTimeoutHandle);
		gTimeoutHandle = 0;
	}
}

function UpdateSaveURLs()
{
	clearReciterChangeTimer();

	for (var i=0; i<114; i++)
	{
		if (reciterSuras[idReciter.selectedIndex].substring(i,i+1) == "1")
		{
			eval ( "idSaveURL" + i + ".href = GetSaveURL(" + i + ")") ;
			eval ("idRecite" + i.toString(10) + ".style.visibility=\"visible\"");
		}
		else
		{
			eval ("idRecite" + i.toString(10) + ".style.visibility=\"hidden\"");
		}
	}
}
function openSearch()
{
	var myWindow = window.open("search.htm", "search","scrollbars=yes,resizable=yes,menubar=yes,toolbar=no,location=no,width=624,height=300");
	myWindow.focus();
}

function openTrainer()
{
	var myWindow = window.open("exercise.htm", "trainer","scrollbars=yes,resizable=yes,menubar=yes,toolbar=no,location=no,width=600,height=500");
	myWindow.focus();
}
