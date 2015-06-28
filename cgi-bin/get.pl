#!/usr/bin/perl

use CGI qw( :standard );
#use XML::Simple;
require LWP::UserAgent;

print "Content-Type: text/html; charset=windows-1256

";

my $ua = LWP::UserAgent->new(env_proxy => 1,  keep_alive => 1, timeout => 30 );

my $url = param("url");

$request = HTTP::Request->new('GET', $url);
  # and then one of these:
$response = $ua->request($request);


#my $response = $ua->get($url);	

if ($response->is_success) 
{
	print $response->content;
}
else 
{
	print $response->error_as_HTML;
}
