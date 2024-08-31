#!/usr/bin/perl

use File::Basename;
use lib dirname(__FILE__);

use qutils;

qutils::InitCGI();

print "Content-Type: application/xml; Cache-Control: NO-STORE;\n\n";

my $login_id	= qutils::GetParam( "user", "" );
my $password	= qutils::GetParam( "password", "" );
my $email 		= qutils::GetParam( "email", "" );
my $machine_id	= qutils::GetParam( "mid" );
my $mem			= qutils::GetParam( "mem","" );
my $memb		= qutils::GetParam( "memb","" );

if ($login_id eq "")
{
	print qutils::XMLout( {success=>0, error=>"Invalid login ID '${login_id}'"} );
}
else
{
	my $dbh = qutils::db_connect("quran");

	if ($dbh)
	{
		my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =	localtime(time);
		$year = $year + 1900;
		$mon += 1;
		my $date_updated = "${year}-${mon}-${mday}";

		if ($machine_id eq ""){
			$machine_id = CGI::remote_host() . "_${year}.${mon}.${mday}.${hour}.${min}.${sec}";
		}

		my $sql_statement = "INSERT INTO members(login_id  , password  , email   , machine_id  , memorize, pending_memorize , date_created , date_updated) 
										VALUES('$login_id' ,'$password', '$email', '$machine_id', '$mem', '$memb', CURRENT_DATE , CURRENT_DATE)";
		my $rv = $dbh->do($sql_statement);
		
		if ($rv)
		{
			$sql_statement = "SELECT LAST_INSERT_ID() as id";
			$sth = $dbh->prepare ($sql_statement);
			$sth->execute;
			$row = $sth->fetchrow_hashref;
			$member_id = $row->{id};
			$sth->finish;
			print qutils::XMLout( {success=>1, id=>$member_id, login_id=>$login_id } );
		}
		else
		{#can't create user (already exists)
			print qutils::XMLout( {success=>0, error=>"User '$login_id' already exists"} );
		}

		$dbh->disconnect;
	}
	else
	{
		print qutils::XMLout({success=>0, error=>"couldn't connect to database"});
	}
}


