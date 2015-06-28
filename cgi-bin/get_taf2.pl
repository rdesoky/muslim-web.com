#!/usr/bin/perl

use HTTP::Date;
use Encode;

my $filename = $ENV{DOCUMENT_ROOT} . $ENV{QUERY_STRING} ;
my $expiry = time2str(time+60*60*24*30*12);

#$filename = "c:\\websites\\new.muslim-web.com\\tafseer\\GALALEEN\\002001.html";

my @ayaLoc = $filename =~ m/(\d\d\d)(\d\d\d)\.html/;
my @fileName = $filename =~ m/(\d+\.html)/;

my $sura = $ayaLoc[0];
my $file = $fileName[0];

#print join "," , @ayaLoc;
#print "\n";
#print join "," , @fileName;
#print "\n";

$filename =~ s/\d+\.html/$sura\/$file/;

if( open FILE_HANDLE, "< " . $filename )
{
#	binmode FILE_HANDLE;

	print qq{Content-Type: text/html;
Expires: $expiry;

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">};

	while(<FILE_HANDLE>){
		$line = $_;
		$line =~ s/\<head\>/\<head\><link rel=\"StyleSheet\" href=\"\/tafseer\.css\.php\"\/\>/gi;
		$line =~ s/ border\=1 width\=100\%/ width\=\"100\%\"/gi;
		$line =~ s/ align\=right dir\=rtl//gi;
		$line =~ s/utf-8/windows-1256/gi;
		Encode::from_to( $line, "utf-8", "cp1256" );
		$line =~ s/[\xF0-\xFF]//gi;#remove tashkeel
		print $line;
	}

	close FILE_HANDLE;
}
else{
	print "Content-Type: text/html;\n\n";
	print "Tafseer Not Found";
}
