<?php
/*
$UserAgent = "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 1.0.3705; .NET CLR 2.0.50727; InfoPath.1; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; OfficeLiveConnector.1.3; OfficeLivePatch.0.0)"; 

$Browser = GetBrowserInfo($UserAgent);
echo phpversion() . "\n";
echo $Browser['Name'] ."\n";
echo $Browser['Version'] ."\n";;
echo $Browser['Engine'] ."\n";;
echo $Browser['EngineVer'] ."\n";;
*/

function GetBrowserInfo($userAgent){

	$props	= array("Version" => "0.0.0", 
							"Name" => "unknown",
							"Engine" => "unknown",
							"EngineVer" => "0.0.0",
							"Agent"	=> "unknown"); 

	$browsers =	array("firefox", "msie", "opera", "chrome",	"safari", 
							"mozilla", "seamonkey",	   "konqueror",	"netscape",	
							"gecko", "navigator", "mosaic",	"lynx",	"amaya", 
							"omniweb", "avant",	"camino", "flock", "aol"); 

	$Agent = strtolower($userAgent); 
		
	foreach($browsers as $browser) 
	{ 
		if (preg_match("#($browser)[/ ]?([0-9.]*)#", $Agent, $match))	
		{ 
			$Name	= $match[1]	; 
			$Version = (int)$match[2] ; 
			break ;	
		} 
	} 

	$engines = array("trident", "applewebkit", "gecko");
	foreach($engines as $engine) 
	{ 
		if (preg_match("#($engine)[/ ]?([0-9.]*)#", $Agent, $match))	
		{ 
			$Engine	= $match[1]	; 
			$EngineVer = (int)$match[2] ; 
			break ;	
		} 
	} 

	if( $Engine == "trident" ){
		if( $EngineVer==4 ){
			$Version = 8;
		}
	}

	return array(
		"Name"=>$Name,
		"Version"=>$Version,
		"Engine"=>$Engine,
		"EngineVer"=>$EngineVer
	);
}

/*
class BrowserInfo{

	var $props	= array("Version" => "0.0.0", 
							"Name" => "unknown",
							"Engine" => "unknown",
							"EngineVer" => "0.0.0",
							"Agent"	=> "unknown"); 

	function __Construct($userAgent)	
	{ 
		$browsers =	array("firefox", "msie", "opera", "chrome",	"safari", 
							"mozilla", "seamonkey",	   "konqueror",	"netscape",	
							"gecko", "navigator", "mosaic",	"lynx",	"amaya", 
							"omniweb", "avant",	"camino", "flock", "aol"); 

		$this->Agent = strtolower($userAgent); 
		
		foreach($browsers as $browser) 
		{ 
			if (preg_match("#($browser)[/ ]?([0-9.]*)#", $this->Agent, $match))	
			{ 
				$this->Name	= $match[1]	; 
				$this->Version = (int)$match[2] ; 
				break ;	
			} 
		} 

		$engines = array("trident", "applewebkit", "gecko");
		foreach($engines as $engine) 
		{ 
			if (preg_match("#($engine)[/ ]?([0-9.]*)#", $this->Agent, $match))	
			{ 
				$this->Engine	= $match[1]	; 
				$this->EngineVer = (int)$match[2] ; 
				break ;	
			} 
		} 

		if( $this->Engine == "trident" ){
			if( $this->EngineVer==4 ){
				$this->Version = 8;
			}
		}
	} 

	function	__Get($name) 
	{ 
		if (!array_key_exists($name, $this->props))	
		{ 
			return "" ;	
		} 
		return $this->props[$name] ; 
	} 

	function	__Set($name, $val) 
	{ 
		if (!array_key_exists($name, $this->props))	
		{
			return false;
		 
		} 
		$this->props[$name]	= $val ; 
	} 

};
*/




function GetStr( $str_id ){
	global $Str;
	return $Str[$str_id];
}

function DetectLang(){
	global $_GET;
	$ret_val = $_GET['lang'];

	if( isset( $ret_val ) ){
		setcookie("lang", $ret_val, time()+3600*24*365*5);
	}else{
		$ret_val = GetCookie("lang", "ar" );//TODO: detect default language from IP address
	}

	return $ret_val;
}

function GetParam( $param_name)
{
	global $_GET;

	$ret_value = $_GET[$param_name];

	return $ret_value;

/*	if( isset($ret_value) ){
		return $ret_value;
	}

	return null;
*/
}

function GetCookie( $param_name, $default_value )
{
	global $_COOKIE;

	$ret_value = $_COOKIE[$param_name];

	if( isset($ret_value) )
	{
		return $ret_value;
	}
	
	return $default_value;
}

?>