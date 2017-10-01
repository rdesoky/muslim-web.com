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

my $html = "";
my $title = "";

print qq{Content-Type: text/html;
Expires: $expiry;

};

if( open FILE_HANDLE, "< " . $filename )
{
    while(<FILE_HANDLE>){
		$line = $_;
        #substitute existing tags
		#$line =~ s/\<head\>/\<head\><link rel=\"StyleSheet\" href=\"\/tafseer\.css\.php\"\/\>/gi;
		#$line =~ s/ border\=1 width\=100\%/ width\=\"100\%\"/gi;
        $line =~ s/border\=1//gi;
		$line =~ s/ align\=right dir\=rtl//gi;
		#$line =~ s/utf-8/windows-1256/gi;
		Encode::from_to( $line, "utf-8", "cp1256" );
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
	$html = "Tafseer Not Found";
}

print qq{
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="StyleSheet" href="tafseer.css.php"/>
        <meta name="viewport" content="width=device-width"/>
        <meta http-equiv="Content-Type" content="text/html; charset=windows-1256"/>
        <title>${title}</title>
    </head>
    <body dir="rtl">
    ${html}
    </body>
    </html>
};
