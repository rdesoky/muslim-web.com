
var gMemorizedInfo , gPendingInfo;


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

function memorizePendingRange(suraNo, startAya, endAya)
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

	//if (window.opener){
	//	window.opener.top.location.reload();
	//}

	SaveTahfeez();
}

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

function memorizeBending()
{
	memorizePendingRange(suraNo, ayaNo, document.myForm.toAya.value);
}

function memorize()
{
	memorizeRange (suraNo, ayaNo, parseInt(document.myForm.toAya.value) );

	WindowReload( 500 );

	if (window.opener){
		window.opener.top.location.reload();
	}

}

function unMemorizeSura(suraNo)
{
	unMemorizeRange(suraNo,1,QData.sura_info[suraNo-1].ac);

}

function memorizeSuraNo(suraNo)
{
	memorizeRange(suraNo,1,QData.sura_info[suraNo-1].ac);
	
}

function memorizeSura() // called from withen Control Panel
{
	memorizeSuraNo(suraNo);
	
	WindowReload(500);
	if (window.opener)
	{
		window.opener.top.location.reload();
	}

}

function memorizeSuraFromStart() // called from withen Control Panel
{
	memorizeRange (suraNo, 1, parseInt(document.myForm.toAya.value,10) );
	
	WindowReload(500);

	if (window.opener)
	{
		window.opener.top.location.reload();
	}
}

function unmemorize()
{
	unMemorizeRange (suraNo, ayaNo, document.myForm.toAya.value );

	WindowReload(500);
	if (window.opener)
	{
		window.opener.top.location.reload();
	}
}

function SuraMemChart( suraNum ){
	var types ={not_mem:0, mem:1, pend_mem:2};
	var retVal = "";
	var mem  = getCookie("mem","");
	var memb = getCookie("memb","");
	var smem = mem.length ? mem.split("$")[suraNum]:"";
	var smemb = memb.length ? memb.split("$")[suraNum]:"";
	var ranges = {};
	var total = QData.sura_info[suraNum-1].ac;
	
	var collectRanges = function( sData, rType ){
		if(!sData.length){
			return;
		}
		var parts = sData.split("|");
		for( var i=0;i<parts.length; i++){
			var part = parts[i];
			if(part.length){
				var partInfo = part.split(",");
				ranges[partInfo[0]] = {rtype: rType, rend: ToInt( (partInfo.length>1) ? partInfo[1] : partInfo[0] ) };
			}
		}
	};

	var fillEmptyRanges = function(){
		for( i=1; i<=total; i++){
			if( ranges[i]==undefined ){
				var rangeStart = i;
				while(true){
					if(i>=total || ranges[i+1]!=undefined){
						ranges[rangeStart]={rtype:types.not_mem,rend:i};
						break;
					}
					i++;
				}
			}else{
				i=ranges[i].rend;
			}
		}
	};

	var rangeWidth = function( start, end ){
		var width = (end-start+1) * 100 / total;
		return width.toString() + "%";
	};

	var rangeTitle = function( start, end, state ){
		return " title='" + _S.aya + ":" + start + " " + _S.to + ":" + end + " - " + (end-start+1).toString() + " " + _S.aya + "' ";
	};

	var rangeState = function( rtype ){
		switch(rtype)
		{
		case types.not_mem:
			return " state='no' ";
		case types.pend_mem:
			return " state='pnd' ";
		case types.mem:
			return " state='yes' ";
		}
	};

	collectRanges(smem, types.mem);
	collectRanges(smemb, types.pend_mem);
	fillEmptyRanges();
	var retVal = "";
	var rstart = 1;
	while( rstart <= total ){
		var range = ranges[rstart];
		retVal += "<span " + rangeState(range.rtype) + " " + rangeTitle(rstart, range.rend, "no" ) + " sura='" + suraNum + "' startAya='" + rstart + "' endAya='" + range.rend + "' style='width:" + rangeWidth(rstart, range.rend) + "'></span>";
		rstart = range.rend + 1;
	}

	return retVal;
}

function GetRangeContextMenu( info ){
	return [
		{ label:_S.recite, handler:"recite", context: QViewer.menuHandler.part ,info: info },
		{ label:_S.mem_review, handler:"review", context: QViewer.menuHandler.part, info: info },
		{ label:_S.writing_exercise, handler:"exercise", context: QViewer.menuHandler.part, info: info },
		{ label:_S.add_to_memorized, handler:"addMem", context: QViewer.menuHandler.part, info: info },
		{ label:_S.add_to_pending, handler:"addPending", context: QViewer.menuHandler.part, info: info },
		{ label:_S.delete_memorized, handler:"removeMem", context: QViewer.menuHandler.part, info: info },
		{ label:_S.copy_selected, handler:"copyText", context: QViewer.menuHandler.part, info: info }
	];
}
// old style chart
function getSuraMemChart( sura_num, mem_suras, bending_suras )
{
	var chart = "";

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

	for( aya_num=1; aya_num <= QData.sura_info[sura_num-1].ac; aya_num++ )
	{
		var aState = "not";
		if(nextMemAya == aya_num)
		{
			aState = "mem";

			if (mem_ayat.length > nextMemAyaIndex)
			{//
				nextMemAya = parseInt(mem_ayat[nextMemAyaIndex]);
				nextMemAyaIndex++;
			}
		}
		else if (nextBendAya==aya_num)
		{
			aState = "bnd";

			if (bend_ayat.length > nextBendAyaIndex)
			{
				nextBendAya = parseInt(bend_ayat[nextBendAyaIndex]);
				nextBendAyaIndex++;
			}
		}

		chart += "<span state=" + aState + 
				" s=" + sura_num + 
				" a=" + aya_num + 
				" title='" + aya_num + "' " + 
				">ا</span>";
	}

	return chart;
}

function LoadTahfeez(sOnResponse)
{
	if( getCookie("sync") == "1" )
		return false;

	return ReloadTahfeez(sOnResponse);
}

function ReloadTahfeez(sOnResponse)
{
	//if( getCookie("chg") == "1" ){
	//	SaveTahfeez();
	//	return false;
	//}

	var id = getCookie("id","");
	var user = getCookie("user","");

	if( id.length > 0 )
	{
		LoadData(
			"http://cgi.muslim-web.com/cgi-bin/loadmem.pl?id=" + id + "&user=" + user + "&t=" + (new Date()).getTime().toString(), 
			"onLoadTahfeez(gDataResponse);" + ( sOnResponse ? sOnResponse : "" )
		);
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
		var xmlOpt = xmlDoc.getElementsByTagName("*")[0];
		
		if (xmlOpt)
		{
			var success = xmlOpt.getAttribute( "success" ); 
			var mem = xmlOpt.getAttribute( "memorize" );
			var memb = xmlOpt.getAttribute("pending_memorize");

			if (success == "1")
			{
				//window.setTimeout("if(gLoadingWindow){gLoadingWindow.hide();gLoadingWindow=null;}", 1000);

				document.cookie = "sync=1"; // mark this session as synchronized

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

function SaveTahfeez()
{
	var id = getCookie("id","");

	if (id.length > 0)
	{
		var mem  = getCookie("mem","");
		var memb = getCookie("memb","");

		setCookie("chg", "1");
		
		//gSavingWindow = openPopupWindow(20,5,200,50,"<h3 style='color:red' dir=RTL>تخزين بيانات التحفيظ</h3>");

		//document.body.startDownload("cgi-bin/savemem.pl?id=" + id + "&mem=" + mem + "&memb=" + memb , onSaveTahfeez );
		LoadData( "http://cgi.muslim-web.com/cgi-bin/savemem.pl?id=" + id + "&mem=" + mem + "&memb=" + memb + "&t=" + (new Date()).getTime().toString(), 
				  "onSaveTahfeez(gDataResponse)" );
	}
	else
	{// open login dialog box
	}
}

function onSaveTahfeez(data)
{
	var xmlInfo = LoadXMLDoc(data, "*");

	if (xmlInfo.getAttribute("success") == "1")
	{
		setCookie("chg", "0");
		//window.setTimeout("if(gSavingWindow){gSavingWindow.hide();gSavingWindow=null;}", 1000);
	}
	else
	{
		//TODO: show error message
		//if(!gSavingWindow) {
		//	gSavingWindow = openPopupWindow(20,5,200,50);
		//}
		//gSavingWindow.document.body.innerHTML = "<h3>Saving Error: " + xmlInfo.getAttribute("error") + "</h3>";
	}
}

function SuraMemInfo( suraNum ){
	gMemorizedInfo = GetMemorizedInfo();
	
	mem_suras = gMemorizedInfo.split('$');
	
	return mem_suras[mysura];
}

function suraMemPercent(mysura)
{

	gMemorizedInfo = GetMemorizedInfo();
	
	mem_suras = gMemorizedInfo.split('$');
	
	if (mem_suras[mysura].length == 0)
		return 0;

	mem_ayas  = mem_suras[mysura].split('|');

	percent   = Math.round( (mem_ayas.length) * 10000 / QData.sura_info[mysura-1].ac)/100;
	
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

			retArray[i]   = Math.round( (mem_ayas.length) * 10000 / QData.sura_info[i].ac)/100;
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
	var percent = Math.round( totalMem() * 10000 / QData.ayatCount() ) /100;
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

function GetAyaStatus( suraNum , ayaNum ){
	var mem_info = GetMemorizedInfo();
	var mem_suras = mem_info.split('$');
	var mem_ayas  = mem_suras[suraNum].split('|');
	var info = mem_ayas.find(ayaNum.toString());
	if(info){
		return 1;// memorized
	}

	mem_info = GetPendingInfo();
	mem_suras = mem_info.split('$');
	mem_ayas  = mem_suras[suraNum].split('|');
	info = mem_ayas.find(ayaNum.toString());

	if(info){
		return 1;// pending
	}

	return false;
}

function GetMemorizedInfo( no_cache )
{
	if( no_cache || !gMemorizedInfo ){
		gMemorizedInfo = uncompressMem( readCookie( "mem","" ) );
	}
	return gMemorizedInfo;
}

function GetPendingInfo( no_cache )
{
	if( no_cache || !gPendingInfo ){
		gPendingInfo = uncompressMem( readCookie( "memb","" ) );
	}
	return gPendingInfo;
}