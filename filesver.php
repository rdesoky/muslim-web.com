<?php

$host = "local";

include( "host_info.php" );

$PageMapVersion = "1";

$img_host = "";

$tafseer_base = "cgi-bin/get_taf2.pl?/tafseer/";
$stext_host = "cgi-bin/js_get_html.pl?";

//$stext_host = "http://www.egylist.com/quran/js_get_html.pl?/quran";

$v = "&v";
$qpages_host	= "http://www.egylist.com/quran/getimg.pl?/quran";//godaddy.com
$tafseer_base	= "http://www.egylist.com/quran/get_taf2.pl?/quran/tafseer/";
$stext_host		= "http://www.egylist.com/quran/js_get_html.pl?/quran";
$cgi_base		= $pg_map_base = $js_loader_base = "http://cgi.muslim-web.com/cgi-bin/";

//$curr_host = getenv("HTTP_HOST");
if( $host == "godaddy" )
{
	$scr_host		= "http://gd.muslim-web.com/js.php?file=";
	$css_host		= "http://gd.muslim-web.com/css.php?file=";//ix.muslim-web.com
	$v = "&v";

//	$img_host = "http://gd.muslim-web.com";
//	$tafseer_base = "http://ixweb.muslim-web.com/cgi-bin/get_taf.pl?/tafseer/";
}elseif( $host == "ixweb" ){
	$scr_host		= "http://ix.muslim-web.com/";
	$css_host		= "http://ix.muslim-web.com/";//ix.muslim-web.com
	$v = "?v";
}elseif($host == "izap"){
	$scr_host		= "http://ix.muslim-web.com/";
	$css_host		= "http://ix.muslim-web.com/";//ix.muslim-web.com
	$v = "?v";
}else{// localhost
	$cgi_base = $js_loader_base	= "cgi-bin/";
	$pg_map_base = "http://new.muslim-web.com/cgi-bin/";
	$qpages_host = "cgi-bin/getimg.pl?";
	$tafseer_base= "cgi-bin/get_taf2.pl?/tafseer/";
	$scr_host 	 = "/";
	$css_host 	 = "/";
	$v = "?v";
}

$curr_host = getenv("HTTP_HOST");

//if( false !== strpos( $curr_host, "new" ) ){
//	$scr_host = "/";
//	$css_host = "/";
//	$v = "?v";
//}

$FV = array (
	'gStrings'			=>	"/js_strings.php?lang=$lang&v=20100725",

	'swfobject'			=>	$scr_host . "js/common/swfobject.js$v=20100628",
	'JCKeyboard'		=>	$scr_host . "js/common/JCKeyboard.js$v=20100721",
	'JCSettings'		=>	$scr_host . "js/common/JCSettings.js$v=20100423",
	'ScriptLoader'		=>	$scr_host . "js/common/ScriptLoader.js$v=20100422",
	'JCSpinEdit'		=>	$scr_host . "js/common/JCSpinEdit.js$v=20100721",
	'jclass'			=>	$scr_host . "js/common/jclass.js$v=20090214",
	'utils'				=>	$scr_host . "js/common/utils.js$v=20120524",
	'JCShowHideSwitcher'=>	$scr_host . "js/common/JCShowHideSwitcher.js$v=20100424",
	'JCDragDrop'		=>	$scr_host . "js/common/JCDragDrop.js$v=20080812",
	'JCTabs'			=>	$scr_host . "js/common/JCTabs.js$v=20120518",

	'MemApp'			=>	$scr_host . "js/quran/exercise.js$v=20120612",
	'PageMp3Player'		=>	$scr_host . "js/quran/PageMp3Player.js$v=20120520",
	'PageMap'			=>	$scr_host . "js/quran/PageMap.js$v=20120823.1",
	'JCQuranViewer'		=>	$scr_host . "js/quran/JCQuranViewer.js$v=20120605",
	'qsearch'			=>	$scr_host . "js/quran/qsearch.js$v=20100701",
	'home'				=>	$scr_host . "js/quran/home.js$v=20120719",
	'qdata'				=>	$scr_host . "js/quran/qdata.js$v=20100703",
	'audio_data'		=>	$scr_host . "js/quran/audio_data.js$v=20100711",
	'ar_qstrings'		=>	$scr_host . "js/quran/ar_qstrings.js$v=20100213",
	'en_qstrings'		=>	$scr_host . "js/quran/en_qstrings.js$v=20100123",
	'lib'				=>	$scr_host . "js/quran/lib.js$v=20100425",
	'qlib'				=>	$scr_host . "js/quran/qlib.js$v=20100701",
	'tlib'				=>	$scr_host . "js/quran/tlib.js$v=20100722",
	'xml_loader'		=>	$scr_host . "js/quran/xml_loader.js$v=20080812",
	'reciter'			=>	$scr_host . "js/quran/reciter.js$v=20100226.1",
	'sheader'			=>	$scr_host . "js/quran/sheader.js$v=20110629.1",
	'JCSuraCell'		=>	$scr_host . "js/quran/JCSuraCell.js$v=20100630",
	'JCSuraViewer'		=>	$scr_host . "js/quran/JCSuraViewer.js$v=20100213",
	'sura'				=>	$scr_host . "js/quran/sura.js$v=20110611",
	'menu'				=>	$scr_host . "js/quran/menu.js$v=20100516",

	'base_css'			=>	$css_host . "css/quran/base.css$v=20120612",
	'index_css'			=>	$css_host . "css/quran/index.css$v=20170619",
	'sheader_css'		=>	$css_host . "css/quran/sheader.css$v=20100428",
	'reciter_css'		=>  $css_host . "css/quran/reciter.css$v=20100426",
	'sura_css'			=>	$css_host . "css/quran/sura.css$v=20100414.2",

	'memorizer_css' 	=>	$css_host . "css/quran/memorizer.css$v=20120606",
	'menu_css'			=>	$css_host . "css/menu.css$v=20100507",
	'keyboard_css'		=>	$css_host . "css/keyboard.css$v=20100524",
	'spin_edit_css' 	=>	$css_host . "css/spin_edit.css$v=20090716",
	'chelp_css'	 		=>	$css_host . "css/chelp.css$v=20120808"
);
?>