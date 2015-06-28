#!/usr/bin/perl

use lib "/websites/new.muslim-web.com/cgi-bin/";


use qutils;

my @aya_count = (
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54
, 45, 83, 182,  88,  75,  85,  54, 53,  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20
, 56, 40,  31,  50,  40,  46,  42, 29,  19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6 
);

my $sura=0;
my $aya=0;
my $page=0;
my $part=0;
my $sajda=0;
my $new_part=0;
my $new_page=0;

if( my $dbh = qutils::db_connect() )
{
	$dbh->do("trunc pages;trunc parts;trunc sajdat;");
	open QURAN_S , "../data/quran_source.txt" or exit;

	while(<QURAN_S>)
	{
		my $curr_line = $_;
		my $mark = substr( $curr_line,0 ,1 );

		if( "@" == $mark ){
			$sura ++;
			$aya = 0;
		}

		if( "*" == $mark ){
			$page ++;
			$new_page = 1;
		}

		if( "^" == $mark ){
			$sajda ++;
			$dbh->do( "insert into sajdat( sura, aya ) values( ?, ? ) ", undef, $sura, $aya );
		}

		if( "#" == $mark ){
			$part ++;
			$new_part = 1;
		}

		if( "\$" == $mark ){
			$aya ++;
			
			$dbh->do( "update quran_data set page=? where sura_num=? and aya_num=? ", undef, ($page-1) , ($sura-1), ($aya-1) );

			if($new_part){
				$dbh->do( "insert into parts( page, sura, aya ) values( ?, ? , ? ) ", undef, $page , $sura, $aya );
				$new_part = 0;
			}

			if($new_page){
				$dbh->do( "insert into pages( sura, aya ) values( ?, ? ) ", undef, $sura, $aya );
				$new_page = 0;
			}
		}
	}

	close QURAN_S;

	$dbh->disconnect;
}


