#!/usr/bin/perl

print "Content-Type: text/html;\r\n\r\n";


open COUNTER_R, "<" . $ENV{DOCUMENT_ROOT} . "/search_log.txt";

print "
<html>
<head>
<meta http-equiv=Content-Type content='text/html; charset=windows-1256'>
<title>search report</title>
<STYLE type='text/css'>
	A           { TEXT-DECORATION:none }
	A:link		{ color:#003399; }
	A:visited	{ color:#003399; }
	A:hover		{ color:red;}
	td          {FONT-SIZE:8pt;FONT-FAMILY:tahoma;border-bottom:solid 1 silver}
	body        {FONT-SIZE:10pt;FONT-FAMILY:tahoma}
</STYLE>
</head>
<body>

<h2>quran.muslim-web.com search report</h2>

<p>Total searches: <span id=idTotal>counting...</span></p>
<table border=0 cellspacing=0 width=100%>
<tr><td align=center>Seq.</td><td align=center>Search keyword</td><td align=right>Count</td></tr>";

my $seq = 1;
my $total = 0;
while (<COUNTER_R>)
{
	my ($count, $keyword) = split (",");

	print "<span onmouseenter=\"this.style.background='red'\"  onmouseleave=\"this.style.background='white'\">
	<tr><td align=left>$seq</td><td align=right>$keyword</td><td align=right>$count</td></tr></span>
		";

	$seq ++;
	$total += $count;
}

print "</table>
<script>
	idTotal.innerText='$total';
</script>
</body>
</html>
";

close COUNTER_R;
