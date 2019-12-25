<?php
	header("Content-Type: text/css"); // HTTP/1.1
	header( 'Expires: '.gmdate('D, d M Y H:i:s', time()+86400*30).'GMT' ); //expires after 30 days
	//header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
	//header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past, expires immediately
?>
*{
	font-size:12pt;
	line-height:14.5pt;
}
body{
	direction:rtl;
	margin:0px;
	background:#FFFFEE;
	max-width:400px;
}

.aya_text{
	padding:5px;
	color:blue;
	font-weight:bold;
}

.translation{
	padding:5px;
	font-size:12.5pt;
	direction:ltr;
}