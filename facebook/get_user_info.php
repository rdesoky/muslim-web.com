<?php
header('Content-type: text/plain');
// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: memorizer
// File: 'save_user_info.php' 
require_once 'facebook.php';
$appapikey = '1b855cfb9c635fb59916538e46807437';
$appsecret = '7d450618c6389f17640743f6756b86f3';
$facebook = new Facebook($appapikey, $appsecret);
$user_id = $facebook->get_loggedin_user();
//$user_id = $facebook->require_login();
//$user_id = $facebook->require_install();
$info = "{lvl:0,score:0,total:0}";

$debug = "";//"alert('$info');";

if(!$user_id){
	unset( $facebook );
	exit( "jsr={success:0, info_id:" . $_REQUEST['id']. ", info:{}, user_id:\"$user_id\", error:\"not logged in\"};$debug" . $_REQUEST['jsp']);
}

//$info = $facebook->api_client->data_getUserPreference($_REQUEST['id']);

//if(!$info){
//	$info = "{lvl:0,score:0,total:0}";
//}


unset($facebook);

$link = mysql_connect('localhost', 'root', 'kobool_2004') or die('Could not connect: ' . mysql_error());

if( mysql_select_db( 'quran', $link ) )
{
	$today = date("Y-m-d");

	$members_result		= mysql_query( "SELECT * FROM members where login_id='$user_id'" );
	$memorizer_result	= mysql_query( "SELECT * FROM memorizer where user_id='$user_id' and mem_date='$today'" );

	$memorizer_info = mysql_fetch_assoc( $memorizer_result );
	$member_info	= mysql_fetch_assoc( $members_result   );
	
	if( !$member_info )
	{
		$member_info = array(mem_level=>0);
	}

	if( !$memorizer_info ){
		$memorizer_info = array(mem_words=>0,total_words=>0);
	}

	$info="{lvl:" . $member_info["mem_level"] . ",score:" . $memorizer_info["mem_words"] . ",total:". $memorizer_info["total_words"] . "}";

	mysql_free_result( $memorizer_result );
	mysql_free_result( $members_result );
	
}
mysql_close($link);

echo "jsr={success:1, info_id:" . $_REQUEST['id']. ", user_id:\"$user_id\", info:" . $info . "};$debug" . $_REQUEST['jsp'];


//foreach( $_GET as $param_name=>$param_value){
//	echo $param_name . "=" . $param_value . "<br>\n";
//}

//foreach( $_GET as $param_name => $param_value){
//	echo $param_name . "<br>\n";
//}

?>



