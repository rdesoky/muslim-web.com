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
?>
<fb:fbml>

	<fb:header decoration="no_padding">Quran Memorizer</fb:header> 
	<div>&nbsp;</div>

	<fb:tabs>
		<fb:tab-item href='http://apps.facebook.com/memorizer' title='Memorizer' />
		<fb:tab-item href='http://apps.facebook.com/memorizer/search.php' title='Search Quran' selected='true'/>
		<fb:tab-item href='http://apps.facebook.com/memorizer/invite.php' title='Invite Friends' />
	</fb:tabs>

	<div style="direction:RTL;padding:4px;background:#EEEEEE;width:100%">

	<form>
		Search For:<input type="text" name="q" value="<?=$_REQUEST['q'] ?>">
		<input type="submit" value="Search">
	</form>

	</div>

</fb:fbml>
