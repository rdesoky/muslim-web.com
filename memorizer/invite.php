<div style="padding:10px">
<?php
// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: kobool
// File: 'index.php' 
//   This is a sample skeleton for your application. 
// 
require_once 'facebook.php';
$appapikey = 'e490d16e4685507b8be762ea836c82ef';
$appsecret = '6f63a0c583757629441851220e59ae20';
$facebook = new Facebook($appapikey, $appsecret);

//$user_id = $facebook->get_loggedin_user();
$user_id = $facebook->require_login();
//$user_id = $facebook->require_install();

$lang = $_GET['lang'] ? $_GET['lang'] : $_COOKIE['lang'];
$other_lang = ($lang == "ar") ? "en" : "ar";
?>
<fb:fbml>

	<fb:header decoration="no_padding">Quran Memorizer</fb:header> 
	<div>&nbsp;</div>

	<fb:tabs>
		<fb:tab-item href="http://apps.facebook.com/memorizer" title="<?=($lang=='ar')?'مدرب الحفظ':'Memorizer'?>" />
		<fb:tab-item href='http://apps.facebook.com/memorizer/invite.php' title='Invite Friends' selected="true"/>
		<fb:tab-item href="http://apps.facebook.com/memorizer/?lang=<?=$other_lang?>" title="<?=($other_lang=='ar')?'عربي':'English'?>" />
	</fb:tabs>

	<fb:request-form 
		action="" 
		method="POST" 
		invite="true" 
		type="Quran Memorizer" 
		content="Memorize Quran and strengthen your memory and Arabic typing skills."
	>

	<fb:multi-friend-selector 
		showborder="false" 
		actiontext="Invite your friends to use Quran Memorizer."/>

	</fb:request-form>
</fb:fbml>
