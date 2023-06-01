<?php
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
header('P3P:CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"');// For frame cookies

require_once "myfacebook.php";
include ( $lang = DetectLanguage() ) . '_strings.php';

$direction = ( $lang == "ar" ) ? " dir='RTL' " : " dir='LTR' ";

function GetStr( $strID ){
	global $str_table;
	return $str_table[$strID];
}

function EchoClientStrings( $server_src, $entries )
{
	$comma = "";
	foreach ( $entries as $str_id ) 
	{
		echo $comma . $str_id . ": \"" . $server_src[ $str_id ] . "\"";
		$comma = ", \n";
	}
}

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=8" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title><?= GetStr("exercise") ?></title>
	<link rel="StyleSheet" href="memorizer.css?v=20100720.1">

	<!-- script language="JavaScript" src="swfobject.js"></script -->
	<script language="JavaScript" src="swfobject.js"></script>
	<script language="JavaScript" src="mem_utils.js?v=20100720.1"></script>
	<script language="JavaScript" src="mp3player.js?v=20100710"></script>
	<script language="JavaScript" src="qdata.js?v=20100703"></script>
	<script language="JavaScript" src="exercise.js?v=20100721.2"></script>

	<script language="JavaScript">
	var str_table = {
		<?= EchoClientStrings( $str_table, 
								array(	"start", "start_writing","new_aya", "write_aya", 
										"aya", "sura", "success_count", "retry", 
										"remaining_time", "loading_aya","correct_answer", 
										"wrong_answer", "source_text", "written_text", "confirm_reset",
										"page"
									 )
							 ) 
		?> };
	</script>
</head>

<body <?= $direction ?> style="margin:1px">

	<? include("exercise.php") ?>

	<div id="FooterFrame" class="gradientV">
		<table style="width:100%">
		<tr>
			<td id="AyaActions" style="display:none;white-space:nowrap">
				<a href="javascript:MemAppUI.explainAya()"><?=GetStr('explanation')?></a>&nbsp;|&nbsp;
				<a href="javascript:MemAppUI.translateAya()"><?=GetStr('translation')?></a>
			</td>
			<td id="AudioPlayer" style="display:none;white-space:nowrap">
				&nbsp;|&nbsp;<a href="javascript:Mp3Player.play()"><?=GetStr("recitation")?></a>
			</td>
			<td style="width:100%"">&nbsp;<span id="flashContent"><a href="http://get.adobe.com/flashplayer/" target="_blank">Flash Player 8</a> or above is required to use audio features.</span>
			</td>
			<td style="white-space:nowrap">
				<table id="idScoreBoard" style="display:none">
				<tr>
					<td style="padding:0px"><div onclick="OC.scoreX(event)" style="cursor:pointer;width:18px;height:18px;background:#FFFFFF;border:solid 1px silver;text-align:center;font-weight:bold">x</div>
					</td>
					<td NOWRAP><?=GetStr('g_level')?>: 
						<span id="idPercent"  style="font-weight:bold">0</span>%
					</td>
				</tr>
				</table>
			</td>
		</tr>
		</table>
	</div>

	<div id="InfoFrame" style="display:none;"></div>

	<div dir="LTR" id="KeyboardView" style="border-bottom:solid 1px silver;display:none;padding:10px;text-align:center">
		<div style="padding-bottom:4px;color:brown">
			Your keyboard is now capable of writing Arabic text. <br>
			Press the keys as showing below to type Arabic letters or click them with the mouse. 
		</div>
		<?php include "ar_keyboard.php" ?>
	</div>

	<div id="idInstructions" style="color:gray;padding:4px;padding-top:10px">
		<?=GetStr('help')?>
	</div>
</body>
</html>