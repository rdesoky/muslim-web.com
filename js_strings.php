<?php
header( "Content-Type: application/x-javascript" );
if( $_SERVER["HTTP_HOST"] != "new.muslim-web.com" ){
	header( "Cache-Control: max-age=7776000"); // HTTP/1.1
	header( 'Expires: ' . gmdate('D, d M Y H:i:s', time()+7776000) . 'GMT' ); 
}
include( "qlib.php" );
include( "strings.php" );

$lang = DetectLang();

include( $lang . "_strings.php" );#TODO: select language base on cookies or query string
?>

var _S, gStrings;
_S = gStrings = { <?= Array2JSString( $Str ) ?> };

var GS = function(sID){
	if( Defined( gStrings[ sID ] ) ){
		return gStrings[sID];
	}
	return "[" + sID + "]";
};