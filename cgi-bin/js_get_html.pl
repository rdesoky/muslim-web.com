#!/usr/bin/perl

use HTTP::Date;

my $filename = $ENV{DOCUMENT_ROOT} . $ENV{QUERY_STRING} ;

my $expiry = time2str(time+60*60*24*30*12);
#$filename = "c:\\websites\\new.muslim-web.com\\tafseer\\GALALEEN\\001001.html";
#$filename = "c:\\websites\\new.muslim-web.com\\qtext\\sura_001.php";

if( open FILE_HANDLE, "< " . $filename )
{
	binmode FILE_HANDLE;

	my $html = "";
	#my $collect = 0;

	while(<FILE_HANDLE>){

		$line = $_;
		$line =~ s/^\s+//;
		$line =~ s/\s+$//;
		$html .= $line;
	}

	$html =~ s/^.*\<body\>//i;
	$html =~ s/<\/body.*$//i;
	$html =~ s/\"/\\\"/g;

	close FILE_HANDLE;

	print qq{Content-Type: application/x-javascript;
Expires: $expiry;

window.gResponseHTML="$html";
};

}
else{
	print "Content-Type: text/plain;\n\n";
	print $ENV{QUERY_STRING} . " Not Found";
}
