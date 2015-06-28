#!/usr/bin/perl
use strict;

print "Content-Type: text/plain;\n\n";

my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday) = localtime(); 

$year += 1900; $mon += 1;

my $bfolder =  "${year}-${mon}-${mday}_${hour}-${min}"; 

qx (md \\\\p4ramy\\quran_backup\\$bfolder);
qx (mysqldump quran > \\\\p4ramy\\quran_backup\\$bfolder\\quran.sql);


print $bfolder;