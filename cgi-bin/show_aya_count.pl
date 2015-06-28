#!/usr/bin/perl

print "Content-Type: text/html;\r\n\r\n";


open COUNTER_R, "<" . $ENV{DOCUMENT_ROOT} . "/aya_count.txt";

my $ltime = localtime(time);

print "
<html>
<meta http-equiv='refresh' content='300'>
<head>
<title>get_aya access report</title>
<STYLE type='text/css'>
	A           { TEXT-DECORATION:none }
	A:link		{ color:#003399; }
	A:visited	{ color:#003399; }
	A:hover		{ color:red;}
	td          {FONT-SIZE:8pt;FONT-FAMILY:tahoma;border-bottom:solid 1 silver;padding-right:10px}
	body        {FONT-SIZE:10pt;FONT-FAMILY:tahoma}
	.heading    {color:blue;background:yellow;border-top:solid 1 silver}
</STYLE>
</head>
<body>

<span style='border:solid 1px silver'><a href='show_aya_count.pl' target=_self>&nbsp;Refresh&nbsp;</a></span> $ltime
<table cellspacing=0 width=100%>
<tr><td class=heading>Day</td><td class=heading>Sessions</td><td class=heading>Last&nbsp;Access&nbsp;Time</td><td class=heading width=100%>Graph</td></tr>";

my $rows = "";

while (<COUNTER_R>)
{
	my ($day, $count, $hour) = split (":");
	my $percent = ($count+1) * 100 / 3000; 

	$rows = "<tr><td NOWRAP>$day</td><td NOWRAP align=right style='color:green'><b>$count</b></td><td NOWRAP>$hour</td>
	<td><span style='border:solid 1px navy;background:orange;width:${percent}%'></span></td>
	</tr>" . $rows;
}
print $rows;
print "</table>
</body>
</html>
";

close COUNTER_R;
