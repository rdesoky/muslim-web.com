#!/usr/bin/perl

use CGI qw( :standard );

use qutils;

my $rm_url = qutils::GetParam("rm", "");

#print "Content-Type: text/html;\n\n";
print "Content-Type: audio/x-pn-realaudio;\n\n";

print $rm_url;