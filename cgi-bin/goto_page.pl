#!/usr/bin/perl

use CGI qw( :standard );

use qutils;

my $page_number = qutils::GetParam("p", 1);
my $domain = qutils::GetParam("d", "quran.muslim-web.com");
my $sura = 1;
my $aya  = 1;

print "Content-Type: application/xml; Cache-Control: NO-STORE;\n\n";
print "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n";

if( my $dbh = qutils::db_connect() )
{
	my $sth = $dbh->prepare("select * from pages where id=?");
	if($sth)
	{
		my $row_count = int( $sth->execute($page_number) );
		
		if( $row_count ){
			my $row = $sth->fetchrow_hashref();
			if( $row ){
				$sura	= $row->{sura};
				$aya	= $row->{aya };
			}
		}
		
		$sth->finish;
	}
	$dbh->disconnect;
}

#print CGI->redirect( -uri=> "http://${domain}/sura.htm?aya=${sura}${aya}" );
print qutils::XMLout( {page=>$page_number, sura=>$sura, aya=>$aya}, "page_location" );

#-------------------------------------------------------------------------
sub DecToString
{
	my $nValue = shift;
	my $nDigits = shift;

	my $sValue = "$nValue";
	
	while( length ( $sValue ) < $nDigits )
	{
		$sValue = "0" . $sValue; 
	}
	
	return $sValue;
}
