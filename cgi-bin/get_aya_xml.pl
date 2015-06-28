#!/usr/bin/perl

use qutils;
use XML::Simple;

print "Content-Type: text/html; charset=windows-1256

";

my $my_count=0;
my $sth;
my $sql_statement;
my $row;
my $lineNumber=0;

my @aya_count = (
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54
, 45, 83, 182,  88,  75,  85,  54, 53,  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20
, 56, 40,  31,  50,  40,  46,  42, 29,  19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6 
);

my $min_length = GetParam("min", 20);
my $max_length = GetParam("max", 40);


#my $dbh = DBI->connect("DBI:mysql:database=quran;host=localhost", "root", "")  or die "could not connect to database";
#my $dbh = DBI->connect("DBI:mysql:database=rdesoky_quran;host=localhost", "rdesoky_root", "reham01");
my $dbh = db_connect();


if ($dbh) {
	$sql_statement = "SELECT count(*) as my_count from quran_data where plain_text_length >= $min_length and plain_text_length < $max_length";
	$sth = $dbh->prepare($sql_statement);
	$sth->execute;
	if ($row = $sth->fetchrow_hashref)
	{
		$my_count = $row->{my_count};
	}
	$sth->finish;
	
	print "<?xml version=\"1.0\" encoding=\"windows-1256\"?>";
	print "<?xml-stylesheet type=\"text/xsl\" href=\"../show_aya.xsl\"?>";
	print "<random_aya>";
	if ($my_count > 0) 
	{
		my $index = rand($my_count);

		$sql_statement = "SELECT * from quran_data where plain_text_length >= $min_length and plain_text_length < $max_length limit $index, 1";
		$sth = $dbh->prepare($sql_statement);
		$sth->execute;

		while ($row = $sth->fetchrow_hashref)
		{
			#print $row->{sura_num} . "," . $row->{aya_num} . "," . $row->{aya_text} . "," . $row->{aya_plain_text} ;

			my $xmlOut = XMLout($row);

			print $xmlOut;

		}
		$sth->finish;
	}
	print "</random_aya>";

	$dbh->disconnect;

	LogRequest();
}
else {
	print "0,0,could not connect to database,";
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
sub LogRequest()
{
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =	localtime(time);
	$year += 1900;
	$mon ++;

	my $today_str = "${year}-${mon}-${mday}";

	open COUNTER_R, "<aya_count.txt";


	open COUNTER_W, ">w_aya_count.txt" or die;

	while (<COUNTER_R>)
	{
		($count_date, $count)=split (":"); #read this record

		if ($today_str eq $count_date)
		{
			$count ++;

			print COUNTER_W "${today_str}:${count}: [${hour}.${min}.${sec}]\n";

			$updated = 1;
		}
		else
		{
			print COUNTER_W $_;
		}
	}

	if ( $updated == 0 )
	{#first session counted today
		$count = 1;
		print COUNTER_W "${today_str}:${count}: : [${hour}.${min}.${sec}]\n";
	}

	close COUNTER_R;
	close COUNTER_W;

	rename "w_aya_count.txt", "aya_count.txt";

}

#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub GetParam
{
	my ($param_name, $default_value) = @_;
	my $ret_value;

	$ret_value = param($param_name);
	if (length( $ret_value ) ) {
		return $ret_value;
	}
	
	return $default_value;
}
