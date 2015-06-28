#!/usr/bin/perl

use lib "/websites/kobool.com/cgi-bin/";

use utils;

if( my $dbh = utils::db_connect("quran") )
{
	
	for( my $pg = 1; $pg < 605; $pg ++ ){
		
		my $info = {page=>$pg, success=>0};
		my @list = ();

		my $sth = $dbh->prepare("select * from page_layout where page=? order by sura, aya");
		$sth->execute($pg);
		
		while( my $row = $sth->fetchrow_hashref ){
			$info->{success} ++;
			
			push @list, utils::JsOut($row);
		}
		$sth->finish;

		#print utils::JsOut( $info, "", join( ",\n", @list ) );

		open( FILE_HANDLE, ">pm_$pg.json" );
		print FILE_HANDLE utils::JsOut( $info, "", join( ",\n", @list ) );
		close FILE_HANDLE;
}
	$dbh->disconnect;
}
