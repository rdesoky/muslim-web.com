#!/usr/bin/perl

use utils;
use POSIX qw(strftime);

print "Content Type: text/html\n\n";

my $redir_url;
my $login_id = param ("lname");
my $password = param ("pw");
my $email 	 = param ("email");
my $new_user = param ("new_user");
my $func     = param ("func");
my $machine_id=param ("mid");
my $success_url = param ("success_url");
my $error_url   = param ("error_url");
my $cookiePath  = param ("path");

if ($login_id eq "")
{
	$redir_url = $error_url . "?f=${func}&msg=Please%20enter%20user%20name";

	print CGI->redirect (	-uri=> $redir_url, 
							-nph=>1
				);
	die;	
}

if ($password eq "")
{
	$redir_url = $error_url . "?f=${func}&msg=Please%20enter%20Password";

	print CGI->redirect (	-uri=> $redir_url, 
							-nph=>1
				);
	die;	
}

my $dbh = db_connect();

if (! $dbh)
{
	$redir_url = $error_url . "?f=${func}&msg=Database%20Server%20is%20currently%20not%20available";

	print CGI->redirect (	-uri=> $redir_url, 
							-nph=>1
				);
	die;	
}



my $memorize ;
my $pending_memorize ;
my $mycookies;


my $sql_statement;
my $sth;
my $row;
my $member_id;
my $rv;

my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =	localtime(time);
$year = $year + 1900;
$mon += 1;
my $date_updated = "${year}-${mon}-${mday}";

if ($machine_id eq "")
{
	$machine_id = remote_host() . "_${year}.${mon}.${mday}.${hour}.${min}.${sec}";
}


if ($new_user eq "on")
{
	$sql_statement = "INSERT INTO members ( login_id   , password  , email   , machine_id   , memorize   ,  pending_memorize  ,date_created , date_updated) 
									VALUES('$login_id' ,'$password', '$email', '$machine_id', '$memorize', '$pending_memorize',CURRENT_DATE , CURRENT_DATE)";
	$rv = $dbh->do($sql_statement);
	
	if ($rv)
	{
		$sql_statement = "SELECT LAST_INSERT_ID() as id";
		$sth = $dbh->prepare ($sql_statement);
		$sth->execute;
		$row = $sth->fetchrow_hashref;
		$member_id = $row->{id};
		$sth->finish;
	}
	else
	{#can't create user (already exists)
		$redir_url = $error_url . "?f=${func}&msg=user%20already%20exists";
		$func = "";
	}
}
else
{
	$sql_statement = "SELECT * FROM members WHERE login_id='$login_id' and password='$password'";
	$sth = $dbh->prepare($sql_statement);
	$sth->execute;
	$row = $sth->fetchrow_hashref;
	if ($row)
	{
		$member_id    = $row->{id};
		$date_updated = $row->{date_updated};
		$memorize     = $row->{memorize};
		$pending_memorize = $row->{pending_memorize};
	}
	else
	{#invalid user name or password
		$redir_url = $error_url . "?f=${func}&msg=Wrong%20user%20name%20or%20password";
		$func = "";
	}
	$sth->finish;
}

if 	($func eq "1") { #save memorization

	$memorize = param ("mem");
	$pending_memorize = param ("memb");

	$sql_statement = "UPDATE members 
						SET memorize='$memorize', 
							pending_memorize='$pending_memorize', 
							date_updated=CURRENT_DATE 
						WHERE id=$member_id";

	$rv = $dbh->do ($sql_statement);
	$redir_url = $success_url;
	$mycookies = [
		MyCreateCookie ("user", $login_id, $cookiePath),
		MyCreateCookie ("date", $date_updated, $cookiePath),
		MyCreateCookie ("mid", $machine_id, $cookiePath)

	];
}
elsif ( $func eq "2" ) { #load memorization
	$redir_url = $success_url;

	$mycookies = [
		MyCreateCookie ("user", $login_id, $cookiePath),
		MyCreateCookie ("date", $date_updated, $cookiePath),
		MyCreateCookie ("mem", $memorize, $cookiePath),
		MyCreateCookie ("memb", $pending_memorize, $cookiePath)
	];
}

$dbh->disconnect;

#CGI->url() =~ /^.*\// ;
#$redir_url = $& . $redir_url;

print CGI->redirect (	-uri=> $redir_url, 
						-nph=>1,
						-cookie=> $mycookies
			);

#----------------------------------------------------------------------
sub MyCreateCookie
{
	my $cookie_name = shift;
	my $value = shift;
	my $path = shift;
	
	#return "${cookie_name}=${value}; path=/HolyQuran/; expires=Fri, 31 Dec 2010 23:59:59 GMT";
	return "${cookie_name}=${value}; path=${path}; expires=Fri, 31 Dec 2010 23:59:59 GMT";
}
