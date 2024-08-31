#!/usr/bin/perl

# use lib "/var/www/html/muslim-web/cgi-bin";#absolute path is required due to mod-perl environment
use File::Basename;
use lib dirname(__FILE__);

use qutils;

print "Content-Type: application/xml; Cache-Control: NO-STORE;\n\n";

qutils::InitCGI();

my $id = qutils::GetParam ("id", "");
my $login_id = qutils::GetParam ("user", "");

if ($id eq "" && $login_id eq "")
{
	print qutils::XMLout( {login_id=>$login_id, id=>$id, success=>0, error=>"Invalid user ID", query=>$ENV{QUERY_STRING}} );
}
else
{
	my $dbh = qutils::db_connect("quran");

	if ($dbh)
	{
		my $sql_statement;
		my $row;

		$sql_statement = "SELECT * FROM members WHERE id=? or login_id=?";
		
		$sth = $dbh->prepare($sql_statement);
		$sth->execute($id,$login_id);
		$row = $sth->fetchrow_hashref;
		
		if ($row)
		{
			$row->{success} = 1;
			print qutils::XMLout($row);
		}
		else
		{#invalid user name or password
			print qutils::XMLout( {success=>0, error=>"user not found", id=>$id, login_id=>$login_id, query=>$ENV{QUERY_STRING}} );
		}

		$sth->finish;
		$dbh->disconnect;
	}
	else
	{
		print qutils::XMLout({success=>0, error=>"couldn't connect to database"});
	}
}

