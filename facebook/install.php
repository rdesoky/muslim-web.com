<?php
// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: kobool
// File: 'install.php' 
// 
require_once 'facebook.php';
$appapikey = '1b855cfb9c635fb59916538e46807437';
$appsecret = '7d450618c6389f17640743f6756b86f3';
$facebook = new Facebook($appapikey, $appsecret);

$user_id = $facebook->require_install();
unset $facebook;
?>
