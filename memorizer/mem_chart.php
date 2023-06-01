<html>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<link rel="StyleSheet" href="default.css">
<body <?= $direction ?> >

<?php

require_once "myfacebook.php";
require_once ( $lang = DetectLanguage() ) . '_strings.php';

$direction = ( $lang == "ar" ) ? " dir=RTL " : " dir=LTR ";

$user_id = $_GET["user_id"];

if(!$user_id){
	$facebook = new Facebook($appapikey, $appsecret);
	$user_id = $facebook->get_loggedin_user();

	if(!$user_id) {
		unset( $facebook );
		exit( "jsr={success:0, history:[], user_id:\"$user_id\", error:\"not logged in\"};$debug" . $_REQUEST['jsp']);
	}
	
	unset($facebook);
}
echo "<body $direction>";

echo "<div class=aya_view style='text-align:center;border-bottom:solid 1px silver'>" . $str_table['chart_title'] . "</div>";

echo GetChartHTML( $user_id , 13 );

?>

</body>
</html>