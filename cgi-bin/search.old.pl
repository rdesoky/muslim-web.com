#!/usr/bin/perl

use qutils;

qutils::InitCGI();

print "Content-Type: text/html;\n\n";

my @aya_count = (
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54
, 45, 83, 182,  88,  75,  85,  54, 53,  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20
, 56, 40,  31,  50,  40,  46,  42, 29,  19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6 
);

my @SuraNames = ( 
"«·›« Õ…","«·»ﬁ—…","«· ⁄„—«‰","«·‰”«¡","«·„«∆œ…","«·«‰⁄«„","«·«⁄—«›","«·«‰›«·","«· Ê»…","ÌÊ‰”","ÂÊœ","ÌÊ”›","«·—⁄œ","«»—«ÂÌ„","«·ÕÃ—",
"«·‰Õ·","«·«”—«¡","«·ﬂÂ›","„—Ì„","ÿÂ","«·«‰»Ì«¡","«·ÕÃ","«·„ƒ„‰Ê‰","«·‰Ê—","«·›—ﬁ«‰","«·‘⁄—«¡","«·‰„·","«·ﬁ’’","«·⁄‰ﬂ»Ê ","«·—Ê„","·ﬁ„«‰",
"«·”Ãœ…","«·«Õ“«»","”»√","›«ÿ—","Ì”","«·’«›« ","’«œ","«·“„—","€«›—","›’· ","«·‘Ê—Ï","«·“Œ—›","«·œŒ«‰","«·Ã«ÀÌ…","«·«Õﬁ«›","„Õ„œ","«·› Õ",
"«·ÕÃ—« ","ﬁ","«·–«—Ì« ","«·ÿÊ—","«·‰Ã„","«·ﬁ„—","«·—Õ„‰","«·Ê«ﬁ⁄…","«·ÕœÌœ","«·„Ã«œ·…","«·Õ‘—","«·„„ Õ‰…","«·’›","«·Ã„⁄…","«·„‰«›ﬁÊ‰","«· €«»‰",
"«·ÿ·«ﬁ","«· Õ—Ì„","«·„·ﬂ","«·ﬁ·„","«·Õ«ﬁ…","«·„⁄«—Ã","‰ÊÕ","«·Ã‰","«·„“„·","«·„œÀ—","«·ﬁÌ«„…","«·«‰”«‰","«·„—”·« ","«·‰»«","«·‰«“⁄« ","⁄»”","«· ﬂÊÌ—",
"«·«‰›ÿ«—","«·„ÿ››Ì‰","«·«‰‘ﬁ«ﬁ","«·»—ÊÃ","«·ÿ«—ﬁ","«·«⁄·Ï","«·€«‘Ì…","«·›Ã—","«·»·œ","«·‘„”","«··Ì·","«·÷ÕÏ","«·«‰‘—«Õ","«· Ì‰","«·⁄·ﬁ","«·ﬁœ—",
"«·»Ì‰…","«·“·“·…","«·⁄«œÌ« ","«·ﬁ«—⁄…","«· ﬂ«À—","«·⁄’—","«·Â„“…","«·›Ì·","ﬁ—Ì‘","«·„«⁄Ê‰","«·ﬂÊÀ—","«·ﬂ«›—Ê‰","«·‰’—","«·„”œ","«·«Œ·«’","«·›·ﬁ","«·‰«”",
);


my $lineNumber=0;

my $search_text = qutils::GetParam("s","***") ;
my $search_for  = ReplaceAmbChars($search_text);

if (length ($search_for) > 2 ) 
{
	my $ResultsText="";
	my $ResultCount=0;

	#print "$search_text<br>$search_for<br>( $ResultsText )<p>";

	#LogSearchText($search_text);

	open QURAN_S , $ENV{DOCUMENT_ROOT} . "/quran_search.txt" or die "Can't open $ENV{DOCUMENT_ROOT}/quran_search.txt";
	open QURAN   , $ENV{DOCUMENT_ROOT} . "/quran_dbase.txt" or die "Can't open $ENV{DOCUMENT_ROOT}/quran_dbase.txt";

	while(<QURAN>)
	{
		my $aya_text = $_;

		my $curr_line = <QURAN_S>; # read the searchable aya

		if($curr_line =~ m/$search_for/) 
		{
			my ($sura_num,$aya_num) = GetAyaLocation($lineNumber); 
			$aya_num ++;
			$sura_num ++;
			$sura = NumToString ($sura_num , 3);
			$aya  = NumToString ($aya_num  , 3);

			my $extend = "";

			$aya_text =~ s/[\xF0-\xFF]//g; # remove TASHKEEL
			
			if (length ($aya_text) > 80){
				$extend = "...";
			}

			if (length ($ResultsText) > 0) {
				$ResultsText .= ";";
			}

			$ResultsText .= "$sura_num,$aya_num," . substr ($aya_text ,0, 80) . $extend;

			$ResultCount ++;
		};

		$lineNumber ++;
	}

	close QURAN;
	close QURAN_S;

	if ($ResultCount == 0) {
		print "not found($search_for,$search_text)";
	}
	else {
		print $ResultsText;
	}

}
else
{
	print "not found($search_for,$search_text)";
}
#------------------------------------------------------------------------------------
#
#------------------------------------------------------------------------------------
sub LogSearchText
{
	my $search_text = shift;

	my $count = 1;

	open (READLOG , "<", $ENV{DOCUMENT_ROOT} . "/search_log.txt") or return;
	open (WRITELOG, ">", $ENV{DOCUMENT_ROOT} . "/write_log.txt") or return;
	
	while( <READLOG> )
	{
		my ($this_count,$this_word) = split (",");


		if($this_word eq $search_text) {
			#print "matching $this_word";
			$count = $this_count + 1;
			print WRITELOG "${count},${search_text},\n";
		}			
		else{
			#print "'${this_word}'<p>";
			print WRITELOG;
		}

		#print "$_<p>";
	}

	if ($count == 1) 
	{
		#print "${count},${search_text}\n" ;
		print WRITELOG "${count},${search_text},\n" ;
	}

	close WRITELOG;
	close READLOG;

	rename $ENV{DOCUMENT_ROOT} . "/write_log.txt", $ENV{DOCUMENT_ROOT} . "/search_log.txt";
}
#------------------------------------------------------------------------------------
#
#------------------------------------------------------------------------------------
sub ReplaceAmbChars
{
	my $sText = shift;

	$sText =~ s/[\xF0-\xFF]//g; # remove latin and TASHKEEL
#	$sText =~ s/Ê« /Ê /g; # replace WAW GAMAA
	$sText =~ s/[\x01-\x7F]//g; # remove latin and TASHKEEL
	$sText =~ s/\xC2|\xC3|\xC5/\xC7/g; # replace ALEF
	$sText =~ s/\xC9/\xE5/g; # replace HAA
	$sText =~ s/\xC4|\xC6/\xC1/g; # replace HAMTHA
	$sText =~ s/Ì/Ï/g; # replace YAA

	return $sText;
}
#------------------------------------------------------------------------------------
#
#------------------------------------------------------------------------------------
sub GetAyaLocation
{
	my $line_number = shift;
	my $sura_num, $aya_total;

	$aya_total = 0;

	for ($sura_num=0; $sura_num< 114; $sura_num ++) 
	{

		if ( ($aya_total + @aya_count[$sura_num]) > $line_number) 
		{
			return ( $sura_num, $line_number - $aya_total );
		}
		
		$aya_total += @aya_count[$sura_num];
	}
}
#------------------------------------------------------------------------------------
#
#------------------------------------------------------------------------------------
sub NumToString
{
	my $number = shift;
	my $digits = shift;
	
	my $ret = "$number";

	while ( length ($ret) < $digits ) {
		$ret = "0" . $ret;
	}

	return $ret;
}
