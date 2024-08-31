#!/usr/bin/perl

use File::Basename;
use lib dirname(__FILE__);

use qutils;

print "Content-Type: text/html;\n\n";


my $count = 0;

qutils::InitCGI();

open RECORDS   , $ENV{DOCUMENT_ROOT} . "/members.sql" or exit "Can't open $ENV{DOCUMENT_ROOT}/members.pl";

if (my $dbh = qutils::db_connect("quran"))
{
	$dbh->do("TRUNCATE members");
	while(<RECORDS>){
		$dbh->do($_);
		$count ++;
	}
	$dbh->disconnect;
}

close RECORDS;

print $count;