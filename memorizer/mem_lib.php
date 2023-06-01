<?php

function ComposeProfileFBML( $user_id, $max_days )
{
	global $lang, $str_table, $canvas_name;

	if( !isset($max_days) )
	{
		$max_days = 8;
	}
	
	$direction = $lang == "ar" ? " dir=RTL " : "";

	$chart_html = GetChartHTML( $user_id, $max_days );

	$exercise_now	= $str_table["exercise_now"];
	$invite			= $str_table["invite"];
	$more			= $str_table["more"];

	$ret_val = <<<EOT
<div $direction>
	<div style="padding-bottom:5px">
		<a href='http://apps.facebook.com/${canvas_name}/?page='>$exercise_now</a>&nbsp;|&nbsp;
		<a href='http://apps.facebook.com/${canvas_name}/?page=invite'>$invite</a>&nbsp;|&nbsp;
		<a href='http://apps.facebook.com/${canvas_name}/?page=chart'>$more</a>
	</div>
	$chart_html
</div>
EOT;

	return $ret_val ;
}

function DetectLanguage()
{
	//global $_GET, $_COOKIE;

	//return ( $_GET['lang'] == "ar" ) ? "ar" : "en";
	return GetParam("lang", GetCookie("lang","en") );
}

function GetParam( $param_name, $default_value )
{
	global $_GET;

	$ret_value = $_GET[$param_name];

	if( isset($ret_value) ){
		return $ret_value;
	}
	
	return $default_value;
}

function GetCookie( $param_name, $default_value )
{
	global $_COOKIE;

	$ret_value = $_COOKIE[$param_name];

	if( isset($ret_value) ){
		return $ret_value;
	}
	
	return $default_value;
}

function GetChartHTML( $user_id, $max_days )
{
	global $str_table;
	$footer   = "";
	$bar_width= 40;
	$chart_height = 200;
	$chart_scale = $chart_height / 2;
	$chart_bars = "";

	$link = mysql_connect('localhost', 'root', 'kobool_2004') ;

	if( !$link )
	{
		return( "database connection failed" );
	}

	if( mysql_select_db( 'quran', $link ) )
	{
		if( $memorizer_result = mysql_query( "SELECT * FROM memorizer where user_id='$user_id' order by mem_date desc limit $max_days " ) ) 
		{
			while( $memorizer_info = mysql_fetch_assoc( $memorizer_result ) )
			{
				$percentage = floor( ( $memorizer_info["mem_words"] / $memorizer_info["total_words"] ) * 100 ) ;
				$height = ( $percentage * $chart_height / 100 ) . "px";
				$amount = $memorizer_info["mem_words"] . " " . $str_table["chars"];
				$new_bar = <<<EOT
			<td style='vertical-align:bottom;font-size:10px;text-align:center'>
				$percentage%
				<div style='color:green;width:${bar_width}px;height:${height};background-color:#DADFC6;border-top:solid 1px green'>$amount</div>
			</td>
EOT;
				$chart_bars = $new_bar . $chart_bars;

				$mem_date = FormatDate( $memorizer_info["mem_date"] );
				$new_footer_bar = <<<EOT
			<td style="vertical-align:top">
				<div style='width:${bar_width}px;font-size:8px;text-align:center;'>$mem_date</div>
			</td>
EOT;
				$footer = $new_footer_bar . $footer;
			}

			mysql_free_result( $memorizer_result );

			$response .= $chart_bars;
		}
		
	}

	mysql_close($link);

	$response = <<<EOT
<table style='width:$width;' cellspacing=0 cellpadding=0>
<tr>
	<td style="vertical-align:bottom;padding-bottom:3px;"
		><div style='height:${chart_scale}px;font-size:12px;border-top:solid 1px silver;padding:1px'>100</div
		><div style='height:${chart_scale}px;font-size:12px;border-top:solid 1px silver;padding:1px'>50</div
	></td>
	<td style="background-color:black">
		<div style='width:1px;'></div>
	</td>
	<td style='width:100%;'>
		<table style='height:${chart_height}px'>
		<tr>
			${chart_bars}
		</tr>
		</table>
	</td>
</tr>
<tr>
	<td style='border-top:solid 1px black'>
		<div style='height:20px'>&nbsp;</div>
	</td>
	<td style="background-color:black">
		<div style='width:1px;'></div>
	</td>
	<td style='border-top:solid 1px black'>
		<table>
		<tr>
			${footer}
		</tr>
		</table>
	</td>
</tr>
</table>
EOT;

	return $response;
}


function FormatDate( $sql_date )
{
	global $str_table;
	$date_info = split("-", $sql_date);
	return $str_table["monthes"][$date_info[1]] . " " . $date_info[2] . ",<br>" . $date_info[0];

}


function GetChartJSON( $user_id )
{
	$history = "";

	$link = mysql_connect('localhost', 'root', 'kobool_2004') or die('Could not connect: ' . mysql_error());

	if( mysql_select_db( 'quran', $link ) )
	{
		if( $memorizer_result	= mysql_query( "SELECT * FROM memorizer where user_id='$user_id' order by mem_date desc" ) )
		{
			while( $memorizer_info = mysql_fetch_assoc( $memorizer_result ) )
			{
				$history .= ( strlen($history) ? "," : "" );
				$history .= "{date:'" . $memorizer_info["mem_date"] . "'". 
							",score:" . $memorizer_info["mem_words"] . 
							",total:". $memorizer_info["total_words"] . "}";
			}
		}
		mysql_free_result( $memorizer_result );
	}
	
	mysql_close($link);
	return "jsr={success:1, user_id:\"$user_id\", history:[" . $history . "]};$debug" . $_REQUEST['jsp'];
}

?>