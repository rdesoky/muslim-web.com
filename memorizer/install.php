<?php
// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: kobool
// File: 'install.php' 
// 
require_once 'facebook.php';
$appapikey = 'e490d16e4685507b8be762ea836c82ef';
$appsecret = '6f63a0c583757629441851220e59ae20';
$facebook = new Facebook($appapikey, $appsecret);

$user_id = $facebook->require_install();
unset $facebook;
?>
