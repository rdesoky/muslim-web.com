#!/usr/bin/perl

# use lib "/var/www/html/muslim-web/cgi-bin";#absolute path is required due to mod-perl environment
use File::Basename;
use lib dirname(__FILE__);

use qutils;

my @reciters = ("hosary.txt", "hozaify.txt");
my $reciter;

foreach $reciter ( @reciters )
{
	open FHANDLE, "../../$reciter";

	my $sura=0;
	my $current_sura = 0;

	while(<FHANDLE>)
	{
		chomp;

		my $curr_line = $_;

		if(/\+/) 
		{# found new sura
			$sura = substr( $curr_line, 4, 3 );
		}
		elsif( /\+---/ )
		{
		}
		else
		{	
			my $sAya = substr($_, 8, 3);

			$curr_aya = int ($sAya);

			print int($sura) . "," . $curr_aya . "\r\n";
		}
	}

	close FHANDLE;
}