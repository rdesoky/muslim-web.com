#!/usr/bin/perl

use Cwd 'abs_path'; 
	
my $img = $ENV{DOCUMENT_ROOT} . $ENV{QUERY_STRING} ;

if( open IMAGE_FILE, "< " . $img )
{
	binmode IMAGE_FILE;

	print "Content-Type: image/gif;\n";
	print "Cache-Control:max-age=7776000\n";
	print "\n";

	while(<IMAGE_FILE>){
		print;
	}

	close IMAGE_FILE;
	return 1;
}
else{
	print "Content-Type: text/plain;\n\n";
	print $img . " Not Found";
}
