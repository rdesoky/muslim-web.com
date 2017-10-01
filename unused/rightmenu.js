var ie5 = window.createPopup();

if (ie5)
	document.oncontextmenu = showPopupMenu;


function showPopupMenu()
{
	mx=event.clientX;
	my=event.clientY;
	menx=window.screenLeft+mx-120;	
	meny=window.screenTop+my;
	sysmen=window.createPopup();
	
	sysmen.document.write( composeMenu() );
	sysmen.document.body.style.border = "solid 1px gray";
	sysmen.document.body.style.margin = 0;
	sysmen.document.body.scroll = "no";

	sysmen.show(menx, meny, 120, 200 );
	return false;
};

function composeMenu()
{
	return ( 
		"<div style='padding:2px'>" +
			"<div>item 1</div>" +
			"<div>item 2</div>" +
			"<div>item 3</div>" +
		"</div>"
	);
}


