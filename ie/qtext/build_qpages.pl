#!/usr/bin/perl

use DBI;
use utf8;
#use Encode;

#binmode STDOUT, ":utf8";

my @SuraNames =  ( "",
"الفاتحة","البقرة","ال عمران","النساء","المائدة","الانعام","الاعراف","الانفال","التوبة","يونس","هود","يوسف","الرعد","ابراهيم","الحجر",
"النحل","الاسراء","الكهف","مريم","طه","الانبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان",
"السجدة","الاحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الاحقاف","محمد","الفتح",
"الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة",	"المنافقون","التغابن",
"الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الانسان","المرسلات","النبا","النازعات","عبس","التكوير",
"الانفطار","المطففين","الانشقاق","البروج","الطارق","الاعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر",
"البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الاخلاص","الفلق","الناس",
);


#my $text = "ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ";
#$text =~ s/([\x{06D6}-\x{06DC}])/\<span class=ps\>$1\<\/span\>/gi;
#$text =~ s/([\x{06D6}-\x{06DC}])/\<span class=ps\>$1\<\/span\>/gi;
#print $text . "\n";

#print @SuraNames[3] . "\nCheck UTF8:" . utf8::valid( @SuraNames[3] );

sub str_opt
{
	my $in_str = shift;
	
	#$in_str =~ s/[\t|\n]//g;

	return $in_str;
}

sub hide_it
{
	return "";
}

my $max_page = 604;
my $curr_page  = { number=>1, sura=>1, aya=>1 };
my $curr_sajda = { number=>1, sura=>7, aya=>206 };
my $curr_part  = { number=>1, sura=>1, aya=>1 };

#if( my $dbh = qutils::db_connect("cgi.muslim-web.com") )

if( my $dbh = DBI->connect("DBI:mysql:database=quran;host=localhost", "root", "kobool_2004" ) )
{
	my $first_page=1, $last_page=1;
	
	#print "mysql_enable_utf8:" . $dbh->{mysql_enable_utf8};
	$dbh->do("SET NAMES utf8");
	my $sth = $dbh->prepare( q( select * from quran_text where sura=? ) );

	my $basmalah = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
	
	for( my $sura = 1 ; $sura <= 114; $sura ++ )
	{
		my $sura_str = DecToString($sura, 3);

		if( $sura == $curr_page->{sura} && $curr_page->{aya} == 1 )
		{# sura starts at new page
		#	$curr_page  = get_page_info( $dbh, $curr_page->{number}+1 );
		#	$first_page = $curr_page->{number};
			$first_page = $curr_page->{number};
		}
		else
		{# sura starts at the middle of current page
		#	$first_page = $curr_page->{number} - 1;
			$first_page = $curr_page->{number} - 1;
		}

		#$first_page = ( ( $curr_page->{sura} == $sura ) && ( $curr_page->{aya} == 1 ) ) ? $curr_page->{number} : $curr_page->{number} - 1;

		open STDOUT, ">:encoding(UTF-8)", "sura_${sura_str}.php";

		print STDOUT str_opt qq{<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
	<head>
		<?php include( "sura_inc_header.php" ) ?>
	</head>
	<body>
		};


		print STDOUT str_opt "<p>($sura - سورة @SuraNames[$sura])</p>\n";

		if( $sura != 1 && $sura != 9 ){
			print_page_button( $first_page, 1, "<span class='basm'>$basmalah</span>" );
		}
		else{
			print_page_button( $first_page, 1 );
		}

		$sth->execute($sura);

		my $aya = 1;

		while( my $row = $sth->fetchrow_hashref )
		{
			if( $sura == $curr_part->{sura} && $aya == $curr_part->{aya} )
			{
				print STDOUT str_opt "\t\t<p id='Part_$curr_part->{number}'>(الجزء $curr_part->{number})</p>\n";
				$curr_part = get_part_info( $curr_part->{number} + 1 );
			}

			if($sura == $curr_page->{sura} && $aya == $curr_page->{aya} )
			{
				if( $aya > 1 ){
					print_page_button( $curr_page->{number}, $aya );
				}

				$last_page = $curr_page->{number};
				$curr_page = get_page_info( $dbh, $curr_page->{number}+1);
			}
			
			my $aya_text = $row->{text};
			utf8::decode($aya_text);
			#Encode::from_to( $aya_text, "utf8", "utf8" );

			if( $aya == 1 ){
				if($sura == 1){
					$basmalah = $aya_text;
				}else{
					$aya_text =~ s/$basmalah//gi;
				}
			}

			$aya_text =~ s/([\x{06D6}-\x{06FF}])/\<span class\=ps\>$1\<\/span\>/gi;
			
			$aya_index = $aya - 1;

			print STDOUT str_opt qq{
		<p aya="${aya}">
			<span amenu='${aya}'></span>$aya_text&nbsp;
			<span akey="${aya}">($aya)</span>
		</p>\n
			};

			if( $sura == $curr_sajda->{sura} && $aya == $curr_sajda->{aya} )
			{
				print STDOUT str_opt qq{ \t\t<div>( س )</div>\n };

				$curr_sajda = get_sajda_info( $curr_sajda->{number} + 1 );
			}

			$aya ++;
		}

		print STDOUT hide_it qq(

		<table onmousewheel="return WheelScrollPages()" 
			cellspacing=0 cellpadding=0 id=idPageViews scroll=1 onmouseover="ShowElement('idPageViews',500)" 
			onmouseout="HideElement('idPageViews',500)" 
			style="border:solid 1px silver;position:absolute;left:15px;display:none;">
		<tr>
			<td id=idPageViewFrame align=center style="background-repeat:repeat-y;cursor:hand;" onclick="PrevPage()"><div><img src=/images/prev.gif border=0> صفحة سابقة</div><img id=idPageView side=0 src="/images/space.gif" width=100%><div id=idPageNo></div></td>
			<td id=idPageViewFrame align=center style="background-repeat:repeat-y;cursor:hand;" onclick="NextPage()"><div>صفحة تالية <img src=/images/next.gif border=0></div><img id=idPageView side=1 src="/images/space.gif" width=100%><div id=idPageNo></div></td>
		</tr>
		</table>
		<div onmouseover="ShowElement('idAyaPreview',500)" 
				onmouseout="HideElement('idAyaPreview',500)" 
				style="color:maroon;position:absolute;font-weight:bold;width:360px;display:none;background:#FFFF99;left:4px;filter:progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=70);border-top:solid 3px white;border-left:solid 3px white;border-bottom:solid 3px gray;border-right:solid 3px gray;" 
				id="idAyaPreview">
		</div>

		<script language="JavaScript">
			var gLastPage=$last_page;
		</script>
);

		print STDOUT str_opt qq(
	</body>
</html>
);

		close STDOUT;
	}

	$sth->finish;
	$dbh->disconnect;

}

sub print_page_button
{
	my $curr_page = shift;
	my $aya = shift;
	my $title = shift;
	
	if( !defined $title )
	{
		$title = "";
	}
	my $prev_page = $curr_page - 1;
	my $next_page = $curr_page + 1;

	print STDOUT str_opt qq( 
		<p><span class='pageButton'>
				<span class='upBtn'>&nbsp;</span
					><span pageNo="$curr_page">(ص $curr_page)</span
				><span class='dnBtn'>&nbsp;</span>
			</span>
			$title
		</p>
);

}

sub get_page_info
{# returns sura and aya
	my $dbh = shift;
	
	my $page_number = shift;

	if( $page_number <= 1 ){
		return {number=>1, sura=>1, aya=>1};
	}
	if( $page_number > $max_page ){
		return {number=>605, sura=>115, aya=>1}
	}
	
	my $sth = $dbh->prepare("select * from pages where id=?");

	$sth->execute($page_number);

	my $page_info = $sth->fetchrow_hashref;

	$sth->finish;

	if($page_info){
		$page_info->{number} = $page_number;
		return $page_info;
	}
	return {number=>1, sura=>1, aya=>1};
}

sub get_part_info
{
	my $part_number = shift;
	my $part_index = ( $part_number - 1 ) * 2;

	my @Parts = (
1,		1,	
2,		142,
2,		253,
3,		93,	
4,		24,	
4,		149,
5,		82,	
6,		111,
7,		88,	
8,		41,	
9,		93,	
11,		6,	
12,		53,	
15,		1,	
17,		1,	
18,		75,	
21,		1,	
23,		1,	
25,		21,	
27,		56,	
29,		46,	
33,		31,	
36,		28,	
39,		32,	
41,		47,	
46,		1,	
51,		31,	
58,		1,	
67,		1,	
78,		1
);

	return{ number=>$part_number, 
			sura=> @Parts[$part_index ], 
			aya=> @Parts[$part_index + 1] };
}

sub get_sajda_info
{
	my $sajda_number = shift;
	my $sajda_index = ( $sajda_number - 1 ) * 2;

my @sajadat=(
7, 206, 
13, 15, 
16, 50, 
17, 109,
19, 58, 
22, 18, 
22, 77, 
25, 60, 
27, 26, 
32, 15, 
38, 24, 
41, 38, 
53, 62, 
84, 21, 
96, 19 );

	return{ number=>$sajda_number, 
			sura=> @sajadat[$sajda_index ], 
			aya=> @sajadat[$sajda_index + 1] };
}

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

