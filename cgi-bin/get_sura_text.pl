#!/usr/bin/perl

use File::Basename;
use lib dirname(__FILE__);

use qutils;

qutils::InitCGI();

print "Content-Type: text/html; charset=windows-1256

";

my $sth;
my $sql_statement;
my $row;

my $sura_num = qutils::GetParam("s", 10);
my $from_aya = qutils::GetParam("f", 1) - 1;
my $to_aya = qutils::GetParam("t", 5) - 1;
my $plain_text = qutils::GetParam("p", 0);

#my $dbh = DBI->connect("DBI:mysql:database=rdesoky_quran;host=localhost", "rdesoky_root", "reham01");
my $dbh = qutils::db_connect("quran");

if ($dbh) 
{
	$sql_statement = "SELECT * from quran_data where sura_num=${sura_num} and aya_num>=${from_aya} and aya_num <= ${to_aya} order by aya_num";
	$sth = $dbh->prepare($sql_statement);
	$sth->execute;

	while ($row = $sth->fetchrow_hashref)
	{
		if($plain_text)
		{
			print $row->{aya_plain_text} . " (" . ($row->{aya_num} + 1) . ") " ;
		}
		else
		{
			print $row->{aya_text} . " (" . ($row->{aya_num} + 1) . ") " ;
		}
	}
	$sth->finish;


	$dbh->disconnect;

}
else {
	print "could not connect to database,";
} 

