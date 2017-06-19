<html>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<link rel="StyleSheet" href="default.css">
<body <?= $direction ?> >

<?php

$lang = $_GET['lang'] ? $_GET['lang'] : ( $_COOKIE['lang'] ? $_COOKIE['lang'] : "en" );
//setcookie("lang", $lang, time() + ( 86400 * 365 ) );
$direction = $lang == "ar" ? " dir=RTL " : "";

require $lang . '_strings.php';
require 'mem_lib.php';


$user_id = $_GET["user_id"];

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
echo "<body $direction>";

echo "<div class=aya_view style='text-align:center;border-bottom:solid 1px silver'>" . $str_table['chart_title'] . "</div>";

echo GetChartHTML( $user_id , 13 );

?>

</body>
</html>