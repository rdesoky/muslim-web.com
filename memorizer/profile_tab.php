<?php
// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: kobool
// File: 'index.php' 
//   This is a sample skeleton for your application. 
// 
require_once 'myfacebook.php';

echo $facebook->api_client->profile_getFBML();

?>