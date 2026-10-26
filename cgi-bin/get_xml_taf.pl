#!/usr/bin/perl

use CGI qw/:standard/;
use HTTP::Date;
use XML::Simple;

my $TafXML = new XML::Simple(KeyAttr=>'index', RootName=>'quran');
my $filename =  CGI::param("src") || "/tafseer/en.yusufali";
my $sura = CGI::param("s") || "1";
my $aya = CGI::param("a") || "1";
my $root = $ENV{DOCUMENT_ROOT} || "c:/websites/new.muslim-web.com";
$filename = $root . $filename . ".xml";

unless ( -e $filename ){
	print qq{Content-Type: text/html;
Cache-Control: max-age=0, s-maxage=0, no-cache, no-store

Tafseer Not Found ($filename)
};
	exit;
}

my $xml = $TafXML->XMLin( $filename );
my $expiry = time2str(time+60*60*24*30*12);

print qq{Content-Type: text/html;
Expires: $expiry;

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
	<head>
		<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
		<link rel="StyleSheet" href="/tafseer.css"/>
	</head>
	<body>
	$xml->{sura}->{$sura}->{aya}->{$aya}->{text};
	</body>
</html>
};
