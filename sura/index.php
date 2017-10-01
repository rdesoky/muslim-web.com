<?php
// Sura Main Page

header("Cache-Control: max-age=0, s-maxage=0, no-cache, no-store"); // HTTP/1.1
#header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
include( "../qlib.php" );
include( "../strings.php" );


$lang = DetectLang();
$css_host = 
$scr_host = 
$str_host = 
$img_host = 
$cgi_base = $app_root = "../";

include( "../".$lang."_strings.php" );
include( "../filesver.php" );

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN">

<html>
	<head>
		<META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE"/>
		<meta http-equiv="X-UA-Compatible" content="IE=8" />
		<META http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title><?=$Str["holy_quran"]?></title>
		<link type="text/css" rel="stylesheet" href="<?=$FV['sheader_css']?>"/>
		<link type="text/css" rel="stylesheet" href="<?=$FV['base_css']?>"/>
		<link type="text/css" rel="stylesheet" href="<?=$FV['sura_css']?>"/>
		<link type="text/css" rel="stylesheet" href="<?=$FV['menu_css']?>"/>
		<script type="text/javascript" src="<?=$FV['ScriptLoader']?>"></script>
		<script type="text/javascript" src="http://cgi.muslim-web.com/cgi-bin/counter.js.pl?p=sura"></script>
		<script type="text/javascript">

			window.onload=function()
			{
				ScriptLoader.loadScripts ( {
						gStrings:				"<?=$FV['gStrings']?>",
						DefineJClass:			"<?=$FV['jclass']?>",
						Utils:					"<?=$FV['utils']?>",
						addAya:					"<?=$FV['tlib']?>",
						uncompressMem:			"<?=$FV['lib']?>",
						GetSaveURL:				"<?=$FV['qlib']?>",
						QData:					"<?=$FV['qdata']?>",
						RecitersInfo:			"<?=$FV['audio_data']?>",
						JCQuranViewer:			"<?=$FV['JCQuranViewer']?>",
						DisplaySuraHeaderInfo:	"<?=$FV['sheader']?>",
						initSura:				"<?=$FV['sura']?>",
						createMenu:				"<?=$FV['menu']?>",
						JCSettings:				"<?=$FV['JCSettings']?>"
					},function(){
						initHeader();
						initPage();
						_E("idIndex").innerHTML=SideIndex.getHTML();
					}
				);
			}

			var gPagesServer= "<?=$qpages_host?>"; 
			var gTafBase = "<?=$tafseer_base?>";
			var gSuraTextHost = "<?=$stext_host?>";
			var gImgHost = "<?=$img_host?>";
			var gAppRoot = "<?=$app_root?>";
			var gLang = "<?=$lang ?>";

		</script>
	</head>
	<body lang="<?=$lang?>">
		<div id="HeaderFrame">

			<table cellspacing="1" id="SuraTopMenuTable">
			<tr>
				<td class="imposed">
					<span class="home_link" onclick="window.location.href='../'"><?=GetStr("home")?></span>
				</td>

				<td class="imposed">
					<table cellspacing="0">
					<tr>
						<td id="idRecite">
							<span class="playBtn" onclick="reciteSura()">&nbsp;</span>&nbsp;
							<a class="saveBtn" id="idSaveURL">&nbsp;</a>
						</td>
						<td><div id="RecitersList">&nbsp;</div></td>
					</tr>
					</table>
				</td>

				<td align="center" width="100%" id="idTitle">
					<b><font face="Traditional Arabic" size="3"></font></b>
				</td>
				<td><input type="button" value="<?=GetStr('mem_review')?>" id="BtnReview" onclick="ToggleReviewMode()"></td>
				<td class="imposed">
					<div class="mem_chart">
						<div class='line_chart' id="idSMemChart">&nbsp;</div>
					</div>
				</td>
				<td class="imposed">
					<div class="mem_chart">
						<div class='line_chart' id="idQMemChart">&nbsp;</div>
					</div>
				</td>
			</tr>
			</table>

			<div class="suraChart"><?=GetStr("verses")?> [<span id="idMemChart">...</span>]</div>
			<div id="idPagesChart">&nbsp;</div>
		
		</div>

		<div id="idAyaPreview" style="display:none"></div>

		<table id=QuranViewer class="hidden">
		<tr>
			<td ><div class=pageHeader id=LeftPageHeader>&nbsp;</div></td>
			<td ><div class=pageHeader id=RightPageHeader>&nbsp;</div></td>
		</tr>
		<tr>
			<td class=leftSide id=LeftPage></td>
			<td class=rightSide id=RightPage></td>
		</tr>
		</table>
		
		<table id="SuraLayout" cellspacing="0" cellpadding="0"><tr>
			<td id="SideIndexContainer">
				<div style="overflow-y:auto;height:600px;width:120px;overflow-x:hidden;" id="idSideIndex" >
					<div id="SortPanel" class="listItem" onclick="changeSort()">
						<input id="CheckSort" type="checkbox"/>&nbsp;<span id="SortTitle" ><?=GetStr('sorted')?></span>
					</div>
					<div id="idIndex" style="padding-top:5px">&nbsp;</div>
				</div>
			</td>
			<td id="SuraFrameContainer">&nbsp;</td>
			<td id="TafseerFrame" style="display:none">
				<div id="TafHeader">
					<select onchange="Tafseer.chgSource(_E('SelTaf').value)" id="SelTaf">
						<option value=KATHEER><?=$Str["katheer"]?></option>
						<option value=GALALEEN><?=$Str["galaleen"]?></option>
						<option value=TABARY><?=$Str["tabary"]?></option>
						<option value=KORTOBY><?=$Str["kortoby"]?></option>
						<option value='ENGLISH'>English</option> 
						<option value='FRENSH'>Français</option> 
						<option value='GERMAN'>Deutsch</option> 
						<option value='TURKISH'>Turkish</option> 
						<option value='INDONEISAN'>Indoneisan</option> 
						<option value='MALAYU'>Malayu</option> 
					</select>
					<span class="arrowBtn right" onclick="Tafseer.prevAya()"></span>
					<span class="href" onclick="Tafseer.gotoAya()"><?=GetStr("aya")?>: <span id="TafAya">1</span></span>
					<span class="arrowBtn left" onclick="Tafseer.nextAya()"></span>
					<span class="button" onclick="Tafseer.close()"><?=$Str["close"]?></span>
				</div>

				<div id="TafseerData"><?=$Str["loading"]?>...</div>
			</td>
		</tr></table>
	</body>
</html>
