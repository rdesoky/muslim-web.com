
function JCFrame()
{
	this.mTemplate = this.att("mTemplate") ? this.mTemplate : "<div style='border:solid 1px black;padding:5px'><div ContentRoot ></div></div>";
	
	this.showUI = function()
	{
		if( this.parentNode ) 
		{
			this.insertAdjacentHTML("beforeBegin",this.mTemplate);
		}

		this.templateRoot = this.previousSibling;
		//this.applyElement(this.templateRoot);
		this.contentRoot = FindChildWithAttribute( this.templateRoot, "ContentRoot" );
		
		if( this.contentRoot ) 
		{
			this.contentRoot.appendChild(this);
		}
	};
}

function JCThickFrame()
{
	this.implementClass(JCFrame);
	this.mTemplate = "<table cellspacing=0 cellpadding=0 width=100%><tr dir=LTR><td><img width=9 height=9 src=images/top_left_corner.gif></td><td style='background:silver'><img src=images/space.gif height=9></td><td><img width=9 height=9 src=images/top_right_corner.gif></td></tr><tr><td style='background:silver'><img src=images/space.gif width=9></td><td ContentRoot style='vertical-align:top;width:100%'></td><td style='background:silver'><img src=images/space.gif width=9></td></td><tr dir=LTR><td><img width=9 height=9 src=images/bottom_left_corner.gif></td><td style='background:silver'><img src=images/space.gif height=9></td><td><img width=9 height=9 src=images/bottom_right_corner.gif></td></tr></table>";
}
