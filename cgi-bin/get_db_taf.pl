#!/usr/bin/perl
use lib "/var/www/html/muslim-web/cgi-bin";#absolute path is required due to mod-perl environment

# use cPanelUserConfig;
use qutils;

use CGI qw/:standard/;
use DBI;
use utf8;
use Try::Tiny;

my $table =  CGI::param("src") || "en_yusufali";
my $sura = CGI::param("s") || "1";
my $aya = CGI::param("a") || "1";
my $taf = "";

#my $expiry = time2str(time+60*60*24*30*12);
#my ($dbhost, $dbuser, $dbpass) = ( "egylistquranadm.db.5965197.hostedresource.com", "egylistquranadm", "Ali_1999");
# my ($dbhost, $dbuser, $database, $dbpass) = ( "localhost", "egylistquranadm",
# "egylistquranadm", "Ali_1999");
#my ($dbhost, $dbuser, $dbpass) = ( "p3plcpnl0976.prod.phx3.secureserver.net", "egylistquranadm", "Ali_1999");

my $dbh, $sth, $rec_info;
try{
	$dbh = qutils::db_connect("quran");
  #  $dbh = DBI->connect("DBI:mysql:database=$database;host=$dbhost", $dbuser, $dbpass );
}catch{
   $taf = "Tafseer is not available now."; 
};

if($dbh){
	$dbh->do("SET NAMES utf8");
	$sth = $dbh->prepare( qq{select text from quran_text where sura=? and aya=?} ); 
	
	if( int( $sth->execute($sura, $aya) ) ) 
	{
		if( $rec_info = $sth->fetchrow_hashref() ){
			$taf = qq{<div style="direction:rtl;font-weight:bold">$rec_info->{text}</div>};
		}
	}else{
		$taf .= "quran_text (sura=$sura, aya=$aya) text not found<br/>";
	}

	$sth->finish;

	$sth = $dbh->prepare( qq{ select text from $table where sura=? and aya=?} ) ;
	
	if( int( $sth->execute($sura, $aya) ) ) 
	{
		if( $rec_info = $sth->fetchrow_hashref() )
		{
			$taf .= "<div>" . $rec_info->{text} . "</div>";
		}
	}else{
		$taf .= "$table (sura=$sura, aya=$aya) text not found<br/>";
	}
	$sth->finish;

	$dbh->disconnect;

}else{
	$taf = "Database not available now.";
}

#binmode STDOUT, ":utf8";

print qq{Content-Type: text/html; charset=utf-8;

<!DOCTYPE html>
<html>
	<body>
	$taf
	</body>
</html>
};
