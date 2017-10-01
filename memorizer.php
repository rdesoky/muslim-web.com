<?php
// Application: kobool
require_once 'facebook.php';
$appapikey = 'e490d16e4685507b8be762ea836c82ef';
$appsecret = '6f63a0c583757629441851220e59ae20';
$facebook = new Facebook($appapikey, $appsecret);
//$user_id = $facebook->require_login();
//$user_id = $facebook->require_install();
$user_id = $facebook->get_loggedin_user();
?>

<html>
<meta http-equiv=Content-Type content="text/html; charset=windows-1256">

<script language="JavaScript" src="exercise.js?v=1"></script>
<script language="JavaScript" src="lib.js?v=8"></script>
<script language="JavaScript" src="qlib.js?v=11"></script>
<script language="JavaScript" src="class_akeys.js?v=2"></script>

<STYLE type="text/css">
	input, .sub_title{
		font-weight:bold;
		font-size:18px;
		font-family:traditional arabic;
	}
	*{
		font-family:tahoma;
		font-size:11px;
	}
	.aya_view{
		font-family:Traditional Arabic;
		font-size:26px;
		font-weight:bold;
		padding:2px;
	}
</style>

<body dir=RTL onload="OnBodyLoad()" style="margin:1px">

<table style="width:100%;background:#EEEEEE">
<tr>
	<td style="font-size:18px;font-weight:bold;width:100%" >
		<a href="http://quran.muslim-web.com" target=_blank class=sub_title>مدرب الحفظ</a>
	</td>
	<td style="font-size:12px" NOWRAP>مجال التدريب:</td>
	<td>
		<select id=idSelectSura onchange=onChangeSura()>
			<option selected value=0>جميع سور القرآن</option>

			<script language="JavaScript">
				var suraNo = parseInt(parameter("s"));

				for (a=1;a<=114;a++)
				{
					if(a==suraNo)
						document.write("<option selected value=" + a + ">" + a.toString() + " " + gSuraNames[a]);
					else
						document.write("<option value=" + a + ">" + a.toString() + " " + gSuraNames[a]);
				}
			</script>
		</select>
	</td>
	<td style="font-size:12px" NOWRAP>
			مستوى التدريب:
	</td>
	<td id=idByLevel>
			<select id=idSelectLevel onchange="ChangeLevel()"  style="z-index:0">
				<option>مبتدئ</option>
				<option>متوسط</option>
				<option>جيد</option>
				<option>متقدم</option>
				<option>ممتاز</option>
			</select>
		</span>
	</td>
	<td >
		<input type=button id=idAction style="height:30px;width:160px" value='ابدأ التدريب' onclick='StartExercise()'>
	</td>
</tr>
</table>

<div id=idAyaHeader style="FONT-FAMILY:Traditional Arabic;FONT-SIZE:26px;color:brown;text-align:center">&nbsp;</div>

<div id=idAyaDisplay class=aya_view style="border:solid 1px silver">
	<div id=idDescription style="width:100%;padding:6px" class=sub_title>
	يقوم  البرنامج بعرض  آية  قرآنية  عشوائيا لمدة زمنية تحدد حسب طول الآية في هذه الأثناء علي المتدرب ان يتذكر نص   لآية ثم يقوم  البرنامج باخفاء  الآية و يقوم  المتدرب بكتابة الآية من  ذاكرته ثم يضغط  (تم) عندئذ  يقارن  البرنامج نص  الآية مع  ما تم بكتابته ويخبر  المتدرب  بالنتيجة
	</div>
</div>

<div id=idUserAnswer style="display:none">
	<textarea type=edit id=idAnswer class="aya_view" style="overflow:visible;width:100%;color:blue;"></textarea>
</div>

<table cellpadding=0 cellspacing=0 width=100% height=50>
<tr>
	<td style="width:100%" >
		<table style="width:100%;display:none" id=AnswerButtons >
		<tr>
			<td><div style="width:100px">اكتب الآية من ذاكرتك</div></td>
			<td  style="width:100%;text-align:center">
				<input type=button value='تـــــم' onclick='CheckAnswer()' style="width:80px">
				<input type=button id=idGiveUp value='الغــــاء' onclick='CancelExercise()' style="width:80px">
			</td>
		</tr>
		</table>

		<div style="width:300px" id="eCounter" style="display:none">
			<span style="width:100px" NOWRAP id="eCountDown" style="FONT-SIZE:40px;FONT-WEIGHT:bold;color:red;">&nbsp;</span>
			<input type=button value='آية جديدة' onclick='StartExercise()' style="width:80px">&nbsp;
			<input type=button value='ابدأ الكتابة' onclick='CountDown(0)' style="width:80px">
		</div>

	</td>

	<td id=idScoreBoard >
		<div style="border-bottom:solid 1px silver">المستوى العام: <span id=idPercent  style="font-weight:bold">0</span>%</div>
		<table style="width:200px" cellspacing="0" cellpadding="0">
		<tr>
			<td width="100%">عدد المحاولات الناجحة: <span id=idScore style="font-weight:bold"></span> &nbsp;
				من 	<span id=idTotal style="font-weight:bold"></span>
			</td>
			<td><div onclick="ResetScore()" style="width:18px;height:18px;background:gray;color:white;text-align:center;font-weight:bold">x</div></td>
		</tr>
		</table>

	</td>
</tr>
</table>

<div id=idInstructions style="background:#EEEEEE;color:gray;padding:4px">
	<b>تعليمات:</b><br>
	* لا يلزم ان يقوم المتدرب بكتابة التشكيل<br>
	* للاستماع الى التلاوه يجب تحميل وتثبيت البرنامج  المجاني
	<a href=http://forms.real.com/netzip/getrde5_new_look.html?h=207.188.7.150&f=windows/RealOnePlayerV2GOLD.exe&p=RealOne+Player&j2re=false&tagtype=ie&type=dl target=_blank>Real Player (اضغط هنا للحصول على البرنامج)</a>
</div>
</body>
</html>