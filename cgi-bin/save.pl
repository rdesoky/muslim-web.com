#!/usr/bin/perl

use CGI qw( :standard );
require LWP::UserAgent;


my $ua = LWP::UserAgent->new(env_proxy => 1,  keep_alive => 1, timeout => 30 );

my $url = param("url");

print "Content-Type: application/x-msdownload; Location : $url

";


my $response = $ua->get($url);

if ($response->is_success) 
{
	my $offset;
	my $chunk_length = 1024 * 4;
	my $content_length = length($response->content);

	for ( $offset = 0; $offset < $content_length; $offset += $chunk_length ) 
	{
		my $print_length = ( ($offset + $chunk_length) < $content_length ) ? $chunk_length : $content_length - $offset ;

		print substr( $response->content, $offset, $print_length );

		sleep 1;
	}
}
else 
{
	print $response->error_as_HTML;
}
