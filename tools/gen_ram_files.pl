#!/usr/bin/perl

my $base_url	   = "/" ;

my $base_directory = "/var/www/html/muslim-web/audio" ;
#my $base_directory = "D:\\islamic\\audio.muslim-web.com\\hosaree" ;
#my $base_directory = "D:\\islamic\\quran.islamway.com" ;



if ( opendir (DIR, $base_directory) )
{
	@dir_contents = readdir(DIR);

	while( <@dir_contents> )
	{
		my $sub_folder = $_;
		
		if ($sub_folder ne "." && $sub_folder ne ".." ) 
		{
			print $sub_folder . "\n";

			for (my $sura_index = 1; $sura_index < 115; $sura_index ++ ) 
			{
				my $file_path = "${base_directory}\\${sub_folder}\\s${sura_index}.ram";
				my $url = "s${sura_index}.rm";

				#my $file_path = "${base_directory}\\${sub_folder}\\${sura_index_3d}.ram";
				#my $sura_index_3d = sprintf("%03d", $sura_index);
				#my $url = "${sura_index_3d}.rm";
				
				if( open( FILE_HANDLE, ">", $file_path ) ) 
				{
					#print $url . "\n";
					print FILE_HANDLE "${base_url}/${sub_folder}/" . $url;
					close FILE_HANDLE;
				}
			}
		}
	}
}

