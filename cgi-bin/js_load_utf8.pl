#!/usr/bin/perl

use CGI qw( :standard );
require LWP::UserAgent;
use HTTP::Date;

use qutils;
qutils::InitCGI();
use Encode;

my $url		 = qutils::GetParam( "url", "http://cgi.muslim-web.com/cgi-bin/search.pl" );
my $callback = qutils::GetParam( "callback", "" );

my $expiry = time2str(time+60*60*24*30*12);

print qq{Content-Type: application/x-javascript;
Expires: $expiry;

};

my $user_agent	= LWP::UserAgent->new( env_proxy=>1,  keep_alive=>1, timeout=>30 );
my $request		= HTTP::Request->new( "GET", $url );
my $response	= $user_agent->request( $request );
my $ret_data	= "";

if( $response->is_success )
{
	$ret_data = $response->content;
	$ret_data =~ s/\"/\\\"/g;
	$ret_data =~ s/\n/\\n/g;
}
else 
{
	#print $response->error_as_HTML;
}

Encode::from_to( $ret_data,"cp1256", "utf8");
#= qutils::ConvertCP1256ToUnicode($ret_data);

print qq{gDataResponse = "${ret_data}";${callback};};