#!/usr/bin/perl

use lib "/websites/quran.muslim-web.com/cgi-bin/";
use qutils;
use HTTP::Date;

CGI->initialize_globals;

print qq{Content-Type: audio/x-pn-realaudio;

};

my $sura	= qutils::GetParam("s",1);
my $from_aya= qutils::GetParam("f",1);
my $to_aya	= qutils::GetParam("t",5);
my $reciter = qutils::GetParam("r","0");
my $no_basm = int(qutils::GetParam("nbsm",0));

my $sSura = sprintf( "%03d", $sura );
my $sura_found = 0;
my $url;
my $doc_root = "..";

if( $ENV{DOCUMENT_ROOT} ) {
	$doc_root = $ENV{DOCUMENT_ROOT};
}

if($reciter eq "0") {
	open FHANDLE, $doc_root . "/hosary.txt";
	$url = "http://www.egylist.com/quran/RealHosary/";
}else{
	open FHANDLE, $doc_root . "/hozaify.txt";
	$url = "http://www.egylist.com/quran/RealHozaify/";
}

if(!$no_basm && $to_aya > $from_aya ) {
	if( $sura > 1 || $from_aya > 1) {
		print $url . "001/001_001_0.ra" . "\r\n";
	}
}

$url .= addDigits($sura,3) . "/" . $sSura . "_" ;

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


sub addDigits
{
        my $x = shift;
        my $digits = shift;

        $x = "$x";
        while( length $x < $digits ){
                $x = "0$x";
        }
        return $x;
}
