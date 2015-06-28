try{ onLoadScriptFile(); } catch(e){};

var gMemorizedInfo , gPendingInfo;

////////////////////////////////////////////////////////////////////////////
function addAya( suraData, newAya )
{
	newAyaValue = parseInt(newAya,10);
	
	newData = "";
	added = false;
	oldAyat = suraData.split('|');

	for(i=0;i<oldAyat.length;i++)
	{
		if(i>0)
			newData += "|";
			
		if(added == false && newAyaValue <= parseInt(oldAyat[i],10))
		{
			if(newAyaValue < parseInt(oldAyat[i],10))
				newData += newAya+"|";
			added = true;
		}

		newData += oldAyat[i];
	}

	if (added == false)
	{
		if(newData.length>0)
			newData += "|";

		newData += newAya;
	}

	return newData;
}
////////////////////////////////////////////////////////////////////////////
function removeAya(suraData,newAya)
{
	newAyaValue = parseInt(newAya,10);
	
	newData = "";
	removed = false;
	oldAyat = suraData.split('|');

	for(i=0;i<oldAyat.length;i++)
	{
		if(removed==true || newAyaValue != parseInt(oldAyat[i],10))	{
			if(newData.length>0)
				newData += "|";
				
			newData += oldAyat[i];
		}
		else{
			removed = true;
		}
		
	}

	return newData;
}
////////////////////////////////////////////////////////////////////////////
function memorizeRange(suraNo, startAya, endAya)
{
	var firstAya, lastAya, myAya, i, memorized, mem_suras;
	
	unMemorizeRange( suraNo, startAya, endAya, false );

	gMemorizedInfo = GetMemorizedInfo();
	
	mem_suras = gMemorizedInfo.split('$');

	firstAya = parseInt(startAya,10);
	lastAya  = parseInt(endAya, 10);
	
	for(myAya = firstAya; myAya<=lastAya; myAya++ )
	{
		mem_suras[suraNo] = addAya( mem_suras[suraNo], myAya );
	}
	
	for(i=0; i<mem_suras.length; i++)
	{
		if (i == 0)
			gMemorizedInfo = mem_suras[i];
		else
			gMemorizedInfo += "$" + mem_suras[i];
	}
	
	writeCookie( "mem", compressMem( gMemorizedInfo ) );
	
	SaveTahfeez();
}
////////////////////////////////////////////////////////////////////////////
function memorizeBendingRange(suraNo, startAya, endAya)
{
	var firstAya, lastAya, myAya, i, memorized, mem_suras, bending_suras;

	unMemorizeRange( suraNo, startAya, endAya, false );

	gPendingInfo   = GetPendingInfo();
	
	mem_suras = gPendingInfo.split('$');

	firstAya = parseInt( startAya, 10 );
	lastAya  = parseInt( endAya, 10 );
	
	for(myAya=firstAya; myAya<=lastAya; myAya++)
	{
		mem_suras[suraNo] = addAya(mem_suras[suraNo],myAya);
	}
	
	for(i=0;i<mem_suras.length;i++)
	{
		if (i == 0)
			gPendingInfo = mem_suras[i];
		else
			gPendingInfo += "$" + mem_suras[i];
			
	}
	
	writeCookie("memb",compressMem(gPendingInfo));

	if (window.opener){
		window.opener.top.location.reload();
	}

	SaveTahfeez();
}
////////////////////////////////////////////////////////////////////////////
function unMemorizeRange( suraNo, startAya, endAya, dont_save )
{

	var firstAya, lastAya, myAya, i, memorized, mem_suras, bending_suras;
	
	gMemorizedInfo = GetMemorizedInfo();
	gPendingInfo   = GetPendingInfo();

	mem_suras = gMemorizedInfo.split('$');
	bending_suras = gPendingInfo.split('$');

	firstAya = parseInt(startAya,10);
	lastAya  = parseInt(endAya,10);
	
	for(myAya=firstAya; myAya<=lastAya; myAya++)
	{
		mem_suras[suraNo] = removeAya(mem_suras[suraNo],myAya);
		bending_suras[suraNo] = removeAya(bending_suras[suraNo],myAya);
	}
	
	for(i=0;i<mem_suras.length;i++)
	{
		if (i == 0)
			gMemorizedInfo = mem_suras[i];
		else
			gMemorizedInfo += "$" + mem_suras[i];
			
	}

	for(i=0;i<bending_suras.length;i++)
	{
		if (i == 0)
			gPendingInfo = bending_suras[i];
		else
			gPendingInfo += "$" + bending_suras[i];
			
	}
	
	writeCookie( "mem", compressMem(gMemorizedInfo) );
	writeCookie( "memb",compressMem(gPendingInfo) );

	if(!dont_save){
		SaveTahfeez();
	}
}
////////////////////////////////////////////////////////////////////////////
function memorizeBending()
{
	memorizeBendingRange(suraNo, ayaNo, document.myForm.toAya.value);
}
////////////////////////////////////////////////////////////////////////////
function memorize()
{
	memorizeRange (suraNo, ayaNo, parseInt(document.myForm.toAya.value) );

	WindowReload( 500 );

	if (window.opener){
		window.opener.top.location.reload();
	}

}
////////////////////////////////////////////////////////////////////////////
function unMemorizeSura(suraNo)
{
	unMemorizeRange(suraNo,1,VerseNoInSoura[suraNo]);

}
////////////////////////////////////////////////////////////////////////////
function memorizeSuraNo(suraNo)
{
	memorizeRange(suraNo,1,VerseNoInSoura[suraNo]);
	
}
////////////////////////////////////////////////////////////////////////////
function memorizeSura() // called from withen Control Panel
{
	memorizeSuraNo(suraNo);
	
	WindowReload(500);
	if (window.opener)
	{
		window.opener.top.location.reload();
	}

}
////////////////////////////////////////////////////////////////////////////
function memorizeSuraFromStart() // called from withen Control Panel
{
	memorizeRange (suraNo, 1, parseInt(document.myForm.toAya.value,10) );
	
	WindowReload(500);

	if (window.opener)
	{
		window.opener.top.location.reload();
	}
}
////////////////////////////////////////////////////////////////////////////
function unmemorize()
{
	unMemorizeRange (suraNo, ayaNo, document.myForm.toAya.value );

	WindowReload(500);
	if (window.opener)
	{
		window.opener.top.location.reload();
	}
}

/////////////////////////////////////////////////////////////////////////////
function getSuraMemChart(sura_num, mem_suras, bending_suras, indicator)
{
	var chart     = "";

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

		if(nextMemAya == aya_num)
		{
			ayaID = "idMemorized";

			if (mem_ayat.length > nextMemAyaIndex)
			{//
				nextMemAya = parseInt(mem_ayat[nextMemAyaIndex]);
				nextMemAyaIndex++;
			}
		}
		else if (nextBendAya==aya_num)
		{
			ayaID = "idBending";

			if (bend_ayat.length > nextBendAyaIndex)
			{
				nextBendAya = parseInt(bend_ayat[nextBendAyaIndex]);
				nextBendAyaIndex++;
			}
		}
		else
		{
			ayaID = "idNotMemorized";
		}

		chart += "<a id=" + ayaID + 
				" sura=" + sura_num + 
				" aya=" + aya_num + 
				" title='" + aya_num + "' " + 
				" href=\"javascript:ac(" + sura_num + "," + aya_num + ")\">" +
				indicator + 
				"</a>";
	}
	//alert(chart);
	return chart;
}


function openControlPanel(nSura)
{
	if( !nSura ){
		nSura = 1;
	}

	window.open("a.htm?s=" + nSura + "&a=1","aya","scrollbars=no,resizable=no,menubar=no,toolbar=no,location=no,width=340,height=225");
}

var gLoadingWindow;

function LoadTahfeez(sOnResponse)
{
	if (getCookie("sync") == "1")
		return false;

	if( getCookie("chg") == "1" ){
		SaveTahfeez();
		return false;
	}

	var id = getCookie("id");
	var user = getCookie("user");

	if( id.length > 0 )
	{
		//gLoadingWindow = window.open("loading.htm", "loading", "height=100,width=400,location=no,menubar=no,toolbar=no,resizable=no,scrollbars=no");
		
		gLoadingWindow = openPopupWindow(20,5,200,50,"<h3 style='color:green' dir=RTL>تحميل بيانات التحفيظ ...</h3>");

		//document.body.startDownload( "/cgi-bin/loadmem.pl?id=" + id + "&user=" + user , onLoadTahfeez );
		LoadData( "http://cgi.muslim-web.com/cgi-bin/loadmem.pl?id=" + id + "&user=" + user, "onLoadTahfeez(gDataResponse);" + ( sOnResponse ? sOnResponse : "" ));
		return true;
	}

	return false;
}

function onLoadTahfeez(data)
{
	//alert(data);
	var xmlDoc = LoadXMLDoc( data );
	
	if( xmlDoc )
	{
		var xmlOpt = xmlDoc.selectSingleNode( "/*" );
		
		if (xmlOpt)
		{
			var success = xmlOpt.getAttribute( "success" ); 
			var mem = xmlOpt.getAttribute( "memorize" );
			var memb = xmlOpt.getAttribute("pending_memorize");

			if (success == "1")
			{
				window.setTimeout("if(gLoadingWindow){gLoadingWindow.hide();gLoadingWindow=null;}", 1000);

				document.cookie = "sync=1"; // mark this session as synchronizes

				setCookie ( "user", xmlOpt.getAttribute( "login_id" ) );
				setCookie ( "id", xmlOpt.getAttribute( "id" ) );

				if(getCookie("mem") != mem || getCookie("memb") != memb )
				{
					setCookie ("mem", mem, true);
					setCookie ("memb", memb, true);
					//window.top.location.reload();
				}
				
				return "";
			}
			else
			{
					if(!gLoadingWindow) {
					gLoadingWindow = openPopupWindow(20,5,200,50);
				}

				gLoadingWindow.document.body.innerHTML = "<h3>Login Error: " + xmlOpt.getAttribute( "error" ) + "</h3>";
				//alert(xmlDoc.xml);
				
				return xmlOpt.getAttribute("error");
			}
		}
		else
		{ // report error
			if(!gLoadingWindow) {
				gLoadingWindow = openPopupWindow(20,5,200,50);
			}

			gLoadingWindow.document.body.innerHTML = "<h3>Loading Error: unable to sync with database</h3>";
		}
	}
	
	return "Error Loading Data";
}

var gSavingWindow;

function SaveTahfeez()
{
	var id = getCookie("id");

	if (id.length > 0)
	{
		var mem  = getCookie("mem");
		var memb = getCookie("memb");

		setCookie("chg", "1");
		
		gSavingWindow = openPopupWindow(20,5,200,50,"<h3 style='color:red' dir=RTL>تخزين بيانات التحفيظ</h3>");

		//document.body.startDownload("cgi-bin/savemem.pl?id=" + id + "&mem=" + mem + "&memb=" + memb , onSaveTahfeez );
		LoadData( "http://cgi.muslim-web.com/cgi-bin/savemem.pl?id=" + id + "&mem=" + mem + "&memb=" + memb, "onSaveTahfeez(gDataResponse)" );
	}
	else
	{// open login dialog box
	}
}

function onSaveTahfeez(data)
{
	var xmlInfo = LoadXMLDoc(data, "/*");

	if (xmlInfo.getAttribute("success") == "1")
	{
		setCookie("chg", "0");
		window.setTimeout("if(gSavingWindow){gSavingWindow.hide();gSavingWindow=null;}", 1000);
	}
	else
	{
		if(!gSavingWindow) {
			gSavingWindow = openPopupWindow(20,5,200,50);
		}
		
		gSavingWindow.document.body.innerHTML = "<h3>Saving Error: " + xmlInfo.getAttribute("error") + "</h3>";
	}
}
function suraMemPercent(mysura)
{

	gMemorizedInfo = GetMemorizedInfo();
	
	mem_suras = gMemorizedInfo.split('$');
	
	if (mem_suras[mysura].length == 0)
		return 0;

	mem_ayas  = mem_suras[mysura].split('|');

	percent   = Math.round( (mem_ayas.length) * 10000 / VerseNoInSoura[mysura])/100;
	
	return percent;
}

function AllSuraMemPercent(bNoCache)
{
	var retArray = [];

	gMemorizedInfo = GetMemorizedInfo(bNoCache);
	
	mem_suras = gMemorizedInfo.split('$');
	
	for (i=0;i<114 ; i++)
	{
		if (mem_suras[i+1].length > 0)
		{
			mem_ayas  = mem_suras[i+1].split('|');

			retArray[i]   = Math.round( (mem_ayas.length) * 10000 / VerseNoInSoura[i+1])/100;
		}
		else
		{
			retArray[i] = 0;
		}
	}
	
	return retArray;
}


function totalMem()
{
	return countAyat("mem");
}
function totalBending()
{
	return countAyat("memb");
}

function quranMemPercent()
{
	var percent = Math.round( totalMem() * 10000 / totalAyat() ) /100;
	return percent; 
}

function countAyat(param)
{
	var myCount=0;

	gMemorizedInfo = GetMemorizedInfo();
	
	mem_suras = gMemorizedInfo.split('$');
	
	for (i=1;i<mem_suras.length;i++)
	{
		if (mem_suras[i].length)
		{
			mem_ayat  = mem_suras[i].split('|');
			myCount  += mem_ayat.length;
		}
	}
	return myCount;
}

function GetMemorizedInfo( no_cache )
{
	if( !no_cache && gMemorizedInfo ){
		return gMemorizedInfo;
	}

	gMemorizedInfo = uncompressMem( readCookie( "mem" ) );

	return gMemorizedInfo;
}

function GetPendingInfo( no_cache )
{
	if( !no_cache && gPendingInfo ){
		return gPendingInfo;
	}

	gPendingInfo = uncompressMem( readCookie( "memb" ) );

	return gPendingInfo;
}