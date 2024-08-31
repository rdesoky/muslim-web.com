#!/usr/bin/perl
use File::Basename;
use lib dirname(__FILE__) . "/..";

use qutils;

my @aya_count = (
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54
, 45, 83, 182,  88,  75,  85,  54, 53,  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20
, 56, 40,  31,  50,  40,  46,  42, 29,  19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6 
);

my $lineNumber=0;

open QURAN_S , "../quran_search.txt" or exit;

if( my $dbh = qutils::db_connect() )
{
	while(<QURAN_S>)
	{
		my $aya_stext = $_;

		my ($sura_num,$aya_num) = GetAyaLocation($lineNumber); 

		$dbh->do("update quran_data set aya_stext = ? where sura_num = ? and aya_num = ?", undef, $aya_stext, $sura_num, $aya_num );

		$lineNumber ++;
	}

	$dbh->disconnect;
}

close QURAN_S;

sub GetAyaLocation
{
	my $line_number = shift;
	my $sura_num, $aya_total;

	$aya_total = 0;

	for ($sura_num=0; $sura_num< 114; $sura_num ++) 
	{

		if ( ($aya_total + @aya_count[$sura_num]) > $line_number) 
		{
			return ( $sura_num, $line_number - $aya_total );
		}
		
		$aya_total += @aya_count[$sura_num];
	}
}
