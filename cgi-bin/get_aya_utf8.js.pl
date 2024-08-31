#!/usr/bin/perl

# use lib "/var/www/html/muslim-web/cgi-bin";#absolute path is required due to mod-perl environment
use File::Basename;
use lib dirname(__FILE__);

use qutils;
use Encode;

qutils::InitCGI();

print qq{Content-Type: text/plain; charset=utf-8;

};

my $my_count=0;
my $sth;
my $sql_statement;
my $row;
my $lineNumber=0;

my @aya_count = (
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54
, 45, 83, 182,  88,  75,  85,  54, 53,  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20
, 56, 40,  31,  50,  40,  46,  42, 29,  19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6 
);

my $min_length = qutils::GetParam("min", 10);
my $max_length = qutils::GetParam("max", 40);
my $from_sura = int( qutils::GetParam("s", 0) );
my $aya = int( qutils::GetParam("a", 0) );

#my $dbh = DBI->connect("DBI:mysql:database=quran;host=localhost", "root", "")  or die "could not connect to database";
#my $dbh = DBI->connect("DBI:mysql:database=rdesoky_quran;host=localhost", "rdesoky_root", "reham01");
my $dbh = qutils::db_connect("quran");

if(! $dbh ) {
	print qq{re={success:0,err_msg:'could not connect to database'};
};
	exit;
}

if( $from_sura && $aya ){
	$sth = $dbh->prepare(qq{
		SELECT * from quran_data where sura_num=? and aya_num=?
	});
	$sth->execute($from_sura-1, $aya-1);
	if( my $row = $sth->fetchrow_hashref )
	{
		my $ret_data = qq{
			re={
				success:1,
				sura: $row->{sura_num},
				aya: $row->{aya_num},
				text: "$row->{aya_text}",
				plain:"$row->{aya_plain_text}"
			}; 
		};

		Encode::from_to( $ret_data, "cp1256", "utf8" );
		print $ret_data;
	}
	$sth->finish;
}
else
{
	if($from_sura){
		$sth = $dbh->prepare(qq{ 
				SELECT count(*) as my_count 
				from quran_data 
				where sura_num=?
			}
		);
		$sth->execute( $from_sura-1 );
	}else{
		$sth = $dbh->prepare(qq{ 
				SELECT count(*) as my_count 
				from quran_data 
				where plain_text_length >= ? 
					and plain_text_length < ?
			}
		);

		$sth->execute( $min_length, $max_length );
	}

	if( $row = $sth->fetchrow_hashref ){
		$my_count = $row->{my_count};
	}

	$sth->finish;

	if( $my_count > 0 )
	{
		my $index = int( rand($my_count) );

		if($from_sura){
			$sth = $dbh->prepare(
				qq{
					SELECT * 
					from quran_data 
					where sura_num = ? 
					limit ?, 1
				}
			);
			$sth->execute( $from_sura-1, $index );
		}
		else{
			$sth = $dbh->prepare( 
				qq{
					SELECT * 
					from quran_data 
					where plain_text_length >= ? 
						and plain_text_length < ? 
					limit ?, 1
				} 
			);
			$sth->execute( $min_length, $max_length, $index );
		}

		if( $row = $sth->fetchrow_hashref )
		{
			my $ret_data = qq{
				re={
					success:1,
					sura: $row->{sura_num},
					aya: $row->{aya_num},
					text: "$row->{aya_text}",
					plain:"$row->{aya_plain_text}"
				}; 
			};

			Encode::from_to( $ret_data, "cp1256", "utf8" );

			print $ret_data;
		}
		$sth->finish;
	}

	#LogRequest();
}

$dbh->disconnect;
