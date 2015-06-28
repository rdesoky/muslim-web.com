#!/usr/bin/perl
use strict;
use Encode;

#	my $sText = shift;
#
#return $sText;

#Encode::from_to( $sText, "utf8", "cp1256" );

my @directories = (
	"C:/websites/new.muslim-web.com/tafseer/KATHEER",
	"C:/websites/new.muslim-web.com/tafseer/GALALEEN",
	"C:/websites/new.muslim-web.com/tafseer/TABARY",
	"C:/websites/new.muslim-web.com/tafseer/KORTOBY"
);

foreach( <@directories> )
{
	my $directory = $_;

	if ( opendir (DIR, $directory) )
	{
		my @dir_contents = readdir(DIR);

		while( <@dir_contents> )
		{
			my $file_name = $_;

			if( $file_name ne "." && $file_name ne ".." ) 
			{
				my $input_file  = "$directory\\${file_name}";
				my $output_file = "${directory}U\\${file_name}";

				if( open INFILE, "<$input_file" )
				{
					if(	open OUTFILE, ">$output_file" )
					{
						while(<INFILE>){
							my $sText = $_;
							
							$sText =~ s/windows-1256/utf-8/gi;
							#$sText =~ s/utf8/utf\-8/gi;

							Encode::from_to( $sText, "cp1256", "utf-8" );
							print OUTFILE $sText;
						}

						close OUTFILE;
					}
					close INFILE;
				}
			}
		}
	}
}
