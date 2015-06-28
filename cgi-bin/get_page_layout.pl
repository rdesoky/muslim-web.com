#!/usr/bin/perl

use qutils;

qutils::InitCGI();

print "Content-Type: text/plain;\n\n";

my $page = qutils::GetParam("pg", 1);

my $dbh = qutils::db_connect("quran");

if( ! $dbh )
{
	print qutils::JsOut({
			success=>0,
			err_msg=>"could not connect to database"
		},
		"re"
	);
	exit;
}

my $sth = $dbh->prepare( 
	qq{
		select * 
		from page_layout 
		where page=? 
		order by sura, aya
	}
);

my $ret_code = int( $sth->execute( $page ) );

my $rows = "";
while( my $row = $sth->fetchrow_hashref )
{
	if( length($rows) ){
		$rows .= ",\n";
	}

	$rows .= qutils::JsOut($row);
}

$sth->finish;
$dbh->disconnect;

print qutils::JsOut( { page=>$page, success=>$ret_code }, "re", $rows  );

