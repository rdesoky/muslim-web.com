#!/usr/bin/perl

print "Content-Type: text/html;\r\n\r\n";


open COUNTER_R, "<" . $ENV{DOCUMENT_ROOT} . "/count.txt";

my $ltime = localtime(time);

print "
<html>
<meta http-equiv='refresh' content='300'>
<head>
<title>quran.muslim-web.com access report</title>
<STYLE type='text/css'>
	A           { TEXT-DECORATION:none }
	A:link		{ color:#003399; }
	A:visited	{ color:#003399; }
	A:hover		{ color:red;}
	td          {FONT-SIZE:8pt;FONT-FAMILY:tahoma;border-bottom:solid 1 silver;padding-right:10px}
	body        {FONT-SIZE:10pt;FONT-FAMILY:tahoma}
	.hdng    {color:blue;background:yellow;border-top:solid 1 silver}
	.msr	{color:green;border-right:solid 1px silver;border-bottom:none;padding:1px;}
</STYLE>
</head>
<body>

<h2>quran.muslim-web.com access report</h2>

<span style='border:solid 1px silver'><a href='show_count.pl' target=_self>&nbsp;Refresh&nbsp;</a></span> $ltime
<table cellspacing=0 width=100%>
<tr>
		<td class=hdng>Day</td>
		<td class=hdng>Sessions</td>
		<td class=hdng>Page&nbsp;Hits</td>
		<td class=hdng>Last&nbsp;Access</td>
		<td class=hdng width=100%>Sessions&nbsp;Graph</td>
</tr>";

my $rows = "";
my $row_count=0;
while (<COUNTER_R>)
{
	$row_count ++;

	if ($row_count>0) {
		my ($day,$sessions, $count, $hour) = split (":");
		my $percent = ($sessions+1) * 50 / 10000; 
		if (not $hour) {
			$hour = $count;
			$count = $sessions;
		}
		$rows = "
		<tr>
			<td NOWRAP>$day</td>
			<td NOWRAP align=right style='color:green'><b>$sessions</b></td>
			<td NOWRAP align=right style='color:green'><b>$count</b></td>
			<td NOWRAP>$hour</td>
			<td style='padding-right:0px'><table style='position:absolute' width=100% border=0 cellpadding=0 cellspacing=0>
				<tr>
					<td class=msr width=10%>0</td>
					<td class=msr width=10%>2000</td>
					<td class=msr width=10%>4000</td>
					<td class=msr width=10%>6000</td>
					<td class=msr width=10%>8000</td>
					<td class=msr width=10%>10000</td>
					<td class=msr width=10%>12000</td>
					<td class=msr width=10%>14000</td>
					<td class=msr width=10%>16000</td>
					<td class=msr width=10%>18000</td>
				</tr>
				</table>
				<span style='border:solid 1px navy;background:orange;width:${percent}%'></span>
			</td>
		</tr>" . $rows;
	}
}
print $rows;
print "</table>
</body>
</html>
";

close COUNTER_R;
