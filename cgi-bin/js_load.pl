#!/usr/bin/perl
use lib "/var/www/html/muslim-web/cgi-bin";#absolute path is required due to mod-perl environment
# use lib dirname(__FILE__);

use CGI qw( :standard );
require LWP::UserAgent;
use HTTP::Date;

use qutils;
qutils::InitCGI();

my $url		 = qutils::GetParam( "url", "" );

if( not $url=~ m/^http\:/ ){
	$url = "http://quran.muslim-web.com/$url";
}
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

print qq{gDataResponse = "${ret_data}";${callback};};	