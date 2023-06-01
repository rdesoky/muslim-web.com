<?php
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

include("qlib.php");
include("strings.php");
$lang = DetectLang();
include($lang . "_strings.php");
include("filesver.php");

$isIE = strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE');

$audio_url = $_REQUEST["url"];
$loop = $_REQUEST["loop"];

if (strpos($audio_url, ".rm") > 0) {
	$audio_url = "/cgi-bin/ram.pl?rm=$audio_url";
}

$suraNum = intval(GetParam("sura"));

?>
<!DOCTYPE html
	PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>

<head>
	<meta http-equiv="X-UA-Compatible" content="IE=8" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

	<title>muslim-web.com</title>

	<link rel="StyleSheet" href="<?= $FV['reciter_css'] ?>" />
	<link rel="StyleSheet" href="<?= $FV['defaultstyle'] ?>" />
	<link rel="StyleSheet" href="<?= $FV['spin_edit_css'] ?>" />

	<script type="text/javascript" src="<?= $FV['ScriptLoader'] ?>"></script>
	<script type="text/javascript" src="<?= $FV['reciter'] ?>"></script>
	<script type="text/javascript" src="/cgi-bin/counter.js.pl?p=reciter"></script>
	<script type="text/javascript">
		var bInit = false;
		window.onload = function () {
			ScriptLoader.loadScripts({
				gStrings: "<?= $FV['gStrings'] ?>&lang=<?= $lang ?>",
				QData: "<?= $FV['qdata'] ?>",
				RecitersInfo: "<?= $FV['audio_data'] ?>",
				DefineJClass: "<?= $FV['jclass'] ?>",
				Utils: "<?= $FV['utils'] ?>",
				uncompressMem: "<?= $FV['lib'] ?>",
				GetSaveURL: "<?= $FV['qlib'] ?>",
				addAya: "<?= $FV['tlib'] ?>",
				GetData: "<?= $FV['xml_loader'] ?>",
				JCSpinEdit: "<?= $FV['JCSpinEdit'] ?>",
				onBodyLoad: "<?= $FV['reciter'] ?>"
			},
				function () {
					bInit = true;
					U.setupCrossBrowser();
					onBodyLoad();
				}
			);
		}

	</script>
	<script type="text/vbscript">
			function idPlayer_OnStateChange(oldState, newState)
				if bInit then call gRPlayerEventsHandler.OnStateChange( oldState, newState )
			end Function
			function idPlayer_OnPositionChange(nPos, nLength)
				if bInit then call gRPlayerEventsHandler.OnPositionChange( nPos, nLength )
			end function
		</script>

</head>

<body lang="<?= $lang ?>">

	<div id="idAudioTitle">
		<span class='icon speaker'></span> <span class="text white_shadow">
			<?= GetStr("audio_player") ?>
		</span>
	</div>

	<table style="width:100%">
		<tr>
			<td id="idSuraTag" class="href" onclick="GotoSura(<?= $suraNum ?>)">
				<?= $Str["sura"] . " $suraNum" ?>: <span id="idSuraName">
					<?= $Str['sura_names'][$suraNum - 1] ?>
			</td>
			<td id="idReciterTag">
				<?= $Str["recite"] ?>: <span id="idReciterName"></span>
			</td>
			<?php
			$pageNum = GetParam("pg");
			if (isset($pageNum)) {
				echo "<td class='href' onclick='GotoPage($pageNum)'>" . GetStr("page") . ": $pageNum </td>";
			}
			?>
			<td>
				<input type="button" onclick="window.location.reload()" value="<?= $Str['replay'] ?>" />
			</td>
		</tr>
	</table>
	<div style="padding-bottom:5px">
		<span id="idFromAyaTag"></span>
		<span id="idFromAya"></span>
		<span id="idToAyaTag"></span>
		<span id="idToAya"></span>
	</div>

	<? if (!$isIE) { ?>
		<center>
			<? if (!$loop) { ?>
				<input type="button" onclick="window.location.replace(window.location.href + '&loop=1')"
					value="<?= GetStr("loop") ?>" />
			<? } else {
				echo GetStr("loop");
			}
			?>
		</center>
	<? } ?>

	<? if ($isIE) { ?>
		<table id="ReciterOptions">
			<tr>
				<td class="reciterOption" onclick="ClickOption(0)">
					<input type="radio" name="reciteoptions" id="idReciteOptions_0" onclick="ApplyOptions()" checked />
					<?= GetStr("play_one_time") ?>
				</td>
				<td class="reciterOption">
					<table onclick="ClickOption(1)">
						<tr>
							<td><input type="radio" name="reciteoptions" id="idReciteOptions_1" onclick="ApplyOptions()" /></td>
							<td>
								<?= GetStr("play_count") ?>: &nbsp;
							</td>
							<td><span id="idPlayCount" mClass="JCSpinEdit"></span></td>
						</tr>
					</table>
				</td>
				<td class="reciterOption" onclick="ClickOption(2)">
					<input type="radio" name="reciteoptions" id="idReciteOptions_2" onclick="ApplyOptions()" />
					<?= GetStr("continuous_play") ?>
				</td>
			</tr>
		</table>
	<? } ?>
	<div id="idRealPlayer" style="position:absolute;bottom:0px;width:100%">
		<? if ($isIE) { ?>
			<div id='PlayerStatus' status='0' style='padding:3px;height:24px;text-align:center'>
				<?= GetStr("contacting_audio_server") ?>..
			</div>

			<object tabindex='-1' id='idPlayer' type="audio/x-pn-realaudio-plugin"
				classid='clsid:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA'>
				<param name='_ExtentX' value='7276' />
				<param name='_ExtentY' value='1588' />
				<param name='autostart' value='1' />
				<param name='SHUFFLE' value='0' />
				<param name='PREFETCH' value='0' />
				<param name='SRC' value='<?= $audio_url ?>' />
				<param name='CONTROLS' value='ControlPanel,StatusBar' />
				<param name='CONSOLE' value='reciter' />
				<param name='LOOP' value='<?= $loop ? "1" : "0" ?>' />
				<param name='NUMLOOP' value='<?= $loop ? "-1" : "0" ?>' />
				<param name='CENTER' value='0' />
				<param name='MAINTAINASPECT' value='0' />
				<param name='BACKGROUNDCOLOR' value='#000000' />
			</object>
		<? } else {
			?>
			<embed id='RPlayerEmbed' autostart='true' loop="<?= $loop ? '1' : '0' ?>" numloop="<?= $loop ? '-1' : '0' ?>"
				controls='ControlPanel,StatusBar' console='reciter' type='audio/x-pn-realaudio-plugin' src='<?= $audio_url ?>' />
			<?
		}
		?>
	</div>
</body>

</html>