#!/usr/bin/perl

use CGI qw( :standard );
require LWP::UserAgent;

my $ua = LWP::UserAgent->new(env_proxy => 1,  keep_alive => 1, timeout => 30 );


my $file_name = param("f");
my $target_folder = param("to");

if ( 0 == length ($file_name) ) {
	$file_name = "download.txt";
}

if (0 == length( $target_folder ) ) {
	$target_folder = "c:\\download\\";
}

open LIST_R, "< $file_name";

while (<LIST_R>) 
{
	my $url = substr($_, 0, -1);
	my $save_as;
	
	my $sub_folder = substr( $url, 7 );

	$sub_folder =~ s/\x2F/\x5c/g;
	
	$save_as = $target_folder . $sub_folder ;

	if( CreateFile ( SAVE_AS, $save_as, true ) == 1 ) 
	{
		binmode SAVE_AS;

		$response = $ua->get($url);

		if ($response->is_success) 
		{
			print $save_as . "\n";
			print SAVE_AS $response->content;
		}
		else 
		{
			print $response->error_as_HTML;
		}

		close SAVE_AS;
	} 
	else 
	{ 
		#print "Couldn't create '$save_as', or it is already downloaded.\n"; 
	}
	 
}

close LIST_R;
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
