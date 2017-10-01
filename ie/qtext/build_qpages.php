<?php

$SuraNames =  array( "",
"الفاتحة","البقرة","ال عمران","النساء","المائدة","الانعام","الاعراف","الانفال","التوبة","يونس","هود","يوسف","الرعد","ابراهيم","الحجر",
"النحل","الاسراء","الكهف","مريم","طه","الانبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان",
"السجدة","الاحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الاحقاف","محمد","الفتح",
"الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة",	"المنافقون","التغابن",
"الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الانسان","المرسلات","النبا","النازعات","عبس","التكوير",
"الانفطار","المطففين","الانشقاق","البروج","الطارق","الاعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر",
"البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الاخلاص","الفلق","الناس",
);


$curr_page  = array( "number"=>0, "sura"=>0, "aya"=>0 );
$curr_sajda = array( "number"=>1, "sura"=>7, "aya"=>206 );
$curr_part  = array( "number"=>1, "sura"=>1, "aya"=>1 );

$db_conn = mysql_pconnect('localhost', 'root', 'kobool_2004') or die('Could not connect: ' . mysql_error());

mysql_select_db('quran',$db_conn) or die('Could not select database');

mysql_query("SET NAMES utf8");

for( $sura = 1 ; $sura <= 1; $sura ++ )
{
	$result = mysql_query("select * from quran_text where sura=" . $sura, $db_conn);
	
	$sura_str = DecToString($sura, 3);

	if( $curr_page["sura"] < $sura )
	{
		$curr_page = get_page_info( $db_conn, $curr_page["number"]+1);
	}

	$first_page = ( ( $curr_page["sura"] == $sura ) && ( $curr_page["aya"] == 1 ) ) ? $curr_page["number"] : $curr_page["number"] - 1;
	$last_page = $first_page;

?>
<html>
	<head>
		<!--#include virtual="/sura_inc_header.html"-->
		<script language="JavaScript">var gFirstPage=<?=$first_page?></script>
	</head>
	<body DIR="RTL" bgcolor="#efefde" onload="onSuraLoad()" >

		<div style="border:solid 1px silver;background:#dcdcb6">
			<span id="idPage" aya="1">(ص <?=$first_page?>)</span> 
			<span>(<?=$sura?>) سورة <?=$SuraNames[$sura]?></span>
		</div>
<?php

	if( $sura > 1 && $sura != 9 ){
		echo "<p id=idBasm>بِسْمِ اللّهِ الرَّحْمَنِ الرَّحِيمِ</p>\n";
	}
	
	$aya = 1;

	while( $row = mysql_fetch_assoc($result) )
	{
		if($sura == $curr_part["sura"] && $aya == $curr_part["aya"] )
		{
			echo "<p id=idPart>(الجزء " . $curr_part["number"]. ")</p>\n";

			$curr_part = get_part_info( $curr_part["number"] + 1 );
		}

		if($sura == $curr_page["sura"] && $aya == $curr_page["aya"] )
		{
			if( $aya > 1 ){
				echo "\t\t<p id=idPage pageNo=" . $curr_page["number"] . " aya=$aya>(ص ". $curr_page["number"].")</p>\n";
			}
			$last_page = $curr_page["number"];
			$curr_page = get_page_info( $db_conn, $curr_page["number"]+1);
		}

		echo "\t\t<p id=idAya><A NAME=$aya></A> ". $row["text"] . " <a href=\"javascript:ac($aya)\">(" . $aya . ")</a>\n";

		if($sura == $curr_sajda["sura"] && $aya == $curr_sajda["aya"] )
		{
			echo "\t\t<div>( س )</div>\n";

			$curr_sajda = get_sajda_info( $curr_sajda["number"] + 1 );
		}

		$aya ++;
	}

	$out = <<<EOT
		<div style="height:400px"></div>
	<script language="JavaScript">
		var gSuraNo=$sura;
		var gLastPage=$last_page;
		writeMenu();
	</script>
	</body>
</html>
EOT;
	echo $out;

}

function get_page_info( $db_conn, $page_number )
{# returns sura and aya
	
	$result = mysql_query("select * from pages where id=" . $page_number, $db_conn);

	$page_info = mysql_fetch_assoc($result);
	
	if($page_info){
		$page_info["number"] = $page_number;
		return $page_info;
	}
	return array("number"=>0, "sura"=>0, "aya"=>0);
}

function get_part_info($part_number)
{
	$part_index = ( $part_number - 1 ) * 2;

	$Parts = array(
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

	return array(	"number"	=>$part_number, 
					"sura"		=> $Parts[$part_index ], 
					"aya"		=> $Parts[$part_index + 1] );
}

function get_sajda_info( $sajda_number )
{
	$sajda_index = ( $sajda_number - 1 ) * 2;

$sajadat= array(
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

	return array(	"number"	=>$sajda_number, 
					"sura"		=> $sajadat[$sajda_index ], 
					"aya"		=> $sajadat[$sajda_index + 1] );
}

function DecToString( $nValue , $nDigits)
{
	$sValue = "$nValue";
	
	while( strlen($sValue) < $nDigits )
	{
		$sValue = "0" . $sValue; 
	}
	
	return $sValue;
}

?>