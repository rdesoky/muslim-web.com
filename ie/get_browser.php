<?php
echo $_SERVER['HTTP_USER_AGENT'] . "\n\n";

print_r("<br/>-------------- get_browser output -----------------<br/>");

$browser = get_browser(null, true);
print_r($browser);
?> 