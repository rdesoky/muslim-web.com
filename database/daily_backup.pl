#!/usr/bin/perl

require LWP::UserAgent;

my $ua = LWP::UserAgent->new(env_proxy => 1,  keep_alive => 1, timeout => 30 );

my $url = "http://quran.muslim-web.com/cgi-bin/xml_dump_users.pl";

$request = HTTP::Request->new('GET', $url);
$response = $ua->request($request);

if ($response->is_success) 
{
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =	localtime(time);

	$year += 1900;
	$mon ++;

	my $save_as_name = "${year}-${mon}-${mday} (${hour}-${min}).xml";

	open COUNTER_W, ">$save_as_name" or die;
	
	#print $response->content;

	print COUNTER_W $response->content;
}
else
{
	print $response->error_as_HTML();
}
