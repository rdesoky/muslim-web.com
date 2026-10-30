function OnBodyLoad()
{
	ScriptLoader.addDefinitions ( {

		Utils:				"js/common/utils.js?20090214",
		DefineJClass:		"js/common/jclass.js?v=20090214",
		uncompressMem:		"lib.js?v=20080812",
		UpdateResolution:	"qlib.js?v=20080815",
		addAya:				"tlib.js?v=20080817",
		GetData:			"xml_loader.js?v=20080812",
		InitPage:			"home.js?v=20090214",
		createKeys:			"class_akeys.js?v=20080812",
		McDhtmlSpin:		"class_spinbox.js?v=20080812",
		JCSuraCell:			"JCSuraCell.js?v=20080812",
		JCShowHideSwitcher:	"JCShowHideSwitcher.js?v=20080812",
		JCSuraViewer:		"JCSuraViewer.js?v=20080812",
		JCDragDrop:			"JCDragDrop.js?v=20080812"
		
	} );

	ScriptLoader.loadNewPackage( [
			"Utils",
			"DefineJClass",
			"uncompressMem",
			"UpdateResolution",
			"addAya",
			"GetData",
			"InitPage",
			"createKeys",
			"McDhtmlSpin",
			"JCSuraCell",
			"JCShowHideSwitcher",
			"JCSuraViewer",
			"JCDragDrop"
		], function(){
			InitPage();
		}
	);
}

