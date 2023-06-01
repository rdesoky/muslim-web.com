#!/usr/bin/perl

#use CGI qw( :standard );
use lib "/var/www/html/muslim-web/cgi-bin";#absolute path is required due to mod-perl environment

my $print_count;
my $count_date;
my $count = 0;
my $sessions = 0;
my $updated = 0;
my $counted = 0;

use qutils;

print qq{Content-Type: text/javascript
Cache-Control: no-cache, must-revalidate
Expires: Sat, 26 Jul 1997 05:00:00 GMT
Set-Cookie: counted=1

};

if ( $ENV{HTTP_COOKIE} =~ /counted\=1/ ) {
	$counted = 1;
}

if( my $dbh = qutils::db_connect() )
{
	if( $counted > 0 ) 
	{
		my $updated = int($dbh->do("UPDATE traffic set day_page_views=day_page_views+1, last_view=NOW() where access_date=CURRENT_DATE "));

		#print "alert('updated\=${updated}');";

		if( $updated == 0) {
			$dbh->do("INSERT INTO traffic( access_date, last_view, last_session ) VALUES ( CURRENT_DATE, NOW(), NOW() )");
		}
	} 
	else
	{
		my $updated = int($dbh->do("UPDATE traffic set day_page_views=day_page_views+1, day_sessions=day_sessions+1, last_view=NOW(), last_session=NOW() where access_date=CURRENT_DATE "));

		if ($updated == 0) {
			$dbh->do("INSERT INTO traffic( access_date, last_view, last_session ) VALUES ( CURRENT_DATE, NOW(), NOW() )");
		}
	}

	$dbh->disconnect;
}

