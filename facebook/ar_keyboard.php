<?php

$key_map= array(
	39=>1591,	// '
	41=>40,	// (
	40=>41,	// )
	44=>1608,	// ,
	46=>1586,	// .
	47=>1592,	// /
	59=>1603,	// ;
	63=>1567,	// ?
	91=>1580,	// [
	93=>1583,	// ]
	96=>1584,	// `

	123=>60,		// {
	125=>62,		// }

	65=>1588		,//A
	97=>1588		,//a
	
	66=>1575		,//b
	98=>1575		,//b
	
	67=>1572		,//c
	99=>1572		,//c
	
	68=>1610		,//d
	100=>1610	,//d
	
	69=>1579		,//e
	101=>1579	,//e
	
	70=>1576		,//f
	102=>1576	,//f
	
	71=>1604	,//g
	103=>1604	,//g
	
	72=>1571	,//H
	104=>1575	,//h
	
	73=>1607	,//i
	105=>1607	,//i
	
	74=>1578	,//j
	106=>1578	,//j
	
	75=>1606	,//k
	107=>1606	,//k
	
	76=>1605	,//l
	108=>1605	,//l
	
	77=>1577	,//m
	109=>1577	,//m
	
	78=>1570	,//N
	110=>1609	,//n
	
	79=>1582	,//o
	111=>1582	,//o

	80=>1581	,//p
	112=>1581	,//p

	81=>1590	,//q
	113=>1590	,//q

	82=>1602	,//r
	114=>1602	,//r

	83=>1587	,//s
	115=>1587	,//s

	84=>1601	,//t
	116=>1601	,//t

	85=>1593	,//u
	117=>1593	,//u

	86=>1585	,//v
	118=>1585	,//v

	87=>1589	,//w
	119=>1589	,//w

	88=>1569	,//x
	120=>1569	,//x

	89=>1573	,//Y
	121=>1594	,//y

	90=>1574	,//z
	122=>1574	//z

);

function KeyButton( $lower, $upper )
{
	global $key_map;
	$a_lower_code = $key_map[ ord($lower) ] ? $key_map[ ord($lower) ] : 0 ;
	$a_upper_code = $key_map[ ord($upper) ] ? $key_map[ ord($upper) ] : 0 ;

	$a_lower = $a_lower_code ? ( "&#" . $a_lower_code . ";" ) : "&nbsp;";
	$a_upper = $a_upper_code ? ( "&#" . $a_upper_code . ";" ) : "&nbsp;";
	$a_upper = $a_lower_code == $a_upper_code ? "&nbsp;" : $a_upper;
	$bg_color = $lower == "f" || $lower== "j" ? "background:#DDDDDD" : "";
	
	$ret_value = <<<EOT
<td style="cursor:hand;" onclick="InsertChar($a_lower_code,$a_upper_code)">
	<table cellspacing="0" cellpadding="0">
	<tr style="$bg_color">
		<td ><div class="key" >$upper</div></td><td><div class="key" style="color:brown">$a_upper</div></td>
	</tr>
	<tr>
		<td ><div class="key" >&nbsp;</div></td><td><div class="key" style="color:brown">$a_lower</div></td>
	</tr>
	</table>
</td>
EOT;
	return $ret_value;
}

function KeyButtons($chars)
{
	$ret_keys = "";

	for($i=0; $i < strlen($chars); $i += 2 )
	{
		$ret_keys .= KeyButton( substr( $chars, $i, 1) , substr( $chars, $i + 1, 1)  );
	}
	return $ret_keys;
}


?>
<style>
	.key{
		font-family:tahoma;font-size:11px;width:12px;text-align:center;
	}
</style>
<script language="JavaScript">
function InsertChar( nKeyCode )
{
	if( !nKeyCode )
		return;

	if(idAnswer.dispatchEvent){
		var new_event = document.createEvent("KeyboardEvent");
			new_event.initKeyEvent(
				"keypress",			//  in DOMString typeArg
				true,				//  in boolean canBubbleArg,
				true,				//  in boolean cancelableArg,
				null,				//  in nsIDOMAbstractView viewArg,  Specifies UIEvent.view. This value may be null.
				false,				//  in boolean ctrlKeyArg,
				false,				//  in boolean altKeyArg,
				false,				//  in boolean shiftKeyArg,
				false,				//  in boolean metaKeyArg,
				0,//  in unsigned long keyCodeArg,
				nKeyCode);
		idAnswer.dispatchEvent(new_event);
	}else{
		//var new_event = document.createEventObject();
		//new_event.keyCode = nKeyCode;
		//idAnswer.fireEvent("keypress", new_event);
		idAnswer.value += String.fromCharCode(nKeyCode);
	}
	idAnswer.focus();
}
</script>
<table cellspacing=0 cellpadding=0 style="border:solid 2px silver"><tr><td>
	<table border cellpadding=0 cellpadding=0><tr><?=KeyButtons("`~1!2@3#4$5%6^7&8*9(0)-_=+\\|")?></tr></table>
	<table border cellpadding=0 cellpadding=0><tr><td><div class="key" style="width:35px">&nbsp;</div></td><?=KeyButtons("qQwWeErRtTyYuUiIoOpP[{]}")?></tr></table>
	<table border cellpadding=0 cellpadding=0><tr><td><div class="key" style="width:45px">&nbsp;</div></td><?=KeyButtons("aAsSdDfFgGhHjJkKlL;:'\"")?></tr></table>
	<table border cellpadding=0 cellpadding=0><tr><td><div class="key" style="width:62px">&nbsp;</div></td><?=KeyButtons("zZxXcCvVbBnNmM,<.>/?")?><td><div class="key" style="width:75px">&nbsp;</div></td></tr></table>
</td></tr></table>
