var gLang;
var gLoopCount, gRPlayer;
var gCurrPosition =-1;
var gCurrLength =-1;
var gSura,gAya;

function onBodyLoad()
{
	gLang = U.param("lang", "ar");

	gSura = parseInt( U.param("sura",0), 10 ) ;
	gAya = parseInt( U.param("aya",0), 10 );
	
	if( gSura > 0 ){
		//_E("idSuraName").innerHTML = gStrings.sura_names[gSura-1];
	}

	var selReciter = U.param("reciter", "");

	if( selReciter.length )
	{
		_E("idReciterName").innerHTML = _S.reciters[selReciter];
		document.title = _E("idReciterName").innerHTML + " - " + document.title;
	}


	gRPlayer = _E("idPlayer");

	if( gLoopCount	= _E("idPlayCount") ) 
	{
		InitDocObjects();
		gLoopCount.setValue( parseInt( getCookie("lpc","2"),10 ) );
		gLoopCount.getEditor().onchange = ApplyOptions;
		_E( "idReciteOptions_" + parseInt(getCookie("lp","0"),10) ).checked = true;
		ApplyOptions();
	}
}

var gRPlayerEventsHandler = {

	OnStateChange:function(oldState, newState)
	{
		switch( newState )
		{
		case 0: // stopped
			SetStatus( newState , "التلاوة متوقفة, <a href='javascript:' onclick='idPlayer.DoPlay()'>اضغط هنا</a> أو على زر التشغيل للإستماع" )
			return;
		case 1://  Contacting
			SetStatus( newState, _S.contacting_audio_server + ".." )
			return;
		case 2:// ' Buffering
		case 3:// ' Playing
		case 4:// ' Seeking
		default:
			SetStatus( newState );
		}
	},	
	OnPositionChange:function(nPos, nLength)
	{
		gCurrPosition	= nPos;
		gCurrLength		= nLength;
		
		SetStatus( 1, _S.player_running + 
			". (<a href='javascript:ResumeSound(gCurrPosition)'>" + 
				_S.click_if_disconnected + 
			"</a>)&nbsp;(<a href='javascript:Backward10Secs()'>" + _S.backward_10_sec + "</a>)" );
	}
};

function ClickOption(index){
	_E("idReciteOptions_" + index).focus();
	_E("idReciteOptions_" + index).checked=true;
	ApplyOptions();	
}

////////////////////////////////////////////////////////////////////
function ApplyOptions()
{
	if( _E("idReciteOptions_0").checked ){
		gRPlayer.SetLoop(0);
		gRPlayer.SetNumLoop(1);
		setCookie("lp",0);
	}else if( _E("idReciteOptions_1").checked ) {
		gRPlayer.SetLoop(1);
		gRPlayer.SetNumLoop(gLoopCount.getValue());
		setCookie("lp",1);
		setCookie("lpc",gLoopCount.getValue());
	}else{
		gRPlayer.SetLoop(1);
		gRPlayer.SetNumLoop(-1);
		setCookie("lp",2);
	}
}

function GetAyaInfo(nSuraNo, from, to)
{
	return _S.sura + _S.sura_names[parseInt(nSuraNo,10)] + 
			" - " + _S.from + " " + _S.aya + " (" + from + ")" + 
			" - " + _S.to + " " + _S.aya + " (" + to + ")";
}

function OpenAya()
{
	quranWindow = window.open("/sura/?s=" + (gSura+1).toString() + "&a=" + (gAya).toString() , "quran");
	quranWindow.focus();
}

function OpenQuran()
{
	quranWindow = window.open("/" , "quran");
	quranWindow.focus();
}

function ResumeSound(position)
{
	gRPlayer.DoStop();
	gRPlayer.DoPlay();
	var pos = position-10000;
	gRPlayer.SetPosition( pos > 0 ? pos : 0 );
}

function Backward10Secs()
{
	var pos = gCurrPosition - 10000;
	gRPlayer.SetPosition( pos > 0 ? pos : 0 );
}

function SetStatus( nStatus, sStatus )
{
	if( _EA("PlayerStatus","status") == nStatus )
	{
		return;
	}
	
	if( sStatus )
	{
		_E("PlayerStatus").innerHTML = sStatus;
	}

	_E("PlayerStatus").setAttribute("status", nStatus);
}

function GotoPage( pageNum ){
	try{
		if( window.opener && window.opener.QViewer && window.opener.QViewer.gotoPage ){
			window.opener.focus();
			window.opener.QViewer.gotoPage( pageNum );
			return;
		}
	}catch(e){
	}

	window.open("/sura/?s=" + gSura + "&p=" + pageNum, "quran").focus();
}

function GotoSura( suraNum ){
	try{
		if( window.opener && window.opener.QViewer && window.opener.QViewer.gotoSura ){
			window.opener.focus();
			window.opener.QViewer.gotoSura( suraNum );
			return;
		}
	}catch(e){
	}

	window.open("sura/?s=" + suraNum, "quran").focus();
}