#!/usr/bin/perl

use HTTP::Date;

my @img_file = split( /\&|\?/, $ENV{QUERY_STRING} );
my $img = $ENV{DOCUMENT_ROOT} . @img_file[0];

my $ext = "jpeg";
if( $img =~ /\.gif/i ){
	$ext = "gif";
}
my $expiry = time2str(time+60*60*24*30*12);

if( open IMAGE_FILE, "< " . $img )
{
	binmode IMAGE_FILE;

	print "Content-Type: image/${ext}\n";
	print "Expires: $expiry\n";
	print "\n";

	while(<IMAGE_FILE>){
		print;
	}

	close IMAGE_FILE;
}
else{
	print "Content-Type: text/plain;\n\n";
	print $img . " Not Found";
}
