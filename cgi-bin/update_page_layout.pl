#!/usr/bin/perl

use qutils;

qutils::InitCGI();

print "Content-Type: text/plain;\n\n";

my $page = qutils::GetParam("pg", 0);
my $sura = qutils::GetParam("s", 0);
my $aya  =  qutils::GetParam("a", 0);
my $type =  int(qutils::GetParam("t", 0));# 0: start, 1: end
my $line =  qutils::GetParam("l", 0);
my $xpos =  qutils::GetParam("x", 0);

my $dbh = qutils::db_connect("quran");

if( ! $dbh )
{
	print qutils::JsOut({
			success=>0,
			err_msg=>"could not connect to database"
		},
		"re"
	);
	exit;
}

my $ret_code = 0;

if( int( $dbh->do( 
			qq{	select id 
				from page_layout 
				where sura=? and aya=?
			}, 
			undef, 
			$sura, 
			$aya 
		)
	)
)
{#update
	my $update_sql = ( $type == 1 ) ? 
		qq{
			update page_layout 
			set page=?, eline=?, epos=? 
			where sura=? and aya=?
		}:
		qq{
			update page_layout 
			set page=?, sline=?, spos=? 
			where sura=? and aya=?
		};

	$ret_code = int( $dbh->do( $update_sql, undef, $page, $line, $xpos, $sura, $aya ) );
}
else
{#insert
	$ret_code = int( $dbh->do( 
			qq{
				insert into page_layout( page, sura, aya, sline, spos, eline )
				values( ?, ?, ?, ?, ?, ? )
			},			 
			undef, 
			$page, $sura, $aya, $line, $xpos, $line
		)
	);
}

$dbh->disconnect;

print qutils::JsOut({
		aya=>$aya,
		page=>$page,
		success=>1,
	},
	"re"
);
