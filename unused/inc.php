<?php
$file = $_GET['file'];
//$file = "css/quran/index.css";
$content_type = "text/plain";

if( preg_match("/\.\w*/", $file, $ext_ar) ){
	$ext = $ext_ar[0];
	switch($ext){
		case '.js':
			$content_type = 'application/javascript';
			break;
		case '.css':
			$content_type = 'text/css';
			break;
	}
}


if( file_exists($file) ){

	header("Content-Type: $content_type");
	header("Cache-Control: max-age=7776000, s-maxage=7776000"); // HTTP/1.1 90 days
	//header("Cache-Control: max-age=0, s-maxage=0"); // HTTP/1.1 90 days
	header('Content-Length: ' . filesize($file));

	include($file);

	//ob_clean();
	//flush();
	//readfile($file);
	//exit;
}
?>