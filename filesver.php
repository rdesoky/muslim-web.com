<?php

$host = "local";

include( "host_info.php" );

$PageMapVersion = "1";

$img_host = isset($img_host) ? $img_host : "";
$app_root = isset($app_root) ? $app_root : dirname($_SERVER["SCRIPT_NAME"] . "x");

$tafseer_base = "cgi-bin/get_taf2.pl?/tafseer/";
$stext_host = "cgi-bin/js_get_html.pl?";

//$stext_host = "http://www.egylist.com/quran/js_get_html.pl?/quran";

$qpages_host	= "http://www.egylist.com/quran/getimg.pl?/quran"; //godaddy.com
$tafseer_base	= "http://www.egylist.com/quran/get_taf2.pl?/quran/tafseer/";
$stext_host		= "http://www.egylist.com/quran/js_get_html.pl?/quran";
//$cgi_base		= $pg_map_base = $js_loader_base = "http://cgi.muslim-web.com/cgi-bin/";


$cgi_base = isset($cgi_base) ? $cgi_base : "http://cgi.muslim-web.com/cgi-bin/";
$js_loader_base	= $pg_map_base = $cgi_base;
//$qpages_host = "cgi-bin/getimg.pl?";
//$qpages_host = "";
//$tafseer_base= $cgi_base . "get_taf2.pl?/tafseer/";
$scr_host 	 = isset($scr_host) ? $scr_host : "";
$css_host 	 = isset($css_host) ? $css_host :  "";
$str_host = isset($str_host) ? $str_host : "";

$curr_host = getenv("HTTP_HOST");

function PathDirectory(){
	return dirname($_SERVER["SCRIPT_NAME"] . "x");
}

function FileAbsPath( $path ){
	return realpath( $_SERVER["DOCUMENT_ROOT"] . "/" . PathDirectory() . "/" . $path );
}

function FileDate( $path ){
	$abs_path = FileAbsPath( $path );
	return date( "Ymd.hms", filemtime( $abs_path ));
}

function FileVerParam( $path, $delmtr = "?"){
	if($_SERVER["SERVER_NAME"] == "localhost"){
		return "";
	}
	return $delmtr . "v=" . FileDate($path);
}

function CacheURL($path){
	return $path . FileVerParam($path);
}

$FV = array (
	'gStrings'			=>	$str_host . "js_strings.php?lang=$lang" . FileVerParam( $str_host . $lang . "_strings.php", "&" ),

	'swfobject'			=>	CacheURL($scr_host . "js/common/swfobject.js"),
	'JCKeyboard'		=>	CacheURL($scr_host . "js/common/JCKeyboard.js"),
	'JCSettings'		=>	CacheURL($scr_host . "js/common/JCSettings.js"),
	'ScriptLoader'		=>	CacheURL($scr_host . "js/common/ScriptLoader.js"),
	'JCSpinEdit'		=>	CacheURL($scr_host . "js/common/JCSpinEdit.js"),
	'jclass'			=>	CacheURL($scr_host . "js/common/jclass.js"),
	'utils'				=>	CacheURL($scr_host . "js/common/utils.js"),
	'JCShowHideSwitcher'=>	CacheURL($scr_host . "js/common/JCShowHideSwitcher.js"),
	'JCDragDrop'		=>	CacheURL($scr_host . "js/common/JCDragDrop.js"),
	'JCTabs'			=>	CacheURL($scr_host . "js/common/JCTabs.js"),

	'MemApp'			=>	CacheURL($scr_host . "js/quran/exercise.js"),
	'PageMp3Player'		=>	CacheURL($scr_host . "js/quran/PageMp3Player.js"),
	'PageMap'			=>	CacheURL($scr_host . "js/quran/PageMap.js"),
	'JCQuranViewer'		=>	CacheURL($scr_host . "js/quran/JCQuranViewer.js"),
	'qsearch'			=>	CacheURL($scr_host . "js/quran/qsearch.js"),
	'home'				=>	CacheURL($scr_host . "js/quran/home.js"),
	'qdata'				=>	CacheURL($scr_host . "js/quran/qdata.js"),
	'audio_data'		=>	CacheURL($scr_host . "js/quran/audio_data.js"),
	'ar_qstrings'		=>	CacheURL($scr_host . "js/quran/ar_qstrings.js"),
	'en_qstrings'		=>	CacheURL($scr_host . "js/quran/en_qstrings.js"),
	'lib'				=>	CacheURL($scr_host . "js/quran/lib.js"),
	'qlib'				=>	CacheURL($scr_host . "js/quran/qlib.js"),
	'tlib'				=>	CacheURL($scr_host . "js/quran/tlib.js"),
	'xml_loader'		=>	CacheURL($scr_host . "js/quran/xml_loader.js"),
	'reciter'			=>	CacheURL($scr_host . "js/quran/reciter.js"),
	'sheader'			=>	CacheURL($scr_host . "js/quran/sheader.js"),
	'JCSuraCell'		=>	CacheURL($scr_host . "js/quran/JCSuraCell.js"),
	'JCSuraViewer'		=>	CacheURL($scr_host . "js/quran/JCSuraViewer.js"),
	'sura'				=>	CacheURL($scr_host . "js/quran/sura.js"),
	'menu'				=>	CacheURL($scr_host . "js/quran/menu.js"),

	'base_css'			=>	CacheURL($css_host . "css/quran/base.css"),
	'index_css'			=>	CacheURL($css_host . "css/quran/index.css"),
	'sheader_css'		=>	CacheURL($css_host . "css/quran/sheader.css"),
	'reciter_css'		=>  CacheURL($css_host . "css/quran/reciter.css"),
	'sura_css'			=>	CacheURL($css_host . "css/quran/sura.css"),

	'memorizer_css' 	=>	CacheURL($css_host . "css/quran/memorizer.css"),
	'menu_css'			=>	CacheURL($css_host . "css/menu.css"),
	'keyboard_css'		=>	CacheURL($css_host . "css/keyboard.css"),
	'spin_edit_css' 	=>	CacheURL($css_host . "css/spin_edit.css"),
	'chelp_css'	 		=>	CacheURL($css_host . "css/chelp.css")
);
?>