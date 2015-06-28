#!/usr/bin/perl

use CGI qw( :standard );
require LWP::UserAgent;

my $ua = LWP::UserAgent->new(env_proxy => 1,  keep_alive => 1, timeout => 30 );

my $target_folder = "c:\\download\\quran\\";

my @links = ( 
	"http://www.reciter.org/KATHEER/%1%%2%.html",
	"http://www.reciter.org/GALALEEN/%1%%2%.html",
	"http://www.reciter.org/TABARY/%1%%2%.html",
	"http://www.reciter.org/KORTOBY/%1%%2%.html"
);

my @aya_count = (
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54
, 45, 83, 182,  88,  75,  85,  54, 53,  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20
, 56, 40,  31,  50,  40,  46,  42, 29,  19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6 
);


while (<@links>) {

	#my $url = substr($_, 0, -1); # truncate the last character ( we need .ra instead of .ram )
	my $url = $_; 
	my $save_as;

	for (my $sura_index = 1; $sura_index < 115; $sura_index ++ ) 
	{

		for( my $aya_index=1;$aya_index <= @aya_count[$sura_index-1]; $aya_index ++ )
		{
			my $final_url = $url;

			if ($sura_index > 99) {
				$final_url =~ s/\x251\x25/$sura_index/g;
			} elsif ($sura_index > 9) {
				$final_url =~ s/\x251\x25/0$sura_index/g;
			} else {
				$final_url =~ s/\x251\x25/00$sura_index/g;
			}

			if ($aya_index > 99) {
				$final_url =~ s/\x252\x25/$aya_index/g;
			} elsif ($aya_index > 9) {
				$final_url =~ s/\x252\x25/0$aya_index/g;
			} else {
				$final_url =~ s/\x252\x25/00$aya_index/g;
			}
			
			if (1) 
			{
				my $sub_folder = substr( $final_url, 7 );

				$sub_folder =~ s/\x2F/\x5c/g; # replace "/" with "\"
				
				$save_as = $target_folder . $sub_folder ;
				
				print $save_as . "\n";

				$response = $ua->get( $final_url );

				if ($response->is_success) 
				{
					if( CreateFile ( SAVE_AS, $save_as, true ) == 1 ) 
					{
						binmode SAVE_AS;
						print SAVE_AS $response->content;
						close SAVE_AS;
					}
					else 
					{ 
						print "Couldn't create '$save_as', or it is already downloaded.\n"; 
					}
				}
				else 
				{
					print "***\nError downloading '$final_url'\n---\n";
					print $response->error_as_HTML;
				}
			}
		}
	}	 
}

#----------------------------------------------------------------------------
#
#----------------------------------------------------------------------------
sub CreateFile 
{
	my $file_handle = shift;
	my $file_path = shift;
	my $dont_overwrite = shift;
	
	$file_path =~ s/\x2F/\x5c/g;

	if( $dont_overwrite == true ) 
	{
		if( open( TEMP_FILE_HANDLE, "<", $file_path ) ) 
		{
			#print "file exists: $file_path\n";
			close TEMP_FILE_HANDLE;
			return 0; #file exists
		}
	}

	my (@parent_folders) = split ( '\x5c', $file_path );

	my $subfolder = $parent_folders[0];

	#print "subfolders count: " . (scalar @parent_folders ) . "\n";

	for ($i=1; $i< (scalar @parent_folders )- 1 ; $i++) 
	{
		my $curr_folder = $parent_folders[$i];
		
		$subfolder = $subfolder . "\\" . "$curr_folder";
		
		#print "subfolder: $subfolder \n";
		
		mkdir $subfolder ;
	}
	
	return open $file_handle , ">", $file_path;
}
