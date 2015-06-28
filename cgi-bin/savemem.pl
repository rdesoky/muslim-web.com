#!/usr/bin/perl

use qutils;

print "Content-Type: application/xml; Cache-Control: NO-STORE;\n\n";

qutils::InitCGI();

my $id = qutils::GetParam ("id", "0");

if ($id eq "0")
{
	print XMLout( {success=>0, error=>"Invalid user ID '${id}'"} );
}
else
{
	my $dbh = qutils::db_connect("quran");

	if ($dbh)
	{
		my $sql_statement;
		my $row;

		$memorize = qutils::GetParam("mem","");
		$pending_memorize = qutils::GetParam("memb", "");

		$sql_statement = "UPDATE members 
							SET memorize='$memorize', 
								pending_memorize='$pending_memorize', 
								date_updated=CURRENT_DATE 
							WHERE id=?";

		$rv = $dbh->do ($sql_statement, undef, $id);

		if ($rv)
		{
			print qutils::XMLout({success=>1});
		}
		else
		{#invalid user name or password
			print qutils::XMLout( {success=>0, rv=>"${rv}", error=>"user ID '$id' not found", sql=>"$sql_statement"} );
		}

		$dbh->disconnect;
	}
	else
	{
		print qutils::XMLout({success=>0, error=>"couldn't connect to database"});
	}
}


