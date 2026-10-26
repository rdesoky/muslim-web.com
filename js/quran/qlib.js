function appRoot(){
	return gAppRoot || "";
}

function GetChapterProgress( nChapter, nPageNo )
{
	var startPage = QData.parts[nChapter].p;
	var endPage   = QData.parts[nChapter].ep;
	
	return ( ( nPageNo - startPage ) * 100 ) / ( endPage - startPage );
}

function GetSuraProgress( nSura, nPageNo )
{
	var startPage = QData.sura_info[nSura].sp;
	var endPage   = QData.sura_info[nSura].ep;
	
	return ( ( nPageNo - startPage ) * 100 ) / ( endPage - startPage );
}

var gsAyatImageURL = "http://www.elazhar.com/quran/image/";


function WindowReload( time )
{
	setTimeout( "window.location.reload()",time );
}

function DeleteRecentReciter( index )
{
	//var	lastReciter = readCookie("reciter","");
	var	lastReciter = CK.get("reciter","");
	
	var lastReciterList = lastReciter.split(",");
	
	lastReciterList = DeleteArrayElements( lastReciterList, index, 1 );

	writeCookie("reciter", lastReciterList.join(","));

	IReciters.showRecent();
}

function PushToRecentSuras( suraNum )
{
	var	lastSuras = readCookie("r_suras", "").split(",");

	for( var i=0;i<lastSuras.length;i++)
	{// remove it from the list 
		if(lastSuras[i] == suraNum)
		{
			lastSuras = DeleteArrayElements( lastSuras, i, 1 );
			i--;
		}
	}

	lastSuras.length = 15;

	writeCookie("r_suras", suraNum.toString(10) + "," + lastSuras.join(","));
}

function SaveCurrentReciter( id )
{
	var	lastReciter = CK.get("reciter","");
	
	var lastReciterList = lastReciter.split(",");

	for( var i=0;i<lastReciterList.length;i++)
	{// remove it from the list 
		if(lastReciterList[i] == id){
			lastReciterList = DeleteArrayElements( lastReciterList, i, 1 );
			i--;
		}
	}

	lastReciterList.length = 20 - 1;// remove the last one

	// add it to the top of the list
	CK.set( "reciter", id + "," + lastReciterList.join(","), true )
}

function openReciter( url, suraNum, reciter_id, pageNum )
{
	//PushToRecentSuras( suraNum );
	U.pushToCookieArray("r_suras", suraNum, 20);
	if(window.ISura){
		ISura.showRecent();
	}

	if(openReciter.wnd){
		try{
			openReciter.wnd.close();
		}catch(e){
		}
	}

	var newWindow = window.open (url, "telawa", "width=320,height=80");
	newWindow.focus();

	// if(openReciter.wnd){
	// 	openReciter.wnd.focus();
	// }
}

function GetSaveURL(suraIndex)
{
	var url;

	var suraNum = parseInt(suraIndex, 10) + 1;
	var selReciter = IReciters.activeReciter;//_EA("idReciter","sel");
	url = RecitersInfo[selReciter].url.replace( "%1%", suraNum.toString(10) );
	url = url.replace ( "%2%", NumToString(suraNum,3) );

	return url;
}

