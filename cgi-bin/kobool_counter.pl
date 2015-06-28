#!/usr/bin/perl

use CGI qw( :standard );
use utils;
utils::InitCGI();


my $member_id = utils::GetCookie("id", 0);
my $is_admin = utils::GetCookie("admin",0);
my $counted = int(utils::GetCookie("counted",0));
my $pc		= utils::GetCookie("pc",0);

print "Content-Type: application/x-javascript;Cache-Control: NO-STORE;\r\n\r\n";

if ( $is_admin ) {
	#print "alert('admin is active')";
	exit;
}

if( my $dbh = utils::db_connect() )
{
	#utils::LogInfo("pc: $pc") ;

	if ($pc == 0 && $counted == 0) 
	{
		my $user_agent_id = utils::AddUserAgent( $dbh, $ENV{HTTP_USER_AGENT} );

		#utils::LogInfo("agentID: $user_agent_id") ;

		$dbh->do( "INSERT into computers(date_created, user_agent_id, ip_address) VALUES(NOW(),?,?)", undef, $user_agent_id, $ENV{REMOTE_ADDR} );

		$pc = utils::GetLastInsertedID($dbh);
		#print "alert('$ENV{HTTP_USER_AGENT}')";
	}

	if ($pc > 0 && $counted==0) {
		#utils::LogInfo("pc = $pc");
		$dbh->do( "update computers set access_count=access_count+1, last_accessed=NOW() where id=?", undef, $pc );
	}

	if( $counted > 0 ) {
		my $updated = int($dbh->do("UPDATE traffic set day_page_views=day_page_views+1, last_view=NOW() where access_date=CURRENT_DATE "));

		#print "alert('updated\=${updated}');";


		if ($updated == 0) {
			$dbh->do("INSERT INTO traffic( access_date, last_view, last_session ) VALUES ( CURRENT_DATE, NOW(), NOW() )");
		}

		if( $member_id>0 ){
			$dbh->do("UPDATE traffic set member_day_page_views=member_day_page_views+1, last_view=NOW() where access_date=CURRENT_DATE ");
		}

	} 
	else
	{
		my $updated = int($dbh->do("UPDATE traffic set day_page_views=day_page_views+1, day_sessions=day_sessions+1, last_view=NOW(), last_session=NOW() where access_date=CURRENT_DATE "));

		if ($updated == 0) {
			$dbh->do("INSERT INTO traffic( access_date, last_view, last_session ) VALUES ( CURRENT_DATE, NOW(), NOW() )");
		}

		if($member_id>0){
			$dbh->do("UPDATE traffic set member_day_sessions=member_day_sessions+1 where access_date=CURRENT_DATE ");
		}
		
		#print "alert('new_session')";

		#my $referer = CGI->referer();
		#if( length($referer) ) {
		#	my $updated = int($dbh->do("UPDATE referals set day_sessions=day_sessions+1 where access_date=CURRENT_DATE and referer=?", undef, $referer));
		#	if (!$updated) {
		#		$dbh->do("INSERT INTO referals (referer, access_date) values( ?, CURRENT_DATE )", undef, $referer);
		#	}
		#}
	}

	$dbh->disconnect;
}

if( $counted == 0 ) {
	print "document.cookie='counted=1';document.cookie='pc=$pc;expires=Fri, 31 Dec 2010 23:59:59 GMT;'";
}
