<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta http-equiv=Content-Type content="text/html; charset=utf-8">
	<title>البحث في آيات القرآن الكريم</title>

	<link type="text/css" rel="stylesheet" href="search.css"/>

	<script language="JavaScript" src="lib.js?v=20080812"></script>
	<script language="JavaScript" src="qlib.js?v=20080815"></script>
	<script language="JavaScript" src="class_akeys.js?v=20080812"></script>
	<script src="http://stats.muslim-web.com/cgi-bin/counter.pl" language="vbscript"></script>
</head>
<body onload="onBodyLoad()">

<img id=idAyaPic style='display:none' src='images/wait.gif'/>

<p align=center><b>البحث في آيات القرآن الكريم</b></p>

<form	method=get 
		action="search.htm" 
		name=SearchForm 
		style="border:dotted 1px gray;padding:2px;">

<table>
<tr>
	<td valign=top	>
ابحث عن:
	</td>
	<td valign=top>
	<span  onmousemove="ShowElement('idKeyboard',200);" onmouseout="HideElement('idKeyboard',600)">
	<div>
		<input type=edit id=idSearchText name=SearchText size="30">
		<!--textarea type=edit rows=1 COLS=30 id=idSearchText xstyle="width:160px" WRAP=off></textarea-->
	</div>
		<script language=javascript>new CKeyboard("idSearchText", arabic_keys, "onSearch(SearchForm)")</script>
	</span>
	</td>
	<td valign=top >
		<input type=submit value="ابحث"> 
		<input type=reset value="جديد">
	</td>
	<td valign=top style="cursor:default;padding-top:4px;padding-bottom:4px;color:green" onmouseover="ShowElement('idCommon',500)" onmouseout="HideElement('idCommon',500)">
		امثلة لعبارات للبحث
		<img src=images/next.gif>
		<div id=idCommon NOWRAP style="background:white;position:absolute;display:none;border:1px solid gray;width:80px;padding:2px">
			<script language=javascript>
				var samples= new Array(
				"محمد",
				"عيسى",
				"عيسى ابن مريم",
				"ان في ذلك",
				"انه هو",
				"ان الله",
				"إلا قليل",
				"لآيات",
				"لآية",
				"لهم اجرهم عند ربهم"
				);
				for (i=0; i<samples.length; i++)
				{
					document.write("<a href=\"javascript:onCommonSelect('" + samples[i] + "')\">" + samples[i] + "<br>");
				}
			</script>
		</div> 
	
	</td>
</tr>

</table>
</form>
<div id=idResults style="background:#efefde;padding:3px;border-top:white 1px solid;border-left:white 1px solid;border-bottom:gray 1px solid;border-right:gray 1px solid; font-family:tahoma; font-size:12px"><div id=idStatus></div>
&nbsp;
</div>
</BODY>
</HTML>

<script language="JavaScript" src="navigator.js?v=20080914.1"></script>
<script language="JavaScript" src="xml_loader.js?v=20080812"></script>
<script language="JavaScript" src="search.js?v=20080813"></script>
