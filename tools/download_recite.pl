#!/usr/bin/perl

use CGI qw( :standard );
require LWP::UserAgent;

my $ua = LWP::UserAgent->new(env_proxy => 1,  keep_alive => 1, timeout => 30 );

my $target_folder = "c:\\download\\quran\\";


my @reciterLinks = (
"http://quran.islamway.com/mishary1424/%2%.rm"
);


while (<@reciterLinks>) {

	#my $url = substr($_, 0, -1); # truncate the last character ( we need .ra instead of .ram )
	my $url = $_; 
	my $save_as;

	for (my $sura_index = 1; $sura_index < 115; $sura_index ++ ) 
	{
		my $final_url = $url;

		#$final_url =~ s/\x2Eram/\x2Erm/g; # replace .ram with .ra
		
		# replace %2% with sura number in three digits
		if ($sura_index > 99) {
			$final_url =~ s/\x252\x25/$sura_index/g;
		} elsif ($sura_index > 9) {
			$final_url =~ s/\x252\x25/0$sura_index/g;
		} else {
			$final_url =~ s/\x252\x25/00$sura_index/g;
		}
		
		# replace %1% with sura number
		$final_url =~ s/\x251\x25/$sura_index/g; 

		my $sub_folder = substr( $final_url, 7 );

		$sub_folder =~ s/\x2F/\x5c/g; # replace "/" with "\"
		
		$save_as = $target_folder . $sub_folder ;
		
		print $save_as . "\n";

		if( CreateFile ( SAVE_AS, $save_as, true ) == 1 ) 
		{
			$response = $ua->get( $final_url );

			if ($response->is_success) 
			{
				binmode SAVE_AS;
				print SAVE_AS $response->content;
			}
			else 
			{ 
				print "***\nError downloading '$final_url'\n---\n";
				print $response->error_as_HTML;
			}
			
			close SAVE_AS;
		}
		else 
		{
			print "Couldn't create '$save_as', or it is already downloaded.\n"; 
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
