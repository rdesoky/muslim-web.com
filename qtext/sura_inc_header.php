<?
	include( "../strings.php" );
	include( "../ar_strings.php" );
	include( "../filesver.php" );
?>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="imagetoolbar" content="no">

<link type="text/css" rel="stylesheet" href="<?=$FV['defaultstyle']?>"/>
<link type="text/css" rel="stylesheet" href="<?=$FV['sura_css']?>"/>
<link type="text/css" rel="stylesheet" href="<?=$FV['menu_css']?>"/>

<script type="text/javascript" src="<?=$FV['ScriptLoader']?>"></script>
<script type="text/javascript">

	window.onload = function()
	{
		ScriptLoader.loadScripts ( {
				gStrings:			"<?=$FV['gStrings']?>",
				Utils:				"<?=$FV['utils']?>",
				DefineJClass:		"<?=$FV['jclass']?>",
				addAya:				"<?=$FV['tlib']?>",
				uncompressMem:		"<?=$FV['lib']?>",
				GetSaveURL:			"<?=$FV['qlib']?>",
				QData:				"<?=$FV['qdata']?>",
				JCQuranViewer:		"<?=$FV['JCQuranViewer']?>",
				initSura:			"<?=$FV['sura']?>",
				getSuraMenu:		"<?=$FV['menu']?>",
				JCSettings:			"<?=$FV['JCSettings']?>"

			},function(){
				initSura();
			}
		);
	}

</script>


