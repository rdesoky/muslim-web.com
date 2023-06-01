#!/usr/bin/perl

use LWP::UserAgent;


my $ua		= LWP::UserAgent->new(env_proxy => 1,  keep_alive => 1, timeout => 30 );

my $response = $ua->get( "http://www.kobool.com/facebook/get_chart_data.php?" . $ENV{QUERY_STRING});

if( $response->is_success ) 
{
	print $response->content;
}
else
{
	print "Couldn't load chart";
}
