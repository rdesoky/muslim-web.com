#!/usr/bin/perl

use HTTP::Date;
use Encode;

my $query = $ENV{QUERY_STRING} || "/tafseer/KATHEER/002002.html";
my $baseUrl = $ENV{DOCUMENT_ROOT} || "/var/www/html/muslim-web";
my $filename = $baseUrl . $query;
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

my $html = "";
my $title = "";

# binmode STDOUT, ":utf8";

print qq{Content-Type: text/html;  charset=utf-8;
Expires: $expiry;

};


if( open FILE_HANDLE, "< " . $filename )
{
  binmode FILE_HANDLE, ":utf8";
  
  while(<FILE_HANDLE>){
		$line = $_;
        #substitute existing tags
		#$line =~ s/\<head\>/\<head\><link rel=\"StyleSheet\" href=\"\/tafseer\.css\.php\"\/\>/gi;
		#$line =~ s/ border\=1 width\=100\%/ width\=\"100\%\"/gi;
    $line =~ s/border\=1//gi;
		$line =~ s/ align\=right dir\=rtl//gi;
		#$line =~ s/utf-8/windows-1256/gi;
		# Encode::from_to( $line, "utf-8", "cp1256" );
		$line =~ s/[\xF0-\xFF]//gi;#remove tashkeel
		#print $line;
    $html .= $line;
	}

	close FILE_HANDLE;
    
  $html =~ s/<html.?>|<\/html>//gi; #remove html tags
  $html =~ s/<body.?>|<\/body>//gi; #remove body tags
  $html =~ s/color=#0000FF/color="#0000FF"/gi;#fix color attributes
  $html =~ /<title>(.+)<\/title>/i;
  $title = "$1";
  $html =~ s/<head.*\/head>//gi; #remove head content
}
else{
	$html = "Tafseer Not Found ($filename)";
}


print qq{
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width"/>
        <style>
            *{font-size:12pt; line-height:14.5pt;}
            body{direction:rtl; margin:0px; background:#FFFFEE; max-width:400px;}
        </style>
        <title>${title}</title>
    </head>
    <body dir="rtl">
    ${html}
    </body>
    </html>
};
