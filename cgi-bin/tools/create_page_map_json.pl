#!/usr/bin/perl

use lib "/websites/kobool.com/cgi-bin/";

use utils;
use JSON;
#my $json = JSON->new->allow_nonref->pretty;
my $json = JSON->new->allow_nonref;

if( my $dbh = utils::db_connect("quran","home.kobool.com") )
{
	
	for( my $pg = 1; $pg < 605; $pg ++ ){
		
		my $info = {page=>$pg, success=>0,child_list=>[]};
		my $sth = $dbh->prepare("select * from page_layout where page=? order by sura, aya");
		$sth->execute($pg);
		
		while( my $row = $sth->fetchrow_hashref ){
			$info->{success} ++;
			push @{$info->{child_list}}, $row;
		}
		$sth->finish;

		open( FILE_HANDLE, ">pm_$pg.json" );
		print FILE_HANDLE $json->encode($info);
		close FILE_HANDLE;
	}
	$dbh->disconnect;
}
