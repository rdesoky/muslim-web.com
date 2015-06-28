#!/usr/bin/perl

use qutils;

qutils::InitCGI();

my $dbh = qutils::db_connect("quran");

#print header();
print "Content-Type: application/xml; Cache-Control: NO-STORE;\n\n";

if (! $dbh)
{
	print "Could not connect to Database";
	die;	
}


my $from = qutils::GetParam("from",0);
my $sql_statement;
my $sth;
my $row;

	print "<html>
	<header>
	<meta http-equiv=Content-Type content=\"text/html; charset=windows-1256\">
	<script>
		window.setInterval(\"window.location.reload()\", 5 * 60000);
	</script>
	</header>
	<body>
	<STYLE type=\"text/css\">
		A           { TEXT-DECORATION:none }
		A:link		{ color:#003399; }
		A:visited	{ color:#003399; }
		td          {FONT-SIZE=11px;FONT-FAMILY=tahoma;background=white}
		body        {FONT-SIZE=10pt;FONT-FAMILY=tahoma;background=#dcdcb6}
	</STYLE>

	<table border><tr><td NOWRAP><b>id</b></td>
				   <td NOWRAP><b>date_created</b></td>
				   <td NOWRAP><b>date_updated</b></td>
				   <td NOWRAP><b>login_id</b></td>
				   <td NOWRAP><b>password</b></td>
				   <td NOWRAP><b>email</b></td>
				   <td NOWRAP><b>memorize</b></td>
				   <td NOWRAP><b>pending_memorize</b></td>
				   <td NOWRAP><b>machine_id</b></td>
				   ";
	$sql_statement = "SELECT * FROM members where Length(memorize) > 0 order by date_updated desc limit $from,100";
	$sth = $dbh->prepare($sql_statement);
	$sth->execute;
	while ($row = $sth->fetchrow_hashref)
	{
		my $ip_address  = $row->{machine_id};
		
		$ip_address =~ s/_.*//;

		print "<tr><td NOWRAP>$row->{id}</td>
				   <td NOWRAP>$row->{date_created}</td>
				   <td NOWRAP>$row->{date_updated}</td>
				   <td NOWRAP>$row->{login_id}</td>
				   <td NOWRAP>$row->{password}</td>
				   <td NOWRAP>$row->{email}</td>
					<td NOWRAP><a href=http://www.ripe.net/perl/whois?form_type=simple&full_query_string=&searchtext=$ip_address xhref=http://ws.arin.net/cgi-bin/whois.pl?queryinput=$ip_address target=_blank>$row->{machine_id}</a></td>
				   <td NOWRAP>$row->{memorize}</td>
				   <td NOWRAP>$row->{pending_memorize}</td>
				   ";
	}
	$sth->finish;

	print "</table>
	</body>
	</html>";

$dbh->disconnect;

