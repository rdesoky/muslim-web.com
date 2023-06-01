<?php
require_once 'mem_lib.php';

header('Content-type: text/html');

$user_id = $_GET["user_id"];

// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: memorizer
// File: 'save_user_info.php' 
//$user_id = $facebook->require_login();
//$user_id = $facebook->require_install();

$debug = "";//"alert('$info');";

if(!$user_id){
	require_once 'facebook.php';

	$appapikey = 'e490d16e4685507b8be762ea836c82ef';
	$appsecret = '6f63a0c583757629441851220e59ae20';
	$facebook = new Facebook($appapikey, $appsecret);
	$user_id = $facebook->get_loggedin_user();

	if(!$user_id) {
		$user_id = "890570346";
		//unset( $facebook );
		//exit( "jsr={success:0, history:[], user_id:\"$user_id\", error:\"not logged in\"};$debug" . $_REQUEST['jsp']);
	}
	
	unset($facebook);
}


exit( GetChartHTML( $user_id , "200px" ) );

?>



