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

	$appapikey = '1b855cfb9c635fb59916538e46807437';
	$appsecret = '7d450618c6389f17640743f6756b86f3';
	$facebook = new Facebook($appapikey, $appsecret);
	$user_id = $facebook->get_loggedin_user();

	if(!$user_id) {
		$user_id = "890570346";
		//unset( $facebook );
		//exit( "jsr={success:0, history:[], user_id:\"$user_id\", error:\"not logged in\"};$debug" . $_REQUEST['jsp']);
	}
	
	unset($facebook);
}


echo GetChartHTML( $user_id , 8 );

?>



