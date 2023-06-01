<?php
// Application: kobool
require_once 'facebook.php';
$appapikey = 'e490d16e4685507b8be762ea836c82ef';
$appsecret = '6f63a0c583757629441851220e59ae20';
$facebook = new Facebook($appapikey, $appsecret);
//$user_id = $facebook->require_login();
//$user_id = $facebook->require_install();
$user_id = $facebook->get_loggedin_user();

$language = $_GET['lang'] ? $_GET['lang'] : ( $_COOKIE['lang'] ? $_COOKIE['lang'] : "en" );

require $language . '_strings.php';

function EchoClientStrings( $server_src, $entries )
{
	$comma = "";
	foreach ( $entries as $str_id ) 
	{
		echo $comma . $str_id . ": \"" . $server_src[ $str_id ] . "\"";
		$comma = ", \n";
	}
}
$direction = ( $language == "ar" ) ? " dir=RTL " : " dir=LTR ";
?>

<html>
<meta http-equiv=Content-Type content="text/html; charset=windows-1256">
<link rel="StyleSheet" href="default.css">

<script language="JavaScript" src="exercise.js?v=1"></script>
<script language="JavaScript" src="lib.js?v=8"></script>
<script language="JavaScript" src="qlib.js?v=11"></script>

<script language="JavaScript">
var gStrings = {
	<?= EchoClientStrings( $str_table, 
							array(	"start_writing","new_aya", "write_aya", 
									"aya", "sura", "success_count", "retry", 
									"remaining_time", "loading_aya","correct_answer", 
									"wrong_answer", "source_text", "written_text"
								 )
						 ) 
	?> };
</script>


<body <?= $direction ?> onload="OnBodyLoad()" style="margin:1px">

<div style="width:100%;background:#EEEEEE;padding-top:10px">
	<table style="width:100%;">
	<tr>
		<td style="font-size:18px;font-weight:bold;width:100%" >
			<table>
			<tr>
				<td style="font-size:12px" NOWRAP><?=$str_table['training_src']?>:</td>
				<td>
					<select id=idSelectSura onchange=onChangeSura()>
						<option selected value=0><?=$str_table['whole_quran']?></option>

						<script language="JavaScript">
							var suraNo = parseInt(parameter("s"));

							for (a=1;a<=gSuraNames.length;a++)
							{
								if(a==suraNo)
									document.write("<option selected value=" + a + ">" + a.toString() + " " + gSuraNames[a]);
								else
									document.write("<option value=" + a + ">" + a.toString() + " " + gSuraNames[a]);
							}
						</script>
					</select>
				</td>
				<td style="font-size:12px" NOWRAP id="LevelTitle">
						<?=$str_table['training_level']?>:
				</td>
				<td id=idByLevel>
						<select id=idSelectLevel onchange="ChangeLevel()"  style="z-index:0">
							<option><?=$str_table['beginner']?></option>
							<option><?=$str_table['intermediate']?></option>
							<option><?=$str_table['good']?></option>
							<option><?=$str_table['advanced']?></option>
							<option><?=$str_table['excellent']?></option>
						</select>
					</span>
				</td>
			</tr>
			</table>
		</td>
		<td >
			<input type=button id=idAction style="height:30px;width:160px" value='<?=$str_table['start']?>' onclick='StartExercise()'>
		</td>
	</tr>
	</table>
</div>

<table style="width:100%">
<tr>
	<td id=idAyaHeader class=aya_title NOWRAP dir=RTL></td>
	<td style="width:100%"><span class=sub_title id="ActionTitle">&nbsp;</span></td>
</tr>
</table>

<div style="width:100%" dir=RTL>
	<div id=idAyaDisplay class="aya_view" style="padding:2px;border:solid 1px silver;display:none;color:green"></div>
	<textarea id="idAnswer" class="aya_view" style="display:none;padding:2px;overflow:visible;width:100%;color:blue;"></textarea>
</div>

<table cellpadding=0 cellspacing=0 width=100% height=50>
<tr>
	<td style="width:100%;" >
		<table id="idScoreBoard" style="display:none">
		<tr>
			<td style="padding:0px"><div onclick="ResetScore()" style="width:18px;height:18px;background:#EEEEEE;border:solid 1px silver;text-align:center;font-weight:bold">x</div>
			</td>
			<td style=""><?=$str_table['success_count']?>: <span id=idScore style="font-weight:bold"></span>&nbsp;
				<?=$str_table['from']?>:<span id=idTotal style="font-weight:bold"></span>
			</td>
			<td style="background:#EEEEEE"><?=$str_table['g_level']?>: <span id=idPercent  style="font-weight:bold">0</span>%</td>
		</tr>
		</table>

	</td>
	<td NOWRAP id=AnswerButtons style="display:none">
		<input type=button value='<?=$str_table['ok']?>' onclick='CheckAnswer()' style="width:80px">
		<input type=button id=idGiveUp value='<?=$str_table['cancel']?>' onclick='CancelExercise()' style="width:80px">
	</td>
	<td id="QuickStart" style="display:none">
		<input type="button" value='<?=$str_table['start_writing']?>' onclick='CountDown(0)' style="width:160px">
	</td>
	<td id="Retry" style="display:none">
		<input style="width:160px" type=button onclick='startMemorizing()' value='<?=$str_table['retry']?>'>
	</td>
</tr>
</table>

<div id="AyaActions" style="display:none;width:100%;background:#EEEEEE;border-top:solid 1px silver">
	<table >
	<tr>
		<td><a href="javascript:Explain_Aya()"><?=$str_table['explanation']?></a>&nbsp;|&nbsp;</td>
		<td><a href="javascript:Translate_Aya()"><?=$str_table['translation']?></a>&nbsp;|&nbsp;</td>
		<td><a href="javascript:Recite_Aya()"><?=$str_table['recitation']?></a></td>
	</tr>
	</table>
</div>

<div id=InfoFrame style="width:100%;display:none;border-top:solid 1px silver"></div>

<center dir=LTR id=KeyboardView style="display:none;padding:10px">
	<div style="padding-bottom:4px;color:brown">Your keyboard is now capable of writing Arabic text. <br>Press the keys as showing below to type Arabic letters or click them with the mouse. </div>
	<?php include "ar_keyboard.php" ?>
</center>

<div id=idInstructions style="border-top:solid 1px silver;color:gray;padding:4px;padding-top:10px"><?=$str_table['help']?>&nbsp;</div>

</body>
</html>