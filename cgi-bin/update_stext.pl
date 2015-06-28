#!/usr/bin/perl

use qutils;

if( my $dbh = qutils::db_connect() )
{
	
	if( my $sth = $dbh->prepare("select * from quran_data") )
	{
		if( $sth->execute() ){
			while( my $row = $sth->fetchrow_hashref )
			{	
				my $stext = ReplaceAmbChars($row->{aya_text});
				$dbh->do("update quran_data set aya_stext = ? where id = ?", undef, $stext, $row->{id});
			}
		}

		$sth->finish;
	}
	$dbh->disconnect;
}

sub ReplaceAmbChars
{
	my $sText = shift;

	$sText =~ s/[\xF0-\xFF]//g; # remove TASHKEEL
#	$sText =~ s/Ê« /Ê /g; # replace WAW GAMAA
	$sText =~ s/[\x21-\x7F]//g; # remove symbols and latin
	$sText =~ s/\xC2|\xC3|\xC5/\xC7/g; # replace ALEF
	$sText =~ s/\xC9/\xE5/g; # replace HAA
	$sText =~ s/\xC4|\xC6/\xC1/g; # replace HAMTHA
	$sText =~ s/Ì/Ï/g; # replace YAA

	return $sText;
}
