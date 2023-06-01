#!/usr/bin/perl

use DBI;
use CGI qw/:standard/;
package qutils;

#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub db_connect
{
	my $dbase = shift;
	my $driver   = "mysql";
	my $database = "quran";

	if ($dbase) {
		$database = $dbase;
	}

	my $host	 = "kdb.cke80n8mnq0f.us-east-1.rds.amazonaws.com";
	my $dbuser   = "root";
	my $dbpass   = "kobool_2004";

	my $dsn      = "DBI:$driver:database=$database;host=$host";

	return DBI->connect($dsn, $dbuser, $dbpass);
}
#-------------------------------------------------------------------------
# cleanup cached params call it one time per web page
#-------------------------------------------------------------------------
sub InitCGI
{
	
	#my $q = new CGI();
	CGI->initialize_globals;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub GetParam
{
	my ($param_name, $default_value) = @_;
	my $ret_value;

	my $q = new CGI();

	$ret_value = $q->param($param_name);

	if( length( $ret_value ) ) 
	{
		return $ret_value;
	}
	
	return $default_value;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub html_escape
{
	my $sText=shift;

	$sText =~ s/\x22/&quot;/g; # replace quote
	$sText =~ s/\x26/&amp;/g; # replace amp
	$sText =~ s/\x3C/&lt;/g; # replace <
	$sText =~ s/\x3E/&gt;/g; # replace >	

	return $sText;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub XMLout
{
	my $info = shift;
	my $tag_name = shift;
	my $contents = shift;

	if (not $tag_name) {
		$tag_name = "option";
	}

	my $ret_val = "<${tag_name} ";
	my $key;

	foreach $key ( keys %{$info} ) 
	{
		$ret_val .= $key . "=\"" . html_escape( $info->{$key} ) . "\" " ;
	}

	if (length($contents)) {
		$ret_val .= ">\n" . $contents . "</${tag_name}>\n";
	}
	else{
		$ret_val .= "/>\n";
	}

	return $ret_val;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
my @CP1256ToUnicode = (
0x0000,0x0001,0x0002,0x0003,0x0004,0x0005,0x0006,0x0007,0x0008,0x0009,0x000A,0x000B,0x000C,0x000D,0x000E,0x000F,
0x0010,0x0011,0x0012,0x0013,0x0014,0x0015,0x0016,0x0017,0x0018,0x0019,0x001A,0x001B,0x001C,0x001D,0x001E,0x001F,
0x0020,0x0021,0x0022,0x0023,0x0024,0x0025,0x0026,0x0027,0x0028,0x0029,0x002A,0x002B,0x002C,0x002D,0x002E,0x002F,
0x0030,0x0031,0x0032,0x0033,0x0034,0x0035,0x0036,0x0037,0x0038,0x0039,0x003A,0x003B,0x003C,0x003D,0x003E,0x003F,
0x0040,0x0041,0x0042,0x0043,0x0044,0x0045,0x0046,0x0047,0x0048,0x0049,0x004A,0x004B,0x004C,0x004D,0x004E,0x004F,
0x0050,0x0051,0x0052,0x0053,0x0054,0x0055,0x0056,0x0057,0x0058,0x0059,0x005A,0x005B,0x005C,0x005D,0x005E,0x005F,
0x0060,0x0061,0x0062,0x0063,0x0064,0x0065,0x0066,0x0067,0x0068,0x0069,0x006A,0x006B,0x006C,0x006D,0x006E,0x006F,
0x0070,0x0071,0x0072,0x0073,0x0074,0x0075,0x0076,0x0077,0x0078,0x0079,0x007A,0x007B,0x007C,0x007D,0x007E,0x007F,
0x20AC,0x067E,0x201A,0x0192,0x201E,0x2026,0x2020,0x2021,0x02C6,0x2030,0x0679,0x2039,0x0152,0x0686,0x0698,0x0688,
0x06AF,0x2018,0x2019,0x201C,0x201D,0x2022,0x2013,0x2014,0x06A9,0x2122,0x0691,0x203A,0x0153,0x200C,0x200D,0x06BA,
0x00A0,0x060C,0x00A2,0x00A3,0x00A4,0x00A5,0x00A6,0x00A7,0x00A8,0x00A9,0x06BE,0x00AB,0x00AC,0x00AD,0x00AE,0x00AF,
0x00B0,0x00B1,0x00B2,0x00B3,0x00B4,0x00B5,0x00B6,0x00B7,0x00B8,0x00B9,0x061B,0x00BB,0x00BC,0x00BD,0x00BE,0x061F,
0x06C1,0x0621,0x0622,0x0623,0x0624,0x0625,0x0626,0x0627,0x0628,0x0629,0x062A,0x062B,0x062C,0x062D,0x062E,0x062F,
0x0630,0x0631,0x0632,0x0633,0x0634,0x0635,0x0636,0x00D7,0x0637,0x0638,0x0639,0x063A,0x0640,0x0641,0x0642,0x0643,
0x00E0,0x0644,0x00E2,0x0645,0x0646,0x0647,0x0648,0x00E7,0x00E8,0x00E9,0x00EA,0x00EB,0x0649,0x064A,0x00EE,0x00EF,
0x064B,0x064C,0x064D,0x064E,0x00F4,0x064F,0x0650,0x00F7,0x0651,0x00F9,0x0652,0x00FB,0x00FC,0x200E,0x200F,0x06D2
);
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub ConvertCP1256ToUnicode
{
	my $sText = shift;
	my $sRetValue = "";

	#print $sText;

	for (my $i=0; $i< length($sText); $i++)
	{
		my $charCode = ord ( substr ($sText, $i, 1) );

		#print "$charCode ,";


		if ($charCode < 0x00FF)
		{
			$charCode = @CP1256ToUnicode[$charCode];
		}
		$sRetValue .= chr( $charCode );
	}	

	return	$sRetValue;
}


#-------------------------------------------------------------------------
sub JsOut
{
	my $info = shift;
	my $tag_name = shift;
	my $contents = shift;

	my $ret_val = ( $tag_name ? $tag_name . "=" : "" ) . "{\n";

	my $key;
	my $index=0;
	my $cr="\n";#set to empty for release

	foreach $key ( keys %{$info} ) 
	{
		if($index++){
			$ret_val .= "," . $cr;
		}
		$ret_val .= $key . ":\"" . html_js_escape( $info->{$key} ) . "\"" ;
	}

	if (length($contents)) {
		if($index++){
			$ret_val .= ",";
		}

		$ret_val .= $cr . "child_list:[" . $cr . $contents . $cr . "]";
	}
	
	$ret_val .= $cr . "}";

	return $ret_val;
}


#-------------------------------------------------------------------------
sub html_escape
{
	my $sText=shift;

	$sText =~ s/\x22/&quot;/g; # replace quote
	$sText =~ s/\x26/&amp;/g; # replace amp
	$sText =~ s/\x3C/&lt;/g; # replace <
	$sText =~ s/\x3E/&gt;/g; # replace >	

	return $sText;
}
#-------------------------------------------------------------------------
sub html_js_escape
{
	my $sText=shift;

	$sText =~ s/\\/\\\\/g; # replace \ with \\
	$sText =~ s/\x22/\\\"/g; # replace quote
	#$sText =~ s/\x26/&amp;/g; # replace amp
	$sText =~ s/\x3C/&lt;/g; # replace <
	$sText =~ s/\x3E/&gt;/g; # replace >	
	$sText =~ s/\n/\\n/g; # replace new line with \n	
	$sText =~ s/\r//g; # replace new line with \n	

	return $sText;
}
#-------------------------------------------------------------------------
sub validateUTF8String
{
	my $sText = shift;
	my $debug = "" ;

	for( my $i=0; $i<length($sText) ;$i++ ) 
	{
		my $curr_byte = substr($sText, $i, 1);
		my $curr_byte_code = ord($curr_byte);
		my $error_found = 0;
		
		if( $curr_byte_code > 0x7F ) 
		{
			my $bytesCount = 0;

			if( 0 == length( $debug ) ){
				$debug .= "\n text_length=" . length($sText);
			}

			while( ( ( $curr_byte_code & ( 0x80 >> $bytesCount ) ) > 0 ) && $bytesCount < 7 ) {
				$bytesCount ++;
			}

			$debug .= "\n i=$i;currCode=$curr_byte_code;bytesCount=$bytesCount";

			if( $bytesCount > 1 && length($sText) >= $i + $bytesCount ) 
			{
				for( my $n = 1 ; $n < $bytesCount && $error_found == 0; $n ++ ) 
				{
					my $next_byte = ord( substr( $sText, $n + $i, 1 ) );
					
					$debug .= ";next_byte=$next_byte";
					
					if( ( $next_byte & 0xC0 ) != 0x80 ) 
					{
						$debug .= ";error=$next_byte";
						$error_found = 1;
						$bytesCount = $n;
					}
				}

				if( $error_found ) 
				{
					for( my $n = $i; $n < $i + $bytesCount; $n ++ ) 
					{
						#substr( $sText, $n, 1) = "&#". @CP1256ToUnicode[ord( substr( $sText, $n, 1) )] . ";";#"?"; 
						substr( $sText, $n, 1) = "?";
						#substr( $sText, $n, 1) = ConvertCP1256ToUnicode( substr( $sText, $n, 1) ) . " ";
					}
				}
			}
			else
			{
				$debug .= ";error=#";
				$error_found = 1;
				$bytesCount = 1;
				#substr( $sText, $i, 1) = "&#". @CP1256ToUnicode[ord( substr( $sText, $i, 1) )]  . ";";#"?"; 
				#substr( $sText, $i, 1) = ConvertCP1256ToUnicode( substr( $sText, $i, 1) ) . " ";
				substr( $sText, $i, 1) = "?";

			}

			$i += $bytesCount - 1 ;
		}
	}

	#return $sText . $debug;
	return $sText;
}


#---------------
1;
