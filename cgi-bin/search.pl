#!/usr/bin/perl
use lib "/var/www/html/muslim-web/cgi-bin";#absolute path is required due to mod-perl environment

use qutils;

qutils::InitCGI();

print "Content-Type: application/xml; Cache-Control: NO-STORE;\n\n";
print "<?xml version=\"1.0\" encoding=\"windows-1256\" ?>\n";


my $page = int( qutils::GetParam( "p", 0 ) );
my $page_size = int( qutils::GetParam( "ps", 10 ) );
my $start =  $page * $page_size ;

my $search_text = qutils::GetParam( "s", "���� ����" );
my $search_for  = ReplaceAmbChars($search_text);

my $ret_info = { success=>0, total=>0, search_for=>$search_for, search_text=>$search_text, start=>$start, page_size=>$page_size, page=>$page };
my $results = "";

if( length( $search_for ) > 0 ) 
{
	my $ResultCount=0;

	if( my $dbh = qutils::db_connect() )
	{
		my $sQuery = "select id from quran_data where aya_stext like binary " . $dbh->quote("%$search_for%");
		#$ret_info->{query} = $sQuery;
		$ret_info->{total} = $dbh->do( $sQuery );
		
		if( $ret_info->{total} > 0 )
		{
			if( my $sth=$dbh->prepare(
				"select sura_num, aya_num, aya_plain_text, page from quran_data where aya_stext like binary " . $dbh->quote("%". $search_for . "%") . 
				" order by sura_num, aya_num limit $start, $page_size " ) 
			)
			{
				$ret_info->{count} = int( $sth->execute() );
				
				if( 0 < $ret_info->{count} )
				{
					while( my $row = $sth->fetchrow_hashref() )
					{
						$aya_text = $row->{aya_plain_text};

						$sura_num = $row->{aya_num} + 1;
						$aya_num  = $row->{sura_num} + 1;
						$results .= qutils::XMLout( $row, "aya" ) ;
					}
				}
				$sth->finish;
			}
		}
		$dbh->disconnect;
		$ret_info->{success}=1;
	}
	else
	{
		$ret_info->{error} = "no_db_connection";
	}
}
else
{
	$ret_info->{error} = "invalid_text";
}

print qutils::XMLout( $ret_info, "search_results", $results);

#------------------------------------------------------------------------------------
#
#------------------------------------------------------------------------------------
sub ReplaceAmbChars
{
	my $sText = shift;

	$sText =~ s/[\xF0-\xFF]//g; # remove TASHKEEL
	$sText =~ s/\s+/ /g; # remove extra spaces
#	$sText =~ s/�� /� /g; # replace WAW GAMAA
	$sText =~ s/[\x21-\x7F]//g; # remove symbols and latin
	$sText =~ s/\xC2|\xC3|\xC5/\xC7/g; # replace ALEF
	$sText =~ s/\xC9/\xE5/g; # replace HAA
	$sText =~ s/\xC4|\xC6/\xC1/g; # replace HAMTHA
	$sText =~ s/�/�/g; # replace YAA

	return $sText;
}
