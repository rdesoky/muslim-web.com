#!/usr/bin/perl

use utils;

use CGI qw( :standard );
require LWP::UserAgent;


print "Content-Type: audio/x-pn-realaudio

";

$reciter = GetParam("r",1);
$sura = GetParam("s",5);
$from_aya = param("f",20);
$to_aya = param("t",22);


my $ua = LWP::UserAgent->new(env_proxy => 1,  keep_alive => 1, timeout => 30 );
$request = HTTP::Request->new('GET', $url);
$response = $ua->request($request);

 
for ($aya_num = $from_aya; $aya_num <= $to_aya; $aya_num ++) 
{
	$url = "http://quran.al-islam.com/Recite/Recite_g2.asp?s=${sura}&f=${aya_num}&t=$65&Reciter=${reciter}";

	$response = $ua->get($url);

	if ($response->is_success) 
	{
		print $response->content;
	} 
	else 
	{
		print $response->error_as_HTML;
	}
}

