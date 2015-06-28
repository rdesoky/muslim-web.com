#!/usr/bin/perl

use CGI qw/:standard/;
use DBI;
use utf8;

my $table =  CGI::param("src") || "en_yusufali";
my $sura = CGI::param("s") || "1";
my $aya = CGI::param("a") || "1";

#my $expiry = time2str(time+60*60*24*30*12);
#This script is set to run on egylist.com (Hosted at GoDaddy servers )
my ($dbhost, $dbuser, $dbpass) = ( "egylistquranadm.db.5965197.hostedresource.com", "egylistquranadm", "Ali_1999");
my $dbh = DBI->connect("DBI:mysql:database=$dbuser;host=$dbhost", $dbuser, $dbpass);
my $taf = "";

if($dbh){
	$dbh->do("SET NAMES utf8");
	if( my $sth = $dbh->prepare( qq{
		select text from quran_text where sura=? and aya=?} ) 
	)
	{
		if( int( $sth->execute($sura, $aya) ) ) 
		{
			if( my $rec_info = $sth->fetchrow_hashref() )
			{
				$taf = "<div class='aya_text'>" . $rec_info->{text} . "</div>";
			}
		}
		$sth->finish;
	}

	if( my $sth = $dbh->prepare( qq{
		select text from $table where sura=? and aya=?} ) 
	)
	{
		if( int( $sth->execute($sura, $aya) ) ) 
		{
			if( my $rec_info = $sth->fetchrow_hashref() )
			{
				$taf .= "<div class='translation $table'>" . $rec_info->{text} . "</div>";
			}
		}
		$sth->finish;
	}

	$dbh->disconnect;
}

#binmode STDOUT, ":utf8";

print qq{Content-Type: text/html; charset=utf-8;
Cache-Control: max-age=300

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
	<head>
		<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
		<link rel="StyleSheet" href="/tafseer.css.php"/>
	</head>
	<body>
	$taf
	</body>
</html>
};
