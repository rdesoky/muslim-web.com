<div style="padding:10px">
<?php
// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: kobool
// File: 'index.php' 
//   This is a sample skeleton for your application. 
// 
require_once 'facebook.php';
$appapikey = '1b855cfb9c635fb59916538e46807437';
$appsecret = '7d450618c6389f17640743f6756b86f3';
$facebook = new Facebook($appapikey, $appsecret);

//$user_id = $facebook->get_loggedin_user();
//$user_id = $facebook->require_login();
$user_id = $facebook->require_install();

$lang = $_GET['lang'] ? $_GET['lang'] : ( $_COOKIE['lang'] ? $_COOKIE['lang'] : "en" );
$other_lang = ($lang == "ar") ? "en" : "ar";
require $lang . '_strings.php';

setcookie("lang", $lang, time() + ( 86400 * 365 ) );
?>
<fb:fbml>
	<fb:header decoration="no_padding">
		<a href="http://www.facebook.com/apps/application.php?id=38367928984">Tahfeez - تحفيظ</a>
	</fb:header> 
	<div>&nbsp;</div>
	<fb:tabs>
		<fb:tab-item href="?page=" title="<?=($lang=='ar')?'التدريب':'Exercising'?>" <?= $_GET["page"] == "" ? "selected='true'" : "" ?>/>
		<fb:tab-item href="?lang=<?=$other_lang?>" title="<?=($other_lang=='ar')? 'عربي' : 'English'?>" />
		<fb:tab-item href="?page=chart" title="<?=($lang=='ar')? 'رسم بياني' : 'Chart' ?>" <?= $_GET["page"] == "chart" ? "selected='true'" : "" ?> />
		<fb:tab-item href='?page=invite' title='Invite Friends' <?= $_GET["page"] == "invite" ? "selected='true'" : "" ?> />
	</fb:tabs>

<?php if( $_GET["page"] == "invite" ) { ?>

	<fb:request-form 
		action="" 
		method="POST" 
		invite="true" 
		type="Quran Memorizer - محفظ القرآن" 
		content= "Memorize Quran and strengthen your memory and Arabic typing skills. You will be able to type Arabic text using your keyboard even if it doesn't support it.<?php 
			echo htmlentities("<fb:req-choice url=\"http://apps.facebook.com/memorizer/\" label=\"Add Quran Memorizer\"") 
		?> "
	>

	<fb:multi-friend-selector 
		showborder="false" 
		actiontext="<?= $str_table["invite_title"] ?>"
	/>


	</fb:request-form>

<?php }else{ ?>
	<fb:iframe src="http://www.kobool.com/facebook/<?= ( $_GET["page"] == 'chart' ? 'mem_chart.php' : 'index.php' ) . '?lang=' . $lang ?>" 
		frameborder="0" 
		scrolling="auto" 
		smartsize 
		width="100%" 
		height="600"/>
<?php } ?>

</fb:fbml>
