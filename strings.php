<?php
function Array2JSString( $Str )
{
	$ret = "";
	$comma = "";

	foreach( $Str as $key => $value ){
		$ret .= $comma . $key . ":";

		if( is_array($value) ){
			$ret .= "{\n" . Array2JSString($value) . "\n}" ;
			
		}else{
			$ret.= "\"" . $value . "\"" ;
		}

		$comma = ",";
	};
	return $ret;
}
?>