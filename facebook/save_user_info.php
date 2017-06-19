<?php
// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: memorizer
// File: 'save_user_info.php' 

$lang = $_GET['lang'] ? $_GET['lang'] : ( $_COOKIE['lang'] ? $_COOKIE['lang'] : "en" );
require $lang . '_strings.php';
include 'mem_lib.php';

header('Content-type: text/plain');
require_once 'facebook.php';
$appapikey = '1b855cfb9c635fb59916538e46807437';
$appsecret = '7d450618c6389f17640743f6756b86f3';
$facebook = new Facebook($appapikey, $appsecret);
$user_id = $facebook->get_loggedin_user();
//$user_id = $facebook->require_login();
//$user_id = $facebook->require_install();

if(!$user_id){
	unset( $facebook );
	exit( "jsr={success:0, user_id:\"$user_id\", error:\"not logged in\"};" . GetParam("jsp",";") );
}

$total_words	= $_REQUEST['total_words'];
$mem_words		= $_REQUEST['mem_words'  ];
$mem_level		= $_REQUEST['mem_level'  ];
$reset			= $_REQUEST['reset'];

if( $reset == "1" )
{
	$total_words = $mem_words = 0;
}

if( $reset == "1" || isset( $total_words ) || isset ( $mem_level ) )
{
	$link = mysql_connect('localhost', 'root', 'kobool_2004') or die('Could not connect: ' . mysql_error());

	if( mysql_select_db( 'quran', $link ) )
	{
		$today = date("Y-m-d");

		if( isset( $total_words ) )
		{
			$result = mysql_query( "SELECT * FROM memorizer where user_id='$user_id' and mem_date='$today'" );
			
			if( mysql_num_rows($result) > 0 )
			{
				if( $reset == "1" ) 
				{
					mysql_query( "update memorizer set mem_words=0, total_words=0 where user_id='$user_id' and mem_date='$today'" );
				}
				else
				{
					mysql_query( "update memorizer set mem_words=mem_words+$mem_words, total_words=total_words+$total_words where user_id='$user_id' and mem_date='$today'" );
				}
			}
			else
			{
				mysql_query( "INSERT INTO memorizer ( user_id,mem_date,mem_words,total_words ) values('$user_id', '$today', $mem_words, $total_words )" );
			}

			mysql_free_result($result);
		}

		if( isset ( $mem_level ) )
		{
			$result = mysql_query( "SELECT * FROM members where login_id='$user_id'" );

			if( mysql_num_rows($result) > 0 )
			{
				mysql_query( "update members set mem_level=$mem_level, date_updated='$today' where login_id='$user_id'" );
			}
			else
			{
				mysql_query( "insert into members (login_id, mem_level, date_created, date_updated) values('$user_id', $mem_level, '$today', '$today')" );
			}

			mysql_free_result($result);
		}
	}
	mysql_close($link);
}

$facebook->api_client->profile_setFBML( '', $user_id, ComposeProfileFBML($user_id) );

unset($facebook);

echo "jsr={success:1, user_id:\"$user_id\"};" . GetParam("jsp",";");

?>



