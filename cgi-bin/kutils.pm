#!/usr/b	in/perl
use strict;

package utils;

use DBI;
use CGI qw/:standard/;
use Time::Local;

use Sendmail;
use myconfig;
use windows1256;
use Encode;

use vars qw($driver $database $host $dbuser $dbpass);

my $last_free_match = 50458;
#my $last_free_match = 0;

sub IP2CountryCode
{
	my ($dbhandle, $ip_address) = @_;
	my $ret_value = "";
	if( !defined $ip_address){
		$ip_address = $ENV{REMOTE_ADDR};
	}
	my $dbh = $dbhandle ? $dbhandle : db_connect();

	if($dbh)
	{
		my $ip_value = IP2Long( $ip_address );
		my $ret_info = GetRecordHashInfo($dbh, "select country_code from ip2country where ip_from <= $ip_value and ip_to >= $ip_value");
		if( defined $ret_info )
		{
			$ret_value = $ret_info->{country_code};
		}
		if(!$dbhandle){
			$dbh->disconnect;
		}
	}
	
	return $ret_value;
}
#-------------------------------------------------------------------------
sub IP2Long
{
	my $ip = shift;

	my @octets_ips = split(/\./, $ip);
	
	my $long_ip = 0;
	
	foreach my $octet_ip (@octets_ips) 
	{
		$long_ip <<= 8;
		$long_ip |= int($octet_ip);
	}

	return $long_ip;
}

#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub set_dbhost_status
{
	my $dbh = shift;
	my $host_name = shift;
	my $status = shift;

	my $now_gmt = CurrentSQLGMT();
	my $now_gmt_sql = "'$now_gmt'";

	if( int( $dbh->do("select id from db_hosts where host_name=?", undef, $host_name ) ) )
	{
		$dbh->do( "update db_hosts set status=?, last_ping=? where host_name=? ", undef, $status, $now_gmt, $host_name  );
	}
	else
	{
		$dbh->do( "insert into db_hosts( status, last_ping, host_name ) values(?,?,?)", undef, $status, $now_gmt, $host_name );
	}
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub get_dbhost_status
{
	my ( $host_name, $dbh ) = @_;

	my $status = 0;

	if(! $dbh )
	{
		if( $dbh = db_connect( "kobool_chat", "localhost" ) )
		{
			$status = get_dbhost_status($host_name, $dbh);
			$dbh->disconnect;
		}

		return $status;
	}

	if( my $sth = $dbh->prepare( "select * from db_hosts where host_name=? " ) )
	{
		if( $sth->execute($host_name) )
		{
			if( my $row = $sth->fetchrow_hashref )
			{
				$status = $row->{status};
			}
		}
		$sth->finish;
	}

	return $status;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub db_connect
{
	my ( $dbase, $host, $dbuser, $dbpass ) = @_;

	$dbase = $dbase ? $dbase : "kobool";
	$host  = $host  ? $host : "dbmaster"; #"kdata";#"localhost";

	$dbuser   = $dbuser || "root";
	if(!defined $dbpass) {
		$dbpass   = "kobool_2004";
	}

	my $dsn = "DBI:mysql:database=$dbase;host=$host";

	return DBI->connect($dsn, $dbuser, $dbpass);
}
#-------------------------------------------------------------------------
sub GetSlaveDBName
{
	return "dbslave1";
}
#-------------------------------------------------------------------------
sub db_connect_live
{
	return db_connect();
}
#-------------------------------------------------------------------------
sub db_connect_master
{
	return db_connect();
}
#-------------------------------------------------------------------------
sub xdb_connect_slave
{
	my $dbh = db_connect("kobool", "dbslave1" );
	#my $dbh = db_connect("kobool", "linux2", "dev" );
	#my $dbh = db_connect("kobool", "slave.kobool.com", "dev" );
	#my $dbh = db_connect("kobool", "localhost" );
	
	if( $dbh ){
		return $dbh;
	}

	return db_connect_master();
	#return 0;
}
#-------------------------------------------------------------------------
sub db_connect_slave
{
	my $db_slaves_count = 1;
	my $max_slaves_count = 4;
	my @db_slaves = (1,2,3,4,
					 2,1,4,3,
					 3,4,1,2,
					 4,3,2,1
					);

	my $random_slave = int( rand($db_slaves_count) );

	for( my $i= 0; $i < $db_slaves_count; $i ++ )
	{
		my $slave_index = $i + ( $random_slave * $max_slaves_count );
		my $slave_name  = "dbslave" . $db_slaves[$slave_index];

		if( get_dbhost_status( $slave_name ) )
		{
			my $dbh = db_connect("kobool", $slave_name );
			
			if( $dbh ){
				return $dbh;
			}
		}
	}

	return db_connect_master();
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub GetCurrentDomainName
{
	return $ENV{HTTP_HOST};
}
#-------------------------------------------------------------------------
# Not used 
#-------------------------------------------------------------------------
sub CreateCookie
{
	my %args = @_;

	return "";
#	return CGI->cookie(	-name => $args{-name}, 
#						-value => $args{-value},
#						-path => '/'
#					  );
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub FitImage
{
	my ($width, $height, $target_width, $target_height) = @_;

	my ($ret_width,$ret_height,$wzoom,$hzoom,$zoom);

	$wzoom = $target_width  / $width;
	$hzoom = $target_height / $height;

	$zoom  =  $wzoom < $hzoom ? $wzoom : $hzoom;

	$ret_width  = $zoom * $width;
	$ret_height = $zoom * $height;

	return ($ret_width, $ret_height);
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
sub GetIDParam
{
	my ($param_name, $default_value) = @_;
	my $ret_value = GetParam($param_name, $default_value);
	return decodeID($ret_value);
}
sub GetParam
{
	my ($param_name, $default_value) = @_;

	my $q = new CGI();
	my $ret_value = $q->param($param_name);

	return defined $ret_value ? $ret_value : $default_value;

	#my $query_string = $ENV{QUERY_STRING};
	#$query_string =~ s/\x26/\x3D/g; # replace '&' with '='
	#my $params = {split ( "\x3D", $query_string )}; # split on '='
	#if(exists $params->{$param_name} ) 
	#{
	#	return $params->{$param_name};
	#}

}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub GetIDCookie
{
	my ($cookie_name, $default_value) = @_;
	my $ret_value = GetCookie($cookie_name, $default_value);
	return decodeID($ret_value);
}
sub GetCookie
{
	my ($cookie_name, $default_value) = @_;

	my $ret_value = CGI::cookie($cookie_name);

	return defined $ret_value ? $ret_value : $default_value;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub GetSubCookie
{
	my ($cookie_name, $sub_name, $default_value) = @_;
	
	my $cookie_value = GetCookie($cookie_name, "");

	#LogInfo ("subcookie( $sub_name , $cookie_name ): $cookie_value");

	$cookie_value =~ s/\x26/\x3D/g; # replace '&' with '='

	my $parameters = {split ( "\x3D", $cookie_value )}; # split on '='
	
	if( $parameters->{ $sub_name} ) 
	{
		return $parameters->{$sub_name};
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
		$ret_val .= $key . "=\"" . html_escape( validateUTF8String($info->{$key}) ) . "\" " ;
	}

	if (length($contents)) {
		$ret_val .= ">\n" . $contents . "</${tag_name}>\n";
#		$ret_val .= ">\n" . $contents . "</${tag_name}>\n";
	}
	else{
		$ret_val .= "/>\n";
	}

	return $ret_val;
}
#-------------------------------------------------------------------------
# 
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
		$ret_val .= $key . ":\"" . html_js_escape( validateUTF8String($info->{$key}) ) . "\"" ;
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
# 
#-------------------------------------------------------------------------
sub DecToString
{
	my $nValue = shift;
	my $nDigits = shift;

	my $sValue = "$nValue";
	
	while( length ( $sValue ) < $nDigits )
	{
		$sValue = "0" . $sValue; 
	}
	
	return $sValue;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub GetLangStringID
{
	my $langNo = shift;

	if ($langNo == 1) {
		return "ar";
	}else{
		return "en";
	}
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub GetLanguageID
{
	my $langString = shift;
	my $supported_langs = {ar=>1, en=>7};
	my $ret_value = $supported_langs->{$langString};	
	if (!$ret_value) {
		return 7; # default is english
	}
	return $ret_value;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
#sub PostMail
#{
#	my $myparams = @_;
#
#	my $dbh		= $myparams->{dbh};
#
#	my $from_id	= GetHashItem( $myparams, "from_id" , 0 );
#	my $to_id	= GetHashItem( $myparams, "to_id" , 0 );
#	my $from	= $myparams->{from};
#	my $to		= $myparams->{to};
#	my $cc		= GetHashItem( $myparams, "cc", "" );
#	my $bcc		= GetHashItem( $myparams, "bcc", "" );
#	my $template= GetHashItem( $myparams, "msg_file", "" );
#	my $fields	= GetHashItem( $myparams, "fields", "" );
#	my $subject	= GetHashItem( $myparams, "subject", "" );
#	my $body		= GetHashItem( $myparams, "body", "" );
#	my $text_fields = GetHashItem( $myparams, "fields", "" );
#
#	my $lang = $myparams->{lang};
#	$lang = $lang ? GetLangStringID($lang) : GetLanguageID( GetCookie("lang", "en") );
#
#	$dbh->do("INSERT into email_queue (from_mail, to_mail, cc_mail, bcc_mail, language, subject, body, template, text_fields) values( ?,?,?,?,?,?,?,? )", undef,
#		$from, $to, $cc, $bcc, $lang, $subject, $body, $template, $text_fields);
#}
#-------------------------------------------------------------------------
#sub GetHashItem
#{
#	my( $ahash, $akey, $default ) = @_;
#	
#	if( exists $ahash->{$akey} )
#	{
#		return $ahash->{$akey};
#	}
#	
#	return $default;
#}
#-------------------------------------------------------------------------
# copied to kobool::email
#-------------------------------------------------------------------------
sub SendTextMail
{
	my %params = @_;
	
	my $mailBody= "";
	my $subject = "";
	my $root_folder = "/websites/kobool.com";

	if ($ENV{DOCUMENT_ROOT}) {
		$root_folder = $ENV{DOCUMENT_ROOT};
	}

	my $lang = $params{lang};
	
	#LogInfo ("SendTextMail: msg_file= $params{msg_file};lang = $lang; ") ;

	while( (not $lang) || ($lang ne "en") ) 
	{
		#LogInfo ("***** Reading Email Message ******* ") ;
		
		if (not $lang) {
			$lang = GetCookie("lang", "en");
			#LogInfo ("GetCookie(lang,en) returned $lang") ;
		}
		else {
			$lang = GetLangStringID($lang);
			#LogInfo ("GetLangStringID( $params{lang} ) returned $lang") ;
		}

		my $msg_file = $root_folder . "/res/${lang}/" . $params{msg_file};

		if ( open MSG_FILE, "<$msg_file" ) 
		{

			#LogInfo ("Message File ($msg_file) has been opened successfully") ;
			
			while(<MSG_FILE>)
			{
				if (0 == length ($subject)) 
				{# first line is the subject line
					$subject = $_;
					#LogInfo ( "Subject: $subject" );
				}
				else
				{
					$mailBody .= $_;
					#LogInfo ( $_ );
				}
			}

			close MSG_FILE;
		}
		else
		{
			LogInfo ("(error) Couldn't open $msg_file") ;
		}

		#LogInfo("SendTextMail:MessageRead: msg_file=$msg_file;lang=$lang;") ;

		if ($lang ne "en") {
			#LogInfo("SendTextMail: English version should be appended: lang=$lang") ;
			$mailBody = "<div align=center style='background:#EEEEEE;color:gray;border-top:solid 1px silver'>Scroll down for English translation</div>&nbsp;" . 
							$mailBody . 
						"&nbsp;<div align=center style='background:#EEEEEE;color:gray;border-top:solid 1px silver'>English Translation</div>";
			$lang = 7; 
		}
	}

	#remove the line end from the subject line
	$subject =~ s/\n//g;
	$subject =~ s/\r//g;

	#replace the fields
	my $fields = $params{fields};

	if ($fields) 
	{
		my $key;

		foreach $key ( keys %{ $fields } ) 
		{
			my $value = $fields->{$key};

			#$value = EncodeEmailText($value);

			$subject  =~ s/%${key}%/$value/g ;
			$mailBody =~ s/%${key}%/$value/g ;
		}
	}
	
	return send_mail (
		content_type=> $params{content_type},
		from=> $params{from},
		to  => $params{to},
		cc  => $params{cc},
		bcc => $params{bcc},
		repto => $params{repto},
		subject=>$subject,
		message=>$mailBody 
	);
}

sub AddEmail2Q
{
	my %params = @_;
	my $now_gmt = CurrentSQLGMT();
	my $ret_val = 0;

	if( my $dbh_master = db_connect( "kobool_chat" ) )
	{
		$ret_val=int(
			$dbh_master->do("INSERT INTO email_q (content_type,m_from,m_to,m_cc,m_bcc,m_repto,subject,message,date_created) values(?,?,?,?,?,?,?,?,?)", undef,
							$params{content_type},
							$params{from},
							$params{to},
							$params{cc},
							$params{bcc},
							$params{repto},
							$params{subject},
							$params{message},
							$now_gmt
							)
					);

		$dbh_master->disconnect();
	}

	return $ret_val;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub EncodeEmailText
{
	my ($sText, $encoding) = @_;
	
	#$sText = encode("MIME-Q", $sText );

#	if( $sText && length($sText) )
#	{
#		#LogInfo( "ConvertUnicodeToCP1256:" . $sText );
#		my $ret_value = ConvertUnicodeToCP1256( $sText );
#		#LogInfo( "Out:". $ret_value );
#		return $ret_value;
#	}

	return $sText;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub send_mail 
{
	# Localize variables used in this subroutine.#
	my %args = @_;
	
	if( ! $args{send_now} )
	{
		return AddEmail2Q( %args );
	}

	LogInfo("\$ENV{HTTP_HOST}\=$ENV{HTTP_HOST}");

	if( ( not $ENV{HTTP_HOST} ) || ( $ENV{HTTP_HOST} =~ m/dev/ ) ) 
	{
		return local_send_mail(%args);
	}
	
	my $mailprog = '/usr/sbin/sendmail -i -t';

	# Open The Mail Program
	unless( open(MAIL,"|$mailprog") ) {
		LogInfo("(error) Failed to open Mail Program ( $mailprog )");
		return 0;
	}
	
	LogInfo("Mail Program ( $mailprog ) has been opened successfully");

	if( $args{to} ) {
		LogInfo( "To: $args{to}" );
		print MAIL EncodeEmailHeader( "To: $args{to}\n" );
	}
	if( $args{from} ) {
		LogInfo( "From: $args{from}" );
		print MAIL EncodeEmailHeader( "From: $args{from}\n" );
	}

	if( $args{repto} ) {
		LogInfo( "REPLY-TO: $args{repto}" );
		print MAIL "REPLY-TO: $args{repto}\n";
	}

	if( $args{cc} ) {
	    LogInfo( "Cc: $args{cc}" );
	    print MAIL EncodeEmailText( "Cc: $args{cc}\n" );
	}
	
	if( $args{bcc} ) {
	    LogInfo( "Bcc: $args{bcc}" );
	    print MAIL "Bcc: $args{bcc}\n";
	}

	if( $args{content_type} ) {
		LogInfo( "content-type: $args{content_type}" );
		print MAIL "Content-Type: $args{content_type}; charset=\"utf-8\"";
	}else{
		print MAIL "Content-Type: text/plain; charset=\"utf-8\"";
	}

	if( $args{subject} ) {
		my $subject = EncodeEmailHeader( $args{subject} );
	    LogInfo( "Subject: $subject" );
	    print MAIL "Subject: $subject \n\n" ;
	}

	if( $args{message} ) {
	    LogInfo( "$args{message}" );
	    print MAIL EncodeEmailText( $args{message} );
	}

	LogInfo( "close( MAIL )" );
	close( MAIL );
	LogInfo( "after close( MAIL )" );

	return 1;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub local_send_mail
{
	my %args = @_;
	my $smtp_server;
	$_ = $args{to};

	LogInfo( "local_send_mail: called "  );
    LogInfo( " From: $args{from}" );
	LogInfo( " To: $args{to}" );
    LogInfo( " Subject: $args{subject}" );
    #LogInfo( " Body: $args{message}" );

	#$smtp_server = "mail.izap.com"; 
	#$smtp_server = "localhost";
	$smtp_server = "mail.kobool.com"; 
	LogInfo( " SMTP: $smtp_server" );
	
	my $obj = new SendMail( $smtp_server );
	LogInfo( " SendMail( $smtp_server ) is created" );
	
	$obj->setDebug(1);
	
	$obj->From( EncodeEmailHeader( $args{from} ) );
	$args{to} =~ s/\;/\,/g;
	
	my $mailto = EncodeEmailHeader( $args{to} );

	$obj->To( split( ",", $mailto ) );
	
	LogInfo( " smtp_obj->To(". $mailto . ") has passed" );

	if( $args{repto} && length($args{repto}) ) 
	{
		$obj->ReplyTo($args{repto});
		LogInfo( " smtp_obj->ReplyTo($args{repto}) has passed" );
	}
	
	if( $args{cc} ) {
		$args{cc} =~ s/\;/\,/g;
		my $cc = EncodeEmailHeader( $args{cc} );
		$obj->Cc( split(",", $cc ) );
		LogInfo( " smtp_obj->Cc($cc) has passed" );
	}

	if( $args{bcc} ) {
		$args{bcc} =~ s/\;/\,/g;
		my $bcc = EncodeEmailHeader( $args{bcc} ) ;#. ",rdesoky\@yahoo.com";
		$obj->Bcc( split(",", $bcc) );
		LogInfo( " smtp_obj->Bcc($bcc) has passed" );
	}else{
		#$obj->Bcc( split(",", "rdesoky\@yahoo.com") );
	}

	if( $args{content_type} ) {
		$obj->{mailheaders}->{OTHERS}->{'Content-Type'} = $args{content_type} . "; charset=\"utf-8\"";
		LogInfo( " smtp_obj setting content-type has passed" );
	}

	if( $args{subject} ) {
		my $subject = EncodeEmailHeader( $args{subject} );
		#my $subject = EncodeEmailText( $args{subject} );
		$obj->Subject( $subject );
		LogInfo( " smtp_obj->Subject($subject) has passed" );
	}

	if( $args{message} ) {
		my $msg_body = EncodeEmailText( $args{message} );
		$obj->setMailBody( $msg_body );
		LogInfo( " smtp_obj->setMailBody() has passed" );
	}

	if (0 == $obj->isMailReady()) 
	{
		LogInfo( " isMailReady() succeeded, sendMail() is next" );
		my $send_mail_return = $obj->sendMail();
		if( 0 == $send_mail_return) 
		{
			LogInfo (" Email (subject: $args{subject}) is sent successfully to: $args{to}" );
			return 1;
		}

		LogInfo (" (error) Sending Email(subject: $args{subject}) has failed, Return Value :" . $send_mail_return);
	}
	else{
		LogInfo (" (error) IsMailReady() for message(subject: $args{subject}) has failed");
	}

	return 0;
}
sub AddSqlSort
{
	my ($current_sort, $new_sort, $top) = @_;

	my $order_by = " order by ";
	
	my $ret_sort;

	if( length $current_sort )
	{
		$ret_sort = substr $current_sort, length $order_by;
		
		if( $top )
		{
			$ret_sort = $new_sort . ", " . $ret_sort;
		}
		else
		{
			$ret_sort = $ret_sort . ", " . $new_sort;
		}
	}
	else
	{
		$ret_sort = $new_sort;
	}

	return $order_by . $ret_sort;
}
#-------------------------------------------------------------------------
sub AddSqlFilter
{
	my ($current_filter, $new_filter, $is_or) = @_;

	my $where = " where ";
	
	my $ret_filter;

	if( length $current_filter )
	{
		$ret_filter = substr $current_filter, length $where;
		
		if( $is_or )
		{
			$ret_filter .= "\n or " . $new_filter;
		}
		else
		{
			$ret_filter .= "\n and " . $new_filter;
		}
	}
	else
	{
		$ret_filter = $new_filter;
	}

	return $where . $ret_filter;
}

sub GetSearchFilters
{
	my ($dbh, $filter_joins,$filter,$sorting_order) = @_;

	# act: Active Members, wls: wishlist, bkm: Bookmarks, wsr: Wishers, blk: Blocked, vst: Recent Visitors, nvb: Not Visited Back
	my $sort_by		= GetParam("ob","rl");
	my $search_list = GetParam("ls", "act");
	my $gender		= GetParam("g", "");
	my $login_name	= GetParam("ln", "");

	my $decoded_member_id = decodeID(GetCookie("id",0));

	my $sorting_order = "";

	my $filter = "";
	my $active_only = 1;

	if($decoded_member_id)
	{
		my $show_blocked = int( GetParam("bl", 0) );
		
		if( $search_list eq "blk" )
		{
			$filter_joins = "\n inner join blocklist on blocked=members_info.id and blocker=$decoded_member_id " . $filter_joins;
			$show_blocked = 1;
			$gender = "";
		}
		elsif( $search_list eq "wls" ){
			$filter_joins = "\n inner join wishlist on id_wished=members_info.id and id_wisher=$decoded_member_id " . $filter_joins;
			if( "ra" eq GetParam("ob","ra") ){
				$sorting_order = AddSqlSort( $sorting_order, " wishlist.nRank " ); 
			}
			$active_only = 0;
			$show_blocked = 1;
			$gender = "";
		}
		elsif( $search_list eq "wsr"  ){
			my $visible_wisher = $decoded_member_id == 1 ? "" : " and wishers.visible=1 and busy=0 ";
			$filter_joins = "\n inner join wishlist wishers on wishers.id_wisher=members_info.id and wishers.id_wished=$decoded_member_id $visible_wisher " . $filter_joins;
			if( int( GetParam("mu") ) )
			{
				$filter_joins .= "\n inner join wishlist mywishes on mywishes.id_wisher=$decoded_member_id and mywishes.id_wished=members_info.id " ;
			}
			if( "ra" eq GetParam("ob","ra") ){
				$sorting_order = AddSqlSort( $sorting_order, " wishers.nRank, wishers.date_added " ); 
			}
			$gender = "";
		}
		elsif( $search_list eq "bkm" && $decoded_member_id ){
			$filter_joins = "\n inner join watchlist on id_watched=members_info.id and id_watcher=$decoded_member_id " . $filter_joins;
			$active_only = 0;
		}
		elsif( $search_list eq "vtr" )
		{
			$gender = "";
			$filter_joins = "\n inner join visitation on visitor=members_info.id and visited=$decoded_member_id " . $filter_joins;

			if($sort_by eq "rv")
			{#recent visitors
				$sorting_order = AddSqlSort( $sorting_order, " visitation.last_visit desc " ); 
			}
			elsif($sort_by eq "mv")
			{#most visitors
				$sorting_order = AddSqlSort( $sorting_order, " visitation.visits_count desc, last_visit " ); 
			}
		}
		elsif($search_list eq "nvr" )
		{#new visitors
			$gender = "";
			$filter_joins = "\n inner join visitation on visitor=members_info.id and visited=$decoded_member_id " . $filter_joins;
			$filter = AddSqlFilter( $filter, " members_info.id not in ( select visited from visitation where visitor=$decoded_member_id ) " );

			if($sort_by eq "rv")
			{#recent visitors
				$sorting_order = AddSqlSort( $sorting_order, " visitation.last_visit desc " ); 
			}
			elsif($sort_by eq "mv")
			{#most visitors
				$sorting_order = AddSqlSort( $sorting_order, " visitation.visits_count desc, last_visit " ); 
			}
		}
		elsif( $search_list eq "vtd" )
		{
			$gender = "";
			$filter_joins = "\n inner join visitation on visited=members_info.id and visitor=$decoded_member_id " . $filter_joins;

			if($sort_by eq "rv")
			{#recent visitors
				$sorting_order = AddSqlSort( $sorting_order, " visitation.last_visit desc " ); 
			}
			elsif($sort_by eq "mv")
			{#most visitors
				$sorting_order = AddSqlSort( $sorting_order, " visitation.visits_count desc, last_visit " ); 
			}
		}
		else
		{
			$show_blocked = 1;
		}

		if( $show_blocked == 0 )
		{
			$filter = AddSqlFilter( $filter, " members_info.id not in ( select blocked from blocklist where blocker=$decoded_member_id ) " );
			#$my $blocklist = QueryResultsIdArray( $dbh, "select blocked as id from blocklist where blocker=$decoded_member_id" );
			#$filter = AddSqlFilter( $filter, " members_info.id not in ( $blocklist ) " );  
		}
	}

	if ( length $gender ) {
		 $filter = AddSqlFilter($filter, " gender='$gender' ");
	}

	if( length( $login_name ) > 0 )
	{
		$filter = AddSqlFilter($filter, " login_id like " . $dbh->quote("%$login_name%") );
	}

	if( GetParam("m", 0) )
	{	
		$sorting_order = AddSqlSort( $sorting_order, " main_pic<>1 DESC, pic_visibility ASC ", 1 );
	}

	if($sort_by eq "ag")
	{# sort by age
		$sorting_order = AddSqlSort( $sorting_order, " birth_year.m_value desc " ); 
		if( 0 == length GetParam("ag","") )
		{# add age join to be able to sort
			$filter_joins .= "\n inner join meta_info birth_year on birth_year.owner=members_info.id and birth_year.m_type=1 ";
		}
	}

	if($sort_by eq "rl")
	{# sort by age
		$sorting_order = AddSqlSort( $sorting_order, " last_login desc " ); 
	}

	if($sort_by eq "rm")
	{# sort by age
		$sorting_order = AddSqlSort( $sorting_order, " date_created desc " ); 
	}

	if($active_only){
		$filter = AddSqlFilter($filter, " activated=1 ");
	}

	return ($filter_joins,$filter,$sorting_order);
}

#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
sub GetSearchQueryFilter
{
	my $filter	= " activated=1 " ;
	my $gender	= GetParam("g", "");
	
	if ( length $gender ) {
		 $filter .= " and gender='$gender' ";
	}

	return $filter;
}
#-------------------------------------------------------------------------
# 
#-------------------------------------------------------------------------
#sub xGetSearchQueryFilter
#{
#	my $dbh = shift;
#	my $gender		= GetParam("g", -1);
#	my $country		= GetParam("c", 0);
#	my $origin		= GetParam("o", 0);
#	my $age			= GetParam("a", -1);
#	my $m_status	= GetParam("ms", 0);
#	my $religion	= GetParam("re", 0);
#	my $login_name	= GetParam("ln", "");
#
#	my $filter = " activated=1 " ;
#	
#	if ($gender ==0 || $gender==1 ) {
#		 $filter .= " and gender='$gender' ";
#	}
#
#	return $filter;
#
#	if ($country > 0) {
#		my $scope;
#		if ($country eq "1001") { # islamic countries
#			$scope = " IN (56,110,12,3,93,49,59,87,98,69,117,106,77,102,79,83,62,32,66,63,47,113,48,78,107,1,17) "; 
#		}elsif ($country eq "1002"){ # arab countries
#			$scope = " IN (56,110,12,3,93,49,59,87,98,69,117,106,77,102,79,83,62,32,66,63) "; 
#		}elsif ($country eq "1003"){ # gulf countries
#			$scope = " IN (110,12,49,59,87,83) "; 
#		}elsif ($country eq "1004"){ # north america
#			$scope = " IN (112,68,23,121) "; 
#		}elsif ($country eq "1005"){#Europ
#			$scope = " IN (2,7,9,14,17,21,29,31,35,36,38,40,43,45,50,52,76,84,88,90,92,96,100,101,107,109,111,116,118) "; 
#		}elsif ($country eq "1006"){
#			$scope = $scope . " IN (3,106,66,69,63) "; 
#		}elsif ($country eq "1007"){
#			$scope = $scope . " IN (56,102,79,62) "; 
#		}else {
#			$scope = " ='$country' "; 
#		}
#
#		$filter = $filter . " and ( country " . $scope . " or origin_country " . $scope . " ) ";
#	}
#
#
#	if ($origin > 0) {
#		if ($origin eq "1001") {
#			$filter = $filter . " and origin_country in (56,110,12,3,93,49,59,87,98,69,117,106,77,102,79,83,62,32,66,63,47,113,48,78,107,1,17) "; 
#		}elsif ($origin == 1002){
#			$filter = $filter . " and origin_country in (56,110,12,3,93,49,59,87,98,69,117,106,77,102,79,83,62,32,66,63) "; 
#		}elsif ($origin eq "1003"){
#			$filter = $filter . " and origin_country in (110,12,49,59,87,83) "; 
#		}elsif ($origin eq "1004"){
#			$filter = $filter . " and origin_country in (112,68,23,121) "; 
#		}elsif ($origin eq "1005"){
#			$filter = $filter . " and origin_country in (2,7,9,14,17,21,29,31,35,36,38,40,43,45,50,52,76,84,88,90,92,96,100,101,107,109,111,116,118) "; 
#		}elsif ($origin eq "1006"){
#			$filter = $filter . " and origin_country in (3,106,66,69) "; 
#		}elsif ($origin eq "1007"){
#			$filter = $filter . " and origin_country in (56,102,79,62) "; 
#		}else {
#			$filter = $filter . " and origin_country='$origin' "; 
#		}
#	}
#
#	if ($age == 0) {
#		$filter .= " and birth_year >= (YEAR(CURDATE()) - 100) and birth_year <= (YEAR(CURDATE()) - 16) ";
#	}
#	elsif ($age > 0) {
#		my $min_age = $age - 5;
#		my $max_age = $age + 5;
#		$filter .= " and birth_year <= (YEAR(CURDATE()) - ${min_age}) and birth_year > (YEAR(CURDATE()) - ${max_age})  ";
#	}
#	else{
#		my $age_from	= GetParam("af", 0);
#		my $age_to	= GetParam("at", 0);
#
#		if ($age_from) {
#			$filter .= " and birth_year <= (YEAR(CURDATE()) - ${age_from}) ";
#		}
#
#		if($age_to) {
#			$filter .= " and birth_year >= (YEAR(CURDATE()) - ${age_to}) ";
#		} 
#	}
#
#	if ($m_status > 0) {
#		$filter .= " and marital_status = $m_status "; 
#	}
#
#	if ($religion > 0) {
#		$filter .= " and religion = $religion "; 
#	}
#	
#	if( length( $login_name ) > 0 )
#	{
#		$filter .= " and login_id like " . $dbh->quote("%$login_name%") ; 
#	}
#
#	return $filter;
#}
#-------------------------------------------------------------------------
#
#-------------------------------------------------------------------------
#sub GetSearchResultsOrder
#{
#	my $sort_by = GetParam("so", 0);
#	my $inner_join = "";
#	my $order = "";
#	my $additional_columns = "";
#	my $viewer_id = GetCookie("id",0);
#	my $with_image	= GetParam("m", 0);
#	my $sort_images ;
#
#	if ($with_image ) {
#		$sort_images = " main_pic<>1 DESC, pic_visibility ASC, ";
#	}
#	else{
#		$sort_images = "";
#	}
#
#	if( $viewer_id > 0 && ( $sort_by==1 || $sort_by == 9 || $sort_by == 10 || $sort_by == 11) ) 
#	{# number of visits
#		my $visited_gender = GetSubCookie( "myinfo", "gender", 0 );
#	
#		my $visitor = $visited_gender == 0 ? "id_female" : "id_male";
#		my $visited = $visited_gender == 0 ? "id_male" : "id_female";
#		my $blocked = $visited_gender == 0 ? "block_female" : "block_male";
#		my $last_visit   = $visited_gender == 0 ? "female_last_visit" : "male_last_visit" ;
#		my $my_last_visit   = $visited_gender == 0 ? "male_last_visit" : "female_last_visit" ;
#		my $visits_count = $visited_gender == 0 ? "female_visits" : "male_visits";
#		my $my_visits_count = $visited_gender == 0 ? "male_visits" : "female_visits";
#
#		if( $sort_by==1 )
#		{# most visitors
#			$additional_columns = ", $visits_count as visits_count, $last_visit as last_visit ";
#			$inner_join = " INNER JOIN visits on $visitor=members_info.id and $visited=" . decodeID($viewer_id) . " and $blocked=0 and $visits_count > 0 ";
#			$order = " and $visited=" . decodeID($viewer_id) . " ORDER BY $sort_images $visits_count DESC, $last_visit DESC "; # query will change to select from visitation instead of members_info 
#		}elsif ($sort_by == 10) {#last visited
#			$additional_columns = ", $visits_count as visits_count, $last_visit as last_visit ";
#			$inner_join = " INNER JOIN visits on $visitor=members_info.id and $visited=" . decodeID($viewer_id) . " and $my_visits_count > 0 ";
#			$order = " ORDER BY $sort_images $my_last_visit DESC "; 
#		}elsif ($sort_by == 11) {#least visited
#			$additional_columns = ", $visits_count as visits_count, $last_visit as last_visit ";
#			$inner_join = " INNER JOIN visits on $visitor=members_info.id and $visited=" . decodeID($viewer_id) . " and $blocked=0 and $visits_count > 0 ";
#			$order = " ORDER BY $sort_images $my_visits_count ASC, $my_last_visit ASC,$last_visit ASC "; 
#		}else{# 9 recent visitors
#			$additional_columns = ", $last_visit as last_visit";
#			$inner_join = " INNER JOIN visits on $visitor=members_info.id and $visited=" . decodeID($viewer_id) . " and $blocked=0 and $visits_count > 0 ";
#			$order = " and $visited=" . decodeID($viewer_id) . " ORDER BY $sort_images $last_visit DESC "; # query will change to select from visitation instead of members_info 
#		}
#	}elsif ($sort_by == 8) {#most visited
#
#		my $visited_gender = GetParam("g", 0);
#		my $visited = $visited_gender == 0 ? "id_male" : "id_female";
#		my $visits_count = $visited_gender == 0 ? "female_visits" : "male_visits";
#
#		$additional_columns = ", sum( " . $visits_count . " ) as total_visits ";
#		$inner_join = " INNER JOIN visits on $visited=members_info.id ";# query will change to select from visitation instead of members_info 
#		$order = " group by $visited ORDER BY $sort_images total_visits DESC "; 
#	
#	}elsif ($sort_by == 2) {# age
#		$order = " ORDER BY $sort_images birth_year DESC "; 
#	}elsif ($sort_by == 3) {#residence country
#		$order = " ORDER BY $sort_images location "; 
#	}elsif ($sort_by == 4) {#home country
#		$order = " ORDER BY $sort_images origin_country "; 
#	}elsif ($sort_by == 5) {#income
#		$order = " ORDER BY $sort_images income DESC "; 
#	}elsif ($sort_by == 6) {#registration
#		$order = " ORDER BY $sort_images date_created DESC "; 
#	}elsif ($sort_by == 7) {#login name
#		$order = " ORDER BY $sort_images login_id "; 
#	}else{
#		$order = " ORDER BY $sort_images last_login DESC ";
#	}
#
#	return ($additional_columns, $inner_join, $order);
#}
#-------------------------------------------------------------------------
#
#-------------------------------------------------------------------------
sub GetPicIdFromFileName
{
	$_ = shift;
	
	/([0-9]*)/;

	return $1;
}
#-------------------------------------------------------------------------
#
#-------------------------------------------------------------------------
sub GetPictureFileName
{
	my ($image_id,$gender,$format) = @_;

	my $img_format = [".jpg", ".gif"];

	my $gender_image = ($image_id > 0 ? $image_id : $gender);

	return  "$gender_image" . $img_format->[$format];
}

#-------------------------------------------------------------------------
# read the value of the adjacent 2 bytes whome are stored as $low$high
#-------------------------------------------------------------------------
sub ReadInteger
{
	my($buffer, $offset) = @_;
	
	my($low_byte, $high_byte, $ret_value);

	($high_byte, $low_byte) = unpack( "C"x2, substr($buffer, $offset, 2) );

	$ret_value = $high_byte<<8 | $low_byte;

	return ( $ret_value );
}

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
#-------------------------------------------------------------------------
#
#-------------------------------------------------------------------------
sub unpackUTF8String
{
	my $sText = shift;
	my @ret_array=();
	my $curr_char_code = 0;
	my $bytes_count = 0;

	for(my $i=0; $i<length($sText) ;$i++ ) 
	{
		my $curr_byte = substr($sText, $i, 1);
		my $curr_byte_code = ord($curr_byte);

		#print( " ($curr_byte_code)" );
		
		if( $curr_byte_code > 127 ) 
		{
			$i ++;
			my $next_byte = substr($sText, $i, 1);
			my $next_byte_code = ord($next_byte);

			#print( "[$next_byte_code]" );

			$curr_char_code = ( ($curr_byte_code & 0x1F) << 6 ) + ( $next_byte_code & 0x3F ); 
		}
		else
		{
			$curr_char_code = $curr_byte_code;
		}

		push @ret_array, $curr_char_code;
	}

	return @ret_array;
}

sub encodeBase
{
	my $id = shift;
	return ( 0xFFFFFFF - $id ) + ( ($id & 0x7) << 28 );
}

sub decodeBase
{
	my $id = shift;
	return 0xFFFFFFF - ( $id & 0xFFFFFFF );
}

sub encodeID
{
	my $id = shift;
	if ($id == 0) {
		return 0;
	}
	return encodeBase($id) ^ 19990211;
}

sub decodeID
{
	my $id = shift;
	if ($id == 0) {
		return 0;
	}
	return decodeBase($id)  ^ 19990211;
}

sub encodePicID
{
	my $id = shift;
	
	if ($id <= 1) {
		return 0;
	}

	return encodeBase($id) ^ 20000203;
}

sub decodePicID
{
	my $id = shift;

	if ($id <= 1) {
		return 1;
	}
	
	return decodeBase($id) ^ 20000203;
}

#sub old_encodeID
#{
#	my $id = shift;
#	$id = ( $id * 19990211 ) ^ 19670417;
#	return $id;
#}
#sub old_decodeID
#{
#	my $id = shift;
#	$id = ( $id ^ 19670417 ) / 19990211;
#
#	return $id;
#}

#sub old_encodePicID
#{
#	my $id = shift;
#	if ($id == 1) {
#		return 0;
#	}
#	$id = ( $id * 20000203 ) ^ 19680811;
#	return $id;
#}

#sub old_decodePicID
#{
#	my $id = shift;
#	if ($id == 0) {
#		return 1;
#	}
#	$id = ( $id ^ 19680811 ) / 20000203;
#	return $id;
#}


sub IsPicVisibleToCurrentUser
{
	my ($dbh, $member_id, $visibility, $current_active, $current_id, $current_mate, $pic_gender) = @_;

	my $current_user = $current_id ? $current_id : decodeID( GetCookie("id", 0) );

	if(		int( GetCookie("admin", 0 ) ) == 1 
		||	$current_user == 1 #romy
		||	$current_user == $member_id # myself
	)
	{
		return 1;
	}

	#my $approved_pic = $dbh->do( qq{
	#		select id from member_pics
	#		where id=? 
	#			and active & 2
	#	},
	#	undef,
	#	
	#);

	if ($visibility == 0) {
		return 1;# everyone can view this member's pictures
	}

	if( $current_user == 0 ) {
		return 0; # visitors are not allowed unless visibility is set to 0 (every one)
	}

	if($visibility == 4) { #no one ( except myself ofcourse ) 
		return 0;
	}

	my $is_active = $current_active ? $current_active : GetSubCookie( "myinfo", "active", 0 );
	my $mate_id   = $current_mate   ? $current_mate   : decodeID( GetSubCookie( "myinfo", "mate", 0 ) );

	#LogInfo("CheckActive: member_id:$member_id , is_active:$is_active , current_user:$current_user , mate_id: $mate_id");

	if( $member_id == $mate_id ) {
		return 1; # matched member can see my picture unless visibility is set to 4 (no one)
	}

	if( $visibility==3 ) { #matched member only
		return 0; # if viewer is the matched member, it would have returned 1 in the previous check
	}

	if( $visibility == 2 ) #accepted members only
	{ #check if the current user is accepted by this member (doesn't matter if none active)
		return ( IsAccepted( $dbh, $member_id, $current_user ) ) ;
	}
	
	if( $visibility == 1 && $is_active ) #active members only
	{
		my $my_gender = GetSubCookie( "myinfo", "gender", 0 );
		#LogInfo ("My Gender: $my_gender , member_gender: $pic_gender");
		if ($my_gender != $pic_gender) {#only active users from opposite gender
			return 1;
		}
	}

	return 0; #none active members are not allowes unless accepted or matched
}

sub IsAccepted
{
	my($dbh, $wisher,$wished) = @_;
	my $ret_val = 0;
	
	#print "$wisher\n$wished";
	
	if (my $q_CheckKobool = $dbh->prepare("SELECT * from wishlist where id_wisher=? and id_wished=?")) 
	{
		if ($q_CheckKobool->execute($wisher, $wished )) 
		{
			if (my $record = $q_CheckKobool->fetchrow_hashref()) {
				$ret_val = 1;
			} 
		}
		
		$q_CheckKobool->finish();
	}

	return $ret_val;
}

#----------------------------------------------------------------------------------------------
sub DeleteWish
{
	my ($dbh, $wisher, $wished) = @_;
	my $ret_value=0;

	my $rank = GetWishedRank($dbh, $wisher, $wished);

	if(my $sth = $dbh->prepare("delete from wishlist where id_wisher=? and id_wished=?"))
	{
		if ($sth->execute($wisher, $wished))
		{
			$ret_value=1;
		}
		$sth->finish;
	}

	if ($rank) 
	{
		PromoteNextWishes($dbh, $wisher, $rank);
	}

	return $ret_value;
}
#----------------------------------------------------------------------------------------------
sub GetWishedRank
{
	my ($dbh,$wisher, $wished) = @_;

	my $rank = 0;

	if( my $dbh_master = db_connect_master() )
	{
		if(my $sth=$dbh_master->prepare("select nRank from wishlist where id_wisher=? and id_wished=?"))
		{
			if( $sth->execute($wisher,$wished) ) 
			{
				if(my $row=$sth->fetchrow_hashref)
				{
					$rank=$row->{nRank};
				}
			}
			$sth->finish;
		}
		$dbh_master->disconnect;
	}
	return $rank;
}
#----------------------------------------------------------------------------------------------
sub PromoteNextWishes
{
	my( $dbh,$wisher, $rank) = @_;
	my $ret_value = 0;

	#promote the ranks next to this rank 
	if (my $sth = $dbh->prepare("update wishlist set nRank=nRank-1 where id_wisher=? and nRank>?") )
	{
		if( $sth->execute( $wisher, $rank ) ) 
		{
			$ret_value = 1;
		}
		$sth->finish;
	}

	return $ret_value;
}
#----------------------------------------------------------------------------------------------
sub CheckActivationCode
{
	my ($id, $code) = @_;

	if( decodeID($id) == ( decodeID($code)-1999 ) ) 
	{
		return 1;
	}

	return 0;
}

sub GetActivationCode
{
	my $id = shift; # $id should be decoded

	return encodeID($id + 1999);
}

sub LogInfo
{
	#return;
	my $info = shift;
	my $log_file = shift;

	if(!$log_file){
		$log_file = "kobool_log";
	}

	my $root_folder = "/websites/kobool.com";

	if ($ENV{DOCUMENT_ROOT}) {
		$root_folder = $ENV{DOCUMENT_ROOT};
	}

	open LOG_FILE, ">>" . $root_folder . "/${log_file}.txt" or return;
	print LOG_FILE "[" . localtime(time) . "] " . $info . "\n"; 
	close LOG_FILE;
}

#----------------------------------------------------------------------------------------------
sub DaysToNow
{
	my $given_time = shift;
	return int( HoursToNow($given_time) / 24 ) ;
}

#----------------------------------------------------------------------------------------------
sub HoursToNow
{
	my $given_time = shift;

	return SecondsToNow($given_time) / 3600;
}

#----------------------------------------------------------------------------------------------
sub SecondsToNow
{
	my $sql_time_string = shift;
	my $given_time = SQLTime2GMT( $sql_time_string );
	my $seconds = time - $given_time;

	return $seconds;
}

#----------------------------------------------------------------------------------------------
sub GetVisitationInfo
{
	my ($dbh, $visitor_id, $visited_id) = @_;
	my ($visits_count, $last_visit_time) = (0, "");
	
	if (my $q_visit_info = $dbh->prepare("SELECT * from visitation where visitor=? and visited=? " )) 
	{
		if( $q_visit_info->execute($visitor_id, $visited_id) ) 
		{
			if( my $visit_info = $q_visit_info->fetchrow_hashref() ) 
			{
				($visits_count, $last_visit_time) = ( int($visit_info->{visits_count}), $visit_info->{last_visit} ); 
			}
		}
		$q_visit_info->finish();
	}

	return ($visits_count, $last_visit_time, 0);
}
#---------------
#sub xGetVisitationInfo
#{
#	my ($dbh, $visitor_id, $visited_id, $get_blocked) = @_;
#	my ($visits_count, $last_visit_time, $blocked) = (0, "", 0);
#	
#
#	my $visitor_gender = (GetMemberInfo($dbh,$visitor_id,"gender"))->{gender};
#	my $visited_gender = $visitor_gender == 0 ? 1 : 0;
#
#	my $visitor = $visitor_gender == 0 ? "id_male" : "id_female";
#	my $visited = $visited_gender == 0 ? "id_male" : "id_female";
#	my $last_visit   = $visitor_gender == 0 ? "male_last_visit" : "female_last_visit";
#	my $visits  = $visitor_gender == 0 ? "male_visits" : "female_visits";
#	my $block = $visitor_gender == 0 ? "block_male" : "block_female";
#
#	if( my $dbh_master = db_connect_master() )
#	{
#		if (my $q_visit_info = $dbh_master->prepare("SELECT * from visits where $visited=? and $visitor=? " )) 
#		{
#			if( $q_visit_info->execute($visited_id, $visitor_id) ) 
#			{
#				if( my $visit_info = $q_visit_info->fetchrow_hashref() ) 
#				{
#					($visits_count, $last_visit_time, $blocked) = (	$visit_info->{$visits}, 
#																	$visit_info->{$last_visit}, 
#																	$visit_info->{$block} ); 
#				}
#			}
#			$q_visit_info->finish();
#		}
#		$dbh_master->disconnect;
#	}
#	return ($visits_count, $last_visit_time, $blocked);
#}
#----------------------------------------------------------------------------------------------
sub SQLTime2LocalTime
{
	my $sql_time = shift;

	if (length( $sql_time ) < 19 ) {
		$sql_time = "1970-01-01 00:00:00";
	}
	
	$sql_time =~ s/:/ /g;
	$sql_time =~ s/-/ /g;
	my ($year, $mon, $mday, $hour, $min, $sec) = split(" ", $sql_time);

	my $local_time = timelocal($sec,$min,$hour,$mday,$mon-1,$year); # create time object

	return $local_time;
}
#----------------------------------------------------------------------------------------------
# convert SQL local time to GMT time
sub SQLTime2GMT
{
	my $sql_time = shift;

	if( length( $sql_time ) < 19 ) {
		$sql_time = "1970-01-01 00:00:00";
	}
	
	$sql_time =~ s/:/ /g;
	$sql_time =~ s/-/ /g;
	my ($year, $mon, $mday, $hour, $min, $sec) = split(" ", $sql_time);

	my $gm_time = timegm($sec,$min,$hour,$mday,$mon-1,$year); # create gmtime object

	return $gm_time;
}
#----------------------------------------------------------------------------------------------
sub CurrentSQLGMT
{
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = gmtime();

	$year += 1900;
	$mon ++;

	return sprintf("%d-%02d-%02d %02d:%02d:%02d", $year, $mon, $mday, $hour, $min, $sec);
}
#----------------------------------------------------------------------------------------------
sub CurrentYear
{
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = gmtime();

	return ($year + 1900);
}
#----------------------------------------------------------------------------------------------
sub MakeGMTSQLDate
{
	my $local_time = shift;
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = gmtime($local_time);

	$year += 1900;
	$mon ++;

	return sprintf("%d-%02d-%02d %02d:%02d:%02d", $year, $mon, $mday, $hour, $min, $sec);
}
#----------------------------------------------------------------------------------------------
sub GetMemberInfo
{
	my ($dbh, $id, $fields) = @_;
	
	my $ret_info = ();

	if( my $sth = $dbh->prepare("SELECT $fields from members_info where id=?") )
	{
		if( $sth->execute($id) ) {
			$ret_info = $sth->fetchrow_hashref();
		}
		$sth->finish;
	}

	return $ret_info;
}

sub GetMemberInfoArray
{
	my ($dbh, $id, $fields) = @_;
	
	my $ret_info;

	if( my $sth = $dbh->prepare("SELECT $fields from members_info where id=?") )
	{
		if ($sth->execute($id)) {
			$ret_info = $sth->fetchrow_arrayref();
		}
		$sth->finish;
	}

	return @$ret_info;
}


sub RecordVisitation
{
	my ($dbh, $id_visitor, $id_visited, $ret_info) = @_;

	my $now_gmt = CurrentSQLGMT();

	#LogInfo("Recording Visitation: $id_visitor, $id_visited " ) ;

	my $visitor_gender = (GetMemberInfo($dbh,$id_visitor,"gender"))->{gender};
	my $visited_gender = (GetMemberInfo($dbh,$id_visited,"gender"))->{gender};
	
	#TODO: optimize for speed
	if( $visitor_gender == $visited_gender ) {
		return ;
	}

	#update an existing visitation record if no visits were recorded or last visit was more than an hour ago

	($ret_info->{my_visits_count}, $ret_info->{my_last_visit}) = GetVisitationInfo($dbh, $id_visitor, $id_visited);	

	if( $ret_info->{my_visits_count} )
	{
		$ret_info->{time_since_my_last_visit} = SecondsToNow( $ret_info->{my_last_visit} );
		
		if( $ret_info->{time_since_my_last_visit}  > 3600 ) 
		{
			$ret_info->{success} = int( $dbh->do("update visitation set visits_count=visits_count+1, last_visit=? where visitor=? and visited=? ", undef, $now_gmt, $id_visitor, $id_visited ) );
			if( $ret_info->{success} )
			{
				$ret_info->{visitation} = "incremented";
			}
			else
			{
				$ret_info->{visitation} = "increment_failed";
				LogInfo("Increment failed: visitor:" . $id_visitor . " (" . encodeID($id_visitor) . "), visited:" . $id_visited . "(" . encodeID($id_visited) . ")" ) ;
			}
		}
	}
	else
	{
		$ret_info->{visitation} = "new_visit";
		$ret_info->{success} = $dbh->do("INSERT INTO visitation (visitor, visited, visits_count, first_visit, last_visit) VALUES( ?, ?, 1, ?, ? )", undef, $id_visitor, $id_visited, $now_gmt, $now_gmt );
	}

	#$dbh->disconnect;

}
#----------
#sub xRecordVisitation
#{
#	my ($dbh, $id_visitor, $id_visited, $ret_info) = @_;
#
#	#LogInfo("Recording Visitation: $id_visitor, $id_visited " ) ;
#	$dbh = db_connect();
#
#	my $visitor_gender = (GetMemberInfo($dbh,$id_visitor,"gender"))->{gender};
#	my $visited_gender = (GetMemberInfo($dbh,$id_visited,"gender"))->{gender};
#	
#	#TODO: optimize for speed
#	if( $visitor_gender == $visited_gender ) {
#		$dbh->disconnect;
#		return ;
#	}
#
#	my $visitor = $visitor_gender == 0 ? "id_male" : "id_female";
#	my $visited = $visited_gender == 0 ? "id_male" : "id_female";
#	my $last_visit = $visitor_gender == 0 ? "male_last_visit" : "female_last_visit";
#	my $visits_count = $visitor_gender == 0 ? "male_visits" : "female_visits";
#
#	if( int( $dbh->do("select id from visits where $visitor=? and $visited=?", undef, $id_visitor, $id_visited ) ) )
#	{#update an existing visitation record if no visits were recorded or last visit was more than an hour ago
#
#		($ret_info->{my_visits_count}, $ret_info->{my_last_visit}) = GetVisitationInfo($dbh, $id_visitor, $id_visited);	
#
#		#$ret_info->{time_since_my_last_visit} = time - SQLTime2LocalTime( $ret_info->{my_last_visit} );
#		$ret_info->{time_since_my_last_visit} = SecondsToNow( $ret_info->{my_last_visit} );
#
#		if( $ret_info->{time_since_my_last_visit}  > 3600 ) 
#		{
#			if ( 1 == int( $dbh->do("UPDATE visits set $visits_count = $visits_count + 1, $last_visit=? where $visitor=? and $visited=? ", 
#							undef, 
#							CurrentSQLGMT(),
#							$id_visitor, 
#							$id_visited ) ) 
#				) 
#			{
#				$ret_info->{visitation} = "incremented";
#			}
#			else
#			{
#				$ret_info->{visitation} = "increment_failed";
#				LogInfo("Increment failed: visitor:" . $id_visitor . " (" . encodeID($id_visitor) . "), visited:" . $id_visited . "(" . encodeID($id_visited) . ")" ) ;
#			}
#		}
#
#	}
#	else
#	{
#		$ret_info->{visitation} = "new_visit";
#		$dbh->do("INSERT INTO visits ($visitor, $visited, $visits_count, $last_visit) VALUES( ?, ?, 1, ? )", undef, $id_visitor, $id_visited, CurrentSQLGMT() );
#	}
#
#	$dbh->disconnect;
#
#}

#--------
sub GetLastInsertedID
{
	my ($dbh) = @_;
	my $ret_id = 0;

	if (my $sth = $dbh->prepare ("SELECT LAST_INSERT_ID()")) 
	{
		if($sth->execute())
		{
			if (my @row = $sth->fetchrow_array())
			{
				$ret_id = int( $row[0] );
			}
		}
		$sth->finish;
	}

	return $ret_id;
}

sub HideUnacceptedText
{
	my $sText = shift;

	if( $sText =~ m/\|u\||\|r\|/ )
	{
		return substr( $sText, 0, 3 ) . "|o|";
	}

	return $sText;
}

sub BackwardIsoDate
{
	my ($interval, $interval_unit) = @_;

	return ShiftIsoDate($interval, $interval_unit);
}

sub ShiftIsoDate
{
	my ($interval, $interval_unit) = @_;
	
	if( $interval_unit == 1) 
	{ #minutes
		$interval = $interval * 60;
	}
	elsif($interval_unit == 2)
	{ #hours
		$interval = $interval * (60 * 60);
	}
	else #if($interval_unit == 3)
	{ #days (default)
		$interval = $interval * (60 * 60 * 24);
	}

	my $new_time = time - $interval;
	
	my ($y, $m, $d, $hh, $mm, $ss) = ( localtime($new_time) )[5,4,3,2,1,0]; 
	$y += 1900; $m++;
	my $iso_now = sprintf("%d-%02d-%02d %02d:%02d:%02d", $y, $m, $d, $hh, $mm, $ss);

	return $iso_now;
}

sub DeleteMember
{
	my ($dbh, $id) = @_;

	my $ret_info = { is_admin=>0, desc=>"delete member", member_id=>$id };

	if ( int($dbh->do("delete from members_info where id=? ", undef, $id )) != 0 )
	{
		$ret_info->{deleted_info} = 1;

		#delete pictures
		$ret_info->{deleted_pics} = 
			$dbh->do("delete from members_pics where member_id=? ", undef, $id ) ;
		#TODO: delete the pictures files

		#delete wishlist
		$ret_info->{deleted_wishes} = 
			$dbh->do("delete from wishlist where id_wisher=? ", undef, $id ) ;

		if (my $q_wishers = $dbh->prepare("SELECT id_wisher from wishlist where id_wished=?") ) 
		{
			if ($q_wishers->execute($id) ) 
			{
				while(my $wish_row=$q_wishers->fetchrow_hashref)
				{
					DeleteWish($dbh, $wish_row->{id_wisher}, $id);
				}
			}
			$q_wishers->finish();
		}

		#delete watchlist
		$ret_info->{deleted_watches} = 
			$dbh->do("delete from watchlist where id_watcher=? or id_watched=?", undef, $id, $id );

		#delete visitation
		$ret_info->{deleted_visits} = 
			$dbh->do("delete from visitation where visitor=? or visited=?", undef, $id, $id ) ;

		#delete matchlist
		$ret_info->{deleted_matchlist} = 
			$dbh->do("delete from matchlist where id_wisher=? or id_wished=?", undef, $id, $id ) ;

		#delete messages
		$ret_info->{deleted_messages} = 
			$dbh->do("delete from mailbox where id_sender=? or id_reciever=?", undef, $id, $id ) ;

	}
	else
	{
		$ret_info->{error} = "delete_member_failed";
	}
	
	return $ret_info;
}

sub AddUserAgent
{
	my( $dbh, $user_agent ) = @_;

	my $ret_value = 0;

	if( my $sth = $dbh->prepare("select id from user_agents where user_agent=?") ) 
	{
		if( $sth->execute( $user_agent ) ) 
		{
			if( my $row = $sth->fetchrow_hashref )
			{
				$ret_value = $row->{id};
			}
		}
		$sth->finish;
	}


	if( $ret_value ) {
		return $ret_value;
	}

	if( int( $dbh->do( "insert into user_agents (user_agent) values(?) ", undef, $user_agent ) ) )
	{
		return GetLastInsertedID( $dbh );
	}
	
	return 1;
}

sub GetLastInsertedID
{
	my $dbh = shift;

	my $ret_value = 0;

	if (my $sth = $dbh->prepare("SELECT LAST_INSERT_ID()")) 
	{
		if($sth->execute())
		{
			if (my @row = $sth->fetchrow_array())
			{
				$ret_value = $row[0];
			}
		}
		$sth->finish;
	}

	return $ret_value;
}

sub GetRecordHashInfo
{
	my ($dbh, $sql_statement) = @_;
	
	my $ret_info;

	if( my $sth = $dbh->prepare($sql_statement) )
	{
		if( int( $sth->execute() ) ) 
		{
			$ret_info = $sth->fetchrow_hashref();
		}
		$sth->finish;
	}

	return $ret_info;
}

sub ReadRecordHashInfo
{
	my ($dbh, $sql_statement, $ret_info) = @_;
	my $ret_value = 0;
	
	if( my $sth = $dbh->prepare($sql_statement) )
	{
		$ret_value = int( $sth->execute() );
		if( $ret_value ) 
		{
			if( my $rec_info = $sth->fetchrow_hashref() )
			{
				for my $key_name ( keys %{$rec_info} ) 
				{
					$ret_info->{$key_name} = $rec_info->{$key_name};
				}
			}
		}
		$sth->finish;
	}

	return $ret_value;
}

sub GetMyBlocklistSQLSelect
{
	my ($my_id, $my_gender) = @_;

	my $my_column    = $my_gender == 1 ? "id_female" : "id_male";
	my $blocked_column = $my_gender == 1 ? "id_male" : "id_female";
	my $block_column = $my_gender == 0 ? "block_female" : "block_male";

	return "select $blocked_column from visits where $my_column = $my_id and $block_column = 1";
}

sub GetIPCountry
{
	my $ip_address = shift;
	return "us";
	#return $IP2Country->inet_atocc($ip_address);
}

sub CanAccessPaidChat
{
	my ($dbh, $member_id, $match_id, $check_country) = @_;

#	if( $check_country )
#	{
		#my $country = IP2CountryCode( $dbh );
		my $sql = "select 
			wisher_info.last_country as wisher_country, wished_info.last_country as wished_country 
			from matchlist 
			inner join members_info wisher_info on wisher_info.id = matchlist.id_wisher
			inner join members_info wished_info on wished_info.id = matchlist.id_wished
			where matchlist.id = $match_id
				";

		my $country_info = GetRecordHashInfo( $dbh, $sql );

		if( defined $country_info 
			&&	( $country_info->{wisher_country} =~ m/(MA|DZ|TN)/ # /MA||PS||DZ/
				  && $country_info->{wished_country} =~ m/(MA|DZ|TN)/ # /MA||PS||DZ/
				) 
		  ) 
		{
			return 1;
		}
#	}
	
	if( $match_id < $last_free_match ){
		return 1;#old matches are ok
	}

	my $ret_value = int( $dbh->do("select id from contact_cards where user=? and match_id=?", 
								  undef, 
								  $member_id, $match_id 
								 ) 
					   );

	return $ret_value;
}

sub IsMatchCardsRefundable
{
	my ($dbh, $match_id) = @_;

	if( $match_id < $last_free_match ){
		return 0;#no cards for old matches old matches
	}

	my $used_cards = int( $dbh->do("select id from contact_cards where match_id=? ",
									undef,
									$match_id) );

	my $paid_chat_read = int( $dbh->do("select id from mailbox 
										where id_thread=? 
										and is_free=0 
										and recieved_on is not null",
									undef,
									$match_id) );

	if( $paid_chat_read > 0 ){
		return 0;
	}

	my $decline_paid = int( $dbh->do("select id from matchlist where id=? and paid_msg=1", undef, $match_id ) );
	if( $decline_paid ){
		return 0;
	}

	return $used_cards;# refundable cards
}
#======================================================
sub RefundMatchCards
{
	my ($dbh, $match_id) = @_;

	if( $match_id < $last_free_match ){
		return 0;#no cards for old matches old matches
	}
	
	$dbh->do( "update contact_cards set user=null, match_id=null, date_used=null where match_id=?", undef, $match_id );
}
#======================================================
sub DeliverCardsOrder
{
	my ($dbh, $order_id, $amount, $payer_email, $query, $log_file) = @_;

	return DeliverCardsOrderEx($dbh, $order_id, $amount, $payer_email, $query, "", $log_file);
}

sub DeliverCardsOrderEx
{
	my ($dbh, $order_id, $amount, $payer_email, $query, $trans_id, $log_file) = @_;

	my $order_info = GetRecordHashInfo( $dbh, "select * from orders where id=" . $order_id  );
	my $language;
	my $success=0;
	my $error_msg = "";

	if(!$query){
		$query="";
	}

	if(!$log_file){
		$log_file = "deliver_orders";
	}
	
	if( $order_info )
	{
		if(! $amount ){
			$amount = $order_info->{total_price};
		}

		my $card_price  = $amount / $order_info->{quantity};
		$language		= $order_info->{buyer_language};

		if( ! length( $payer_email ) ){
			$payer_email = $order_info->{buyer_email};
		}

		LogInfo( "Order Number: ". $order_id, $log_file );
		LogInfo( "Buyer ID: "    . $order_info->{buyer_id}, $log_file );
		LogInfo( "cards count: " . $order_info->{quantity}, $log_file );
		LogInfo( "card price: "  . $card_price, $log_file );
		LogInfo( "Channel: "     . $order_info->{sale_channel}, $log_file );
		LogInfo( "Currency: "    . $order_info->{currency}, $log_file );
		LogInfo( "ip_address:  " . $order_info->{buyer_ipaddress}, $log_file );
		LogInfo( "country: "     . IP2CountryCode( $dbh, $order_info->{buyer_ipaddress} ), $log_file );
		LogInfo( "language: $language" , $log_file );

		if( $order_info->{date_delivered} )
		{
			$success = 1;
			$error_msg = "Order #${order_id} is already delivered ";
			LogInfo( $error_msg, $log_file );
		}
		else
		{
			for( my $i=0; $i< $order_info->{quantity} ; $i ++ )
			{
				$success = int( $dbh->do("
INSERT INTO contact_cards 
	   (owner,                   order_id,  date_purchased,              channel,                     price,       ip_address,                     payer_email,  currency,                posted_data ) 
values (?,                       ?,         ?,                           ?,                           ?,           ?,                              ?,            ?,                       ?)", undef,
		$order_info->{buyer_id}, $order_id, $order_info->{date_created}, $order_info->{sale_channel}, $card_price, $order_info->{buyer_ipaddress}, $payer_email, $order_info->{currency}, $query ) );

				LogInfo( "success: " . $success, $log_file );
			}

			if($success){#TODO: record transaction_id
				$dbh->do( "update orders set date_delivered=?, trans_id=? where id=?", undef, CurrentSQLGMT(), $trans_id, $order_id );
			}
		}
	}
	else
	{
		$error_msg = "Error: order# " . $order_id . " could not be found ";
		LogInfo( $error_msg, $log_file );
	}

	return ($success, $language, $error_msg);
}

sub MemberCardsRecord
{
	my ($dbh, $mem_id, $ret_info) = @_;
	
	$ret_info->{purchased} = int( $dbh->do( "SELECT id from contact_cards where owner=?", undef, $mem_id ) );
	$ret_info->{new_cards} = int( $dbh->do( "SELECT id from contact_cards where owner=? and date_used is null ", undef, $mem_id ) );

}


sub validateUTF8StringEx
{
	my $sText = shift;
	my $nLength = shift;
	my $i;
	my $charOffset = 0;
	
	if( $sText =~ m/\|u\||\|r\|/ )
	{
		return substr( $sText, 0, 3 ) . "|o|";
	}

	for( $i=0; $i<length($sText) && $charOffset < $nLength; $i++ ) 
	{
		my $curr_byte = substr($sText, $i, 1);
		my $curr_byte_code = ord($curr_byte);
		my $error_found = 0;
		
		if( $curr_byte_code > 0x7F ) 
		{
			my $bytesCount = 0;

			while( ( ( $curr_byte_code & ( 0x80 >> $bytesCount ) ) > 0 ) && $bytesCount < 7 ) {
				$bytesCount ++;
			}

			if( $bytesCount > 1 && length($sText) >= $i + $bytesCount ) 
			{
				for( my $n = 1 ; $n < $bytesCount && $error_found == 0; $n ++ ) 
				{
					my $next_byte = ord( substr( $sText, $n + $i, 1 ) );
					
					if( ( $next_byte & 0xC0 ) != 0x80 ) 
					{
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
						$nLength += 6;
						$n+=6;
					}
				}
			}
			else
			{
				$error_found = 1;
				$bytesCount = 1;
				#substr( $sText, $i, 1) = "&#". @CP1256ToUnicode[ord( substr( $sText, $i, 1) )]  . ";";#"?"; 
				substr( $sText, $i, 1) = "?";
				$nLength += 6;
			}

			$i += $bytesCount - 1 ;
		}

		$charOffset ++;
	}

	return substr( $sText, 0, $i );
}

#table_ids:  1:title, 2:self_desc , 3:mate_desc, 4:termination note
sub InsertProfileText
{
	my ( $dbh, $creator, $text_data, $table_id, $language, $approved ) = @_;

	if( !length($text_data) )
	{#deleted
		return int( $dbh->do("delete from text_data where creator=? and table_id=?", undef, $creator, $table_id) );
	}

	my $last_update = CurrentSQLGMT();

	if(!defined $language){
		$language = 0;
	}
	if(!defined $approved){
		$approved = 0;
	}

	$text_data = validateUTF8String($text_data);

	if( int( $dbh->do(	"select id from text_data where creator=? and table_id=? and text_string=? and language=?", undef, 
						$creator, $table_id, $text_data, $language) ) )
	{	
		return 0; #no change
	}

	if( int( $dbh->do(	"update text_data set text_string=?, last_update=?, approved=?, language=? where creator=? and table_id=? ", undef, 
						$text_data, $last_update, $approved, $language, $creator, $table_id ) ) )
	{
		return 2; #print "Updated \n";
	}
	else
	{
		if( int( $dbh->do("insert into text_data(text_string,date_created,last_update,creator,table_id,approved,language) values(?,?,?,?,?,?,?) ", undef, 
								$text_data, $last_update, $last_update, $creator, $table_id , $approved, $language
						 )
			   )
		  )
		{
			return 1;	#print "Inserted ($text_data)\n";
		}
		else
		{
			return 0;	#print "** error inserting text\n";
		}
	}
}

sub QueryResultsIdArray
{
	my ($dbh, $query) = @_;

	my $ret_array = "";
	
	if( my $sth = $dbh->prepare($query) )
	{
		if( $sth->execute() )
		{
			while( my $row = $sth->fetchrow_hashref )
			{
				$ret_array .= ( length $ret_array ? "," : "" ) . $row->{id};
			}
		}

		$sth->finish;
	}

	return $ret_array;
}

sub GetImageBlob
{
#column
#img_id
#dbh
	my $params = { @_ };# ()
	my @blob;
	
	my $col_name = $params->{column} || "pic_data"; # value could be "pic_data" || "tn_data"
	my $dbh = $params->{dbh} || db_connect();
	
	if( my $sth = $dbh->prepare( 
			qq{
				select $col_name 
				from members_pics 
				where id=? 
					and $col_name is not null 
			}
		) 
	)
	{
		if( int( $sth->execute( $params->{img_id} ) ) ) {
			if( my $row = $sth->fetchrow_hashref )
			{
				@blob = $row->{$col_name};
			}
		}
		$sth->finish;
	}

	if( !defined $params->{dbh} ){
		$dbh->disconnect;
	}

	return @blob;
}

#======================End of module===============================================
1;


