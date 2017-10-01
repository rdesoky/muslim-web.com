try{ onLoadScriptFile(); } catch(e){};

function JCAbsPos()
{
	this.getAbsXpos = function()
	{
		var xpos = this.offsetLeft + 2;
		var offsetParent = this.offsetParent;
		while( offsetParent ){
			xpos += offsetParent.offsetLeft;
			offsetParent = offsetParent.offsetParent;
		}
		return xpos;
	};

	this.getAbsYpos = function()
	{
		var ypos = this.offsetTop + 1;
		var offsetParent = this.offsetParent;
		while( offsetParent ){
			ypos += offsetParent.offsetTop;
			offsetParent = offsetParent.offsetParent;
		}
		return ypos;
	};
}

function JCDragDrop()
{
	this.implementClass(JCAbsPos);

	this.bMouseCaptured = false;

	this.onmousedown = function()
	{
		this.captureMouse();
	};

	this.onmouseup = function()
	{
		this.releaseMouse();
	};

	this.onmousemove = function()
	{
		if(!this.bMouseCaptured)
			return;

		this.shiftX = event.x - this.initDX;
		this.shiftY = event.y - this.initDY;
		var xpos = this.initX + this.shiftX;
		var ypos = this.initY + this.shiftY;

		if(!this.DVert)
			document.dragGost.style.left = xpos + "px";

		if(!this.DHorz)
			document.dragGost.style.top  = ypos + "px";
	};

	this.captureMouse = function()
	{
		if(this.bMouseCaptured)
			return;

		this.initDX = this.initDY = this.initX = this.initY = this.shiftX = this.shiftY = 0;

		if(!document.dragGost){
			document.dragGost = document.createElement("DIV");
			document.dragGost.style.position = "absolute";
			document.dragGost.style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=65)";
			document.body.appendChild( document.dragGost );
			document.dragGost.style.zIndex = 10000;
		}

		document.dragGost.innerHTML  = this.innerHTML; 
		document.dragGost.style.left = this.initX = this.getAbsXpos();
		document.dragGost.style.top  = this.initY = this.getAbsYpos();
		document.dragGost.style.display = "";
		document.dragGost.dragSource = this;

		this.initDX = event.x;
		this.initDY = event.y;

		this.setCapture();
		this.bMouseCaptured = true;
		document.bDragging = true;
	};

	this.releaseMouse = function()
	{
		if(!this.bMouseCaptured)
			return;
		document.dragGost.style.display = "none";
		document.releaseCapture();
		this.bMouseCaptured = false;
		document.bDragging = false;
		
		if(this.ondrop){
			window.setTimeout(this.ondrop,1);
		}
	};

}
