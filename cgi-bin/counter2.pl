#!/usr/bin/perl

# use lib "/usr/bin/perl/lib";
use File::Basename;
use lib dirname(__FILE__);

use CGI qw/:standard/;

my $print_count;
my $count_date;
my $count;
my $updated = 0;

print "Content-Type: application/x-javascript;Cache-Control: NO-STORE;\r\n\r\n";

#$print_count = CGI->param("p");
$print_count = "1";

print "alert('I am here');";

my $counted = CGI->cookie("counted");

if( $counted ne "1" || $print_count eq "1" )
{
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =	localtime(time);
	$year += 1900;
	$mon ++;

	my $today_str = "${year}-${mon}-${yday}";

	open COUNTER_R, "<count.txt";

	if ( $counted eq "1" ) 
	{#if this session has been already counted just return the latest count
		
		while (<COUNTER_R>)
		{
			($count_date, $count)=split (":"); #read this record
		}
		
		close COUNTER_R;

		if ($print_count eq "1") 
		{
			print "document.write ('$count');";
		}
		die;
	}

	print "document.cookie ='counted=1';";

	open COUNTER_W, ">w_count.txt" or die;

	while (<COUNTER_R>)
	{
		($count_date, $count)=split (":"); #read this record

		if ($today_str eq $count_date)
		{
			$count ++;

			print COUNTER_W "${today_str}:${count}:\n";

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
		print COUNTER_W "${today_str}:${count}:\n";
	}

	close COUNTER_R;
	close COUNTER_W;

	rename "w_count.txt", "count.txt";

	if ($print_count eq "1")
	{
		print "document.write ('$count');";
	}
}
