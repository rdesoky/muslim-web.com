#!/usr/bin/perl
use File::Basename;
use lib dirname(__FILE__);

use qutils;
use Encode;

qutils::InitCGI();

print qq{Content-Type: application/javascript; charset=utf-8;

};

my $sth;
my $sql_statement;
my $row;
my $response = "";

my $sura = int(qutils::GetParam("s", 1));
my $req_list = qutils::GetParam("a", "3,4,5,6");
my $ret_list = "";

my $dbh = qutils::db_connect("quran");

if(! $dbh ) {
	print qq{re={success:0,err_msg:'could not connect to database'};
};
	exit;
}

$sth = $dbh->prepare(qq{
	SELECT * from quran_data where sura_num=? and aya_num in ($req_list)
});
if( $sth->execute($sura) )
{
	while( my $row = $sth->fetchrow_hashref )
	{
		if( length( $ret_list ) ){
			$ret_list .= ",\n\t\t";
		}
		$ret_list .= "\"" . $row->{aya_num} . "\": \"" . $row->{aya_plain_text} . "\"";
	}
	$sth->finish;
}

$dbh->disconnect;

my $ret_data = qq{
re={
	success:1,
	sura: $sura,
	aya_list:{
		$ret_list
	}
};};

Encode::from_to( $ret_data, "cp1256", "utf8" );

print $ret_data;
