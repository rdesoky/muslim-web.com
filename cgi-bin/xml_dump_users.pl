#!/usr/bin/perl

use qutils;
my $dbh = qutils::db_connect("quran");

print "Content-Type: text/html;

";

if ($dbh)
{
	my $sql_statement;
	my $sth;
	my $row;

	print "<?xml version=\"1.0\" encoding=\"windows-1256\"?>";
	print "<root>";

	$sql_statement = "SELECT * FROM members order by date_created desc";
	
	$sth = $dbh->prepare($sql_statement);
	$sth->execute;
	
	while ($row = $sth->fetchrow_hashref)
	{
		print qutils::XMLout($row);
	}
	$sth->finish;

	print "</root>";

	$dbh->disconnect;
}
