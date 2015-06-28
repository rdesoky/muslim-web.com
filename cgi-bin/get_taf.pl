#!/usr/bin/perl

use HTTP::Date;
use utf8;

my $filename = $ENV{DOCUMENT_ROOT} . $ENV{QUERY_STRING} ;
my $expiry = time2str(time+60*60*24*30*12);
$filename = "c:\\websites\\new.muslim-web.com\\tafseer\\GALALEEN\\001001.html";

if( open FILE_HANDLE, "< " . $filename )
{
#	binmode FILE_HANDLE;

	print qq{Content-Type: text/html;
Expires: $expiry;

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
};

	while(<FILE_HANDLE>){
		$line = $_;
		$line =~ s/\<head\>/\<head\><link rel=\"StyleSheet\" href=\"\/tafseer\.css\?20100411\"\/\>/gi;
		$line =~ s/ border\=1 width\=100\%/ width\=\"100\%\"/gi;
		$line =~ s/ align\=right dir\=rtl//gi;
		#$line =~ s/[\x{064B}-\x{0652}]//gi;#remove tashkeel
		$line =~ s/[\x{0600}-\x{0700}]//gi;#remove arabic
		print $line;
	}

	close FILE_HANDLE;
}
else{
	print "Content-Type: text/plain;\n\n";
	print $ENV{QUERY_STRING} . " Not Found";
}
