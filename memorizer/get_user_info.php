<?php
header('Content-type: text/javascript');
require_once 'myfacebook.php';

$facebook = new Facebook($appapikey, $appsecret);

$user_id = 0;

if (isset($_REQUEST['user_id'])) {
	$user_id = $_REQUEST['user_id'];
} else {
	$user_id = $facebook->get_loggedin_user();
}

//$user_id = "1460773565";

$info = "{lvl:0,score:0,total:0}";

$debug = ""; //"alert('$info');";

if (!$user_id) {
	unset($facebook);
	exit("jsr={success:0, info:{}, user_id:\"$user_id\", error:\"not logged in\"};$debug" . $_REQUEST['jsp']);
}

unset($facebook);

$link = mysql_connect('localhost', 'root', 'kobool_2004') or die('Could not connect: ' . mysql_error());

if (mysql_select_db('quran', $link)) {
	$today = date("Y-m-d");

	$members_result = mysql_query("SELECT * FROM members where login_id='$user_id'");
	$memorizer_result = mysql_query("SELECT * FROM memorizer where user_id='$user_id' and mem_date='$today'");

	$member_info = mysql_fetch_assoc($members_result);
	$memorizer_info = mysql_fetch_assoc($memorizer_result);

	if (!$member_info) {
		$member_info = array("mem_level" => 0);
	}

	if (!$memorizer_info) {
		$memorizer_info = array("mem_words" => 0, "total_words" => 0);
	}

	$info = "{" .
		"lvl:" . $member_info["mem_level"] .
		",score:" . $memorizer_info["mem_words"] .
		",total:" . $memorizer_info["total_words"] .
		"}";

	mysql_free_result($members_result);
	mysql_free_result($memorizer_result);

}

mysql_close($link);

echo "jsr={success:1, user_id:\"$user_id\", today:\"" . $today . "\", info:" . $info . "};$debug" . $_REQUEST['jsp'];

//foreach( $_GET as $param_name=>$param_value){
//	echo $param_name . "=" . $param_value . "<br>\n";
//}

//foreach( $_GET as $param_name => $param_value){
//	echo $param_name . "<br>\n";
//}

?>