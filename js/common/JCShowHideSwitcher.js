var JCTempPopup = DefineJClass( {
	init:function(){
		//this.org_onmousemove = this.onmousemove;
		//this.org_onmouseout = this.onmouseout;
	},

	onmouseover: function(e){
		stopTimer( "hideTimer", this );
		
		if( this.showTimer )
			return;

		if( this.mTargetElement && _E(this.mTargetElement) && ( _E(this.mTargetElement).style.display == "none") )
		{
			this.show();
		}
	},

	onmouseout: function(e){
		var event = U.ieEvent(e);
		if( !IsChildOf( event.toElement, this ) ) {
			this.hide();
		}
	},

	show:function(bNow)
	{
		if( bNow ){
			this.doShow();
			this.showTimer = null;
		}
		else
		{
			if( !this.showTimer ) {
				var self = this;
				this.showTimer = window.setTimeout( function(){
						self.show(true);
					},
					400 
				);
			}
		}
	},

	hide:function(bNow){
		stopTimer( "showTimer", this );

		if( bNow ){
			this.doHide();
			this.hideTimer = null;
			return;
		}

		if( !this.hideTimer ){
			var self = this;
			this.hideTimer = window.setTimeout(
				function(){
					self.hide(true);
				},
				1000
			);
		}
	}
} );

var JCToggler = DefineJClass(
{
	init:function(){
		DU.copyAttr( this, {mTargetElement:0,mTitleSID:0,mTitleSrc:0,mOnShow:""} );

		this.style.cursor = "default";
	},
	
	showUI:function(){
		var sTitle = "";

		var targetElement = this.targetElement();


		this.$ = DU.elementsByCID(this);
		if( this.$.bullet ) {
			//var sImageName = targetElement && ( targetElement.style.display != "none") ? "collapse_up.gif" : "expand_down.gif";
			//this.$.bullet.src = "/images/" + sImageName;
			this.$.bullet.className = "arrowBtn " + ( ( targetElement && ( targetElement.style.display != "none") ) ? "down" : "left" );

		}
	
	},

	targetElement:function()
	{
		return _E( this.mTargetElement );
	},

	onclick: function(e){
		var targetElement;
		if( targetElement = _E( this.mTargetElement ) )
		{
			if( targetElement.style.display == "none" ){
				this.doShow();
			}
			else{
				this.doHide();
			}
		}
	},

	doShow: function(){
		var targetElement;

		if( targetElement = _E( this.mTargetElement ) ){
			targetElement.style.display = "";
			if( this.$.bullet ) {
				//this.$.bullet.src = "/images/collapse_up.gif";
				this.$.bullet.className = "arrowBtn down"
			}
			
			var sExpression = this.mOnShow;
			
			if(sExpression)
			{
				window.setTimeout( function(){
						eval(sExpression);
					}, 
					1 
				);
			}
		}
	},

	doHide: function()
	{
		var targetElement;
		if( targetElement = _E( this.mTargetElement ) )
		{
			targetElement.style.display = "none";
			if( this.$.bullet ) {
				this.$.bullet.className = "arrowBtn left";
			}
		}
	}
} 
);

