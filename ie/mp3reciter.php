<?php
	require_once "ar_strings.php";
	
	$isIE = strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') ;
	
	$FlashVars = "$_REQUEST[url]&amp;autoplay=1&amp;showvolume=1";

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

		<title>شبكة المسلم</title>

		<link rel="StyleSheet" href="reciter.css?v=20080812"/>
		<link rel="StyleSheet" href="defaultstyle.css?v=20080812"/>
		<link rel="StyleSheet" href="/css/spin_edit.css?v=20090716"/>

		<script type="text/javascript" src="/js/common/ScriptLoader.js?v=20090214"></script>
		<script type="text/javascript">
			function Init()
			{
				ScriptLoader.loadScripts ( {
						QData:				"/js/quran/qdata.js",
						RecitersInfo:		"/js/quran/audio_data.js",
						gStrings:			"/js/quran/ar_qstrings.js",
						DefineJClass:		"/js/common/jclass.js?v=20090214",
						Utils:				"/js/common/utils.js?20090214",
						uncompressMem:		"lib.js?v=20080812",
						GetSaveURL:			"qlib.js?v=20080815",
						addAya:				"tlib.js?v=20080817",
						GetData:			"xml_loader.js?v=20080812",
						JCSpinEdit:			"/js/common/JCSpinEdit.js?v=20090215",
						onBodyLoad:			"reciter.js?v=20090716"
					},
					function(){
						U.setupCrossBrowser();
						onBodyLoad();
					} 
				);
			}
		</script>
	</head>

	<body onload="Init()">

		<div id="idAudioTitle">
			<span class='icon speaker'></span> <span class="text white_shadow">العرض الصوتي للقرآن </span>
		</div>

		<div style="padding:4px;font-size:18px">
			<span id="idSuraTag"><?=$Str["sura"]?>: </span><span id="idSuraName"></span>&nbsp;
			<span id="idReciterTag"><?=$Str["recite"]?>: </span><span id="idReciterName"></span>
		</div>
		<div style="padding-bottom:5px">
			<span id="idFromAyaTag"></span>
			<span id="idFromAya"></span>
			<span id="idToAyaTag"></span>
			<span id="idToAya"></span>
		</div>
		<object type="application/x-shockwave-flash" data="player_mp3_multi.swf" width="100%" height="50">
			<param name="movie" value="player_mp3_multi.swf" />
			<param name="FlashVars" value="mp3=<?=$FlashVars?>" />
		</object>

		<div><?=$FlashVars?></div>
	</body>
</html>

