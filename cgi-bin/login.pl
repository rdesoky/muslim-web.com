#!/usr/bin/perl

use qutils;

print "Content-Type: application/xml; Cache-Control: NO-STORE;\n\n";
print "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n";

qutils::InitCGI();

my $login_id = qutils::GetParam ("user", "admin");
my $password = qutils::GetParam ("password", "a");

if ($login_id eq "")
{
	print qutils::XMLout( {success=>0, error=>"Invalid user name"} );
}
else
{
	if(my $dbh = qutils::db_connect("quran"))
	{
		if( $sth = $dbh->prepare("SELECT * FROM members WHERE login_id=? and password=?") )
		{
			if($sth->execute($login_id,$password))
			{
				if (my $row = $sth->fetchrow_hashref)
				{
					$row->{success} = 1;
					print qutils::XMLout($row);
				}
				else
				{#invalid user name or password
					print qutils::XMLout( {success=>0, error=>"invalid user name ($login_id) or password($password)"} );
				}
			}
			$sth->finish;
		}
		$dbh->disconnect;
	}
	else
	{
		print qutils::XMLout({login_id=>$login_id,success=>0, error=>"couldn't connect to database"});
	}
}

