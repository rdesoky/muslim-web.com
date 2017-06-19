#!/usr/bin/perl

my $lookup = 
{
#	getString => GS,
#	ShowElement => SE,
#	MessageBox => MB,
#	AsyncLoadXmlUrl => Ax,
#	AsyncLoadXMLUrl => AX,
#	getCookie => GC,
#	myGetAttribute => GA,
#	SetInnerTextFromList => SI,
#	DebugPrint => DP,
#	GetVSpacer => VS,
#	GetHSpacer => HS
#	,ShowError => ER
#	,gMemberID => MI
#	,gXmlResponse => XM
#	,gUserInfo => UI
#	,xmlRecord => XR
#	,ShowProcessing => SP
#	,HideProcessing => HP
#	,xmlRoot => RO
#	,GetAdParamKey => AK
};

open SOURCE, "< " . @ARGV[0] or exit;
open TARGET, "> " . @ARGV[1] or die;

while( <SOURCE> )
{

	s/^\s*//; # remove indentation

	s/\<\!\-\-\s*\#/\< \!\-\-\#/; # preserce <!-- #
	s/\<\!\-\-.*\-\-\>//;
	s/\< \!\-\-\#/\<\!\-\-\#/;
	
	s/else/else /g;
	s/\s*\{\s*/\{/g;
	s/\s*\}\s*/\}/g;
	s/\s*\(\s*/\(/g;
	s/\s*\=\s*/\=/g;
	s/\s*\+\s*/\+/g;
	s/\s*\,\s*/\,/g;
	s/\s*\;\s*/\;/g;
	s/\s*\>\s*/\>/g;
	s/\s*\<\s*/\</g;
	s/\s*\:\s*/\:/g;
	s/\s*\?\s*/\?/g;
	s/\s*\&\&\s*/\&\&/g;
	s/\s*\*\s*/\*/g;
	s/\s*\/\s*/\//g;


	s/\s*\+\=\s*/\+\=/g;
	s/\s*\=\=\s*/\=\=/g;
	
	s/\s*\)\s*/\)/g;
	
	s/http\:\/\//http\:\/ \//g; #to preserve http:// convert it to http:/ /
	s/\/\/.*//g; # remove comments
	s/http\:\/ \//http\:\/\//g; #restore http://
	
	s/\n//g;
	s/\s+/ /g;

	foreach my $key ( keys %{$lookup} ) 
	{
		#print $key . " " . $lookup->{$key};
		s/$key/$lookup->{$key}/g;
	}
	
	print TARGET ;
#	print TARGET "\n";

}

close SOURCE;
close TARGET;

