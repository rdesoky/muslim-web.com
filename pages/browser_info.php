<?php
echo $_SERVER['HTTP_USER_AGENT'] . "<br/>";

echo getenv("HTTP_HOST");

echo "<h2>_SERVER variables</h2>";

foreach( $_SERVER as $key => $value ){
	echo "<div><b>$key</b>: $value</div>";
}

#$browser = get_browser(null, true);
#print_r($browser);
?>