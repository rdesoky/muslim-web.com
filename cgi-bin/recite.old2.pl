#!/usr/bin/perl

use lib "/websites/quran.muslim-web.com/cgi-bin/";
use qutils;
use HTTP::Date;

CGI->initialize_globals;

print qq{Content-Type: audio/x-pn-realaudio;
Expires: $expiry;

};

my $sura	= qutils::GetParam("s",1);
my $from_aya= qutils::GetParam("f",1);
my $to_aya	= qutils::GetParam("t",4);
my $reciter = qutils::GetParam("r",0);

my $sSura = sprintf( "%03d", $sura );
my $sura_found = 0;
my $url;
my $doc_root = "..";

if( $ENV{DOCUMENT_ROOT} ) {
	$doc_root = $ENV{DOCUMENT_ROOT};
}

if($reciter eq "0") {
	open FHANDLE, $doc_root . "/hosary.txt";
	$url = "http://quran.al-islam.com/RealAudio/";
}else{
	open FHANDLE, $doc_root . "/hozaify.txt";
	$url = "http://quran.al-islam.com/RealHozaify/";
}

if ( $to_aya > $from_aya ) {
	if( $sura > 1 || $from_aya > 1) {
		print $url . "001/001_0.ra" . "\r\n";
	}
}

$url .= $sSura . "/" ;

while(<FHANDLE>)
{
	chomp;

	if( $sura_found == 1)
	{
		$sAya = substr($_, 8, 3);

		$curr_aya = int ($sAya);

		last if $curr_aya > $to_aya || /\+---/  ;
	
		if( $curr_aya >= $from_aya && $curr_aya <= $to_aya )
		{
			print $url . substr($_ , 8) . "\r\n";
		}
	}
	elsif (/\+---$sSura/) 
	{
		$sura_found = 1;

	}
}

close FHANDLE;
