
function JCAbsPos()
{
	this.getAbsXpos = function()
	{
		var xpos = this.offsetLeft;
		var offsetParent = this.offsetParent;
		while( offsetParent ){
			xpos += offsetParent.offsetLeft - offsetParent.scrollLeft;
			offsetParent = offsetParent.offsetParent;
		}
		return xpos;
	};

	this.getAbsYpos = function()
	{
		var ypos = this.offsetTop;
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
	this.captureSpot = 0;

	this.onmousedown = function()
	{
		if(this.captureSpot)
			this.captureMouse();
	};
	
	this.setCaptureSpot = function(){};

	this.onmousemove = function()
	{
		if(!this.bMouseCaptured)
		{
			this.setCaptureSpot();
			return;
		}

		document.dragGost.style.display = "";

		this.shiftX = event.x - this.initDX;
		this.shiftY = event.y + document.body.scrollTop - this.initDY;
		var newWidth  = 0;
		var newHeight = 0;

		if( this.captureSpot & 1 )
			 newWidth = this.offsetWidth + this.shiftX;//resize

		if( this.captureSpot & 4 )
			newWidth = this.offsetWidth - this.shiftX;
		
		if( this.captureSpot & 2 )
			newHeight = this.offsetHeight + this.shiftY;

		if( this.captureSpot & 8 )
			newHeight = this.offsetHeight - this.shiftY;

		if( this.captureSpot & ( 16 + 4 ) )
			document.dragGost.style.left = ( this.initX + this.shiftX ) + "px";

		if( this.captureSpot & ( 16 + 8) )
			document.dragGost.style.top  = ( this.initY + this.shiftY ) + "px";
			
		if(newWidth > 0)
			document.dragGost.style.width = newWidth + "px";
		if(newHeight > 0)
			document.dragGost.style.height = newHeight + "px";
	};

	this.onmouseup = function()
	{
		this.releaseMouse();
	};

	this.captureMouse = function()
	{
		if(this.bMouseCaptured)
			return;

		this.initDX = this.initDY = this.initX = this.initY = this.shiftX = this.shiftY = 0;

		if(!document.dragGost){
			document.dragGost = DocElement("DragGhost");
			if(!document.dragGost)
			{
				document.dragGost = document.createElement("DIV");
				document.body.appendChild( document.dragGost );
				document.dragGost.style.position = "absolute";
				document.dragGost.style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=55)";
				document.dragGost.style.border = "solid 4px red";			
			}
			document.dragGost.style.zIndex = 30000;
		}

		//document.dragGost.style.display = "";
		document.dragGost.style.width= this.offsetWidth + "px"; 
		document.dragGost.style.height= this.getGhostHeight() + "px"; 
		document.dragGost.style.left = this.initX = this.getAbsXpos();
		document.dragGost.style.top  = this.initY = this.getAbsYpos();
		document.dragGost.dragSource = this;

		this.initDX = event.x;
		this.initDY = event.y + document.body.scrollTop;

		this.setCapture();
		this.bMouseCaptured = true;
		document.bDragging = true;
		event.cancelBubble = true;
	};
	
	this.getGhostHeight = function()
	{
		return this.offsetHeight;
	};

	this.releaseMouse = function()
	{
		if(!this.bMouseCaptured)
			return;
		document.releaseCapture();
		this.bMouseCaptured = false;
		document.bDragging = false;
		
		if(this.ondrop && ( this.shiftX || this.shiftY ) ){
			window.setTimeout(this.ondrop + ";document.dragGost.style.display='none'" ,1);
		}
		else
		{
			document.dragGost.style.display = "none";
		}
	};

}

function JCResizeable()
{
	this.implementClass(JCAbsPos);
	this.implementClass(JCDragDrop);

	this.setCaptureSpot = function()
	{
		var cursorX = event.x - this.getAbsXpos();
		var cursorY = event.y + document.body.scrollTop - this.getAbsYpos();
		var sCursor = "";
		var oldSpot = this.captureSpot;
	
		this.captureSpot = 0;
		
		if( cursorY > ( this.offsetHeight - 6 ) )
		{
			sCursor += "S";
			this.captureSpot += 2;
		}
		else if(cursorY < 6 )
		{
			sCursor += "N";
			this.captureSpot += 8;
		}

		if( cursorX > (this.offsetWidth - 6) )
		{
			sCursor += "E";
			this.captureSpot += 1;
		}
		else if( cursorX < 6 ) 
		{
			sCursor += "W";
			this.captureSpot += 4;
		}

		if( this.captureSpot ==0 && cursorY < 32 )
			this.captureSpot = 16;// caption move

		
		if( oldSpot != this.captureSpot )
		{
			if( this.captureSpot )
			{
				this.style.cursor = sCursor + "-resize";
			}
			else
			{
				this.style.cursor = "";
			}
		}
	};
}

function JCHResizeable()
{
	this.implementClass(JCResizeable);
	
	this.captureSpot = 0;
	
	this.setCaptureSpot = function()
	{
		var cursorX = event.x - this.getAbsXpos();
		
		if( cursorX > (this.offsetWidth - 6) )
		{
			this.style.cursor = "E-resize";
			this.captureSpot = 1;
		}
		else
		{
			this.style.cursor = "";
			this.captureSpot = 0;
		}
	};

}


function JCResizableFrame()
{
	this.implementClass(JCResizeable);

	this.ondrop = this.sID + ".Drop()";

	this.Drop = function()
	{
		var top  = document.dragGost.offsetTop;
		var left = document.dragGost.offsetLeft;
		this.style.top  = (top>0?top:0) + "px";
		this.style.left = (left>0?left:0) + "px";
		this.style.width  = ( document.dragGost.offsetWidth > 270  ? document.dragGost.offsetWidth : 270 ) + "px";
		this.style.height = ( document.dragGost.offsetHeight > 50 ? document.dragGost.offsetHeight : 50 ) + "px";
	};
}