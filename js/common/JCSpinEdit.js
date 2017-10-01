// Following images are required: images/spin_btns.gif, images/spin_btns_up.gif, images/spin_btns_down.gif
// Following css classes are required *[mClass="JCSpinEdit"], *[mClass="JCSpinEdit"] table, *[mClass="JCSpinEdit"] table td
/////////////////////////////////////////////////////////////////////////////////

var JCSpinEdit = DefineJClass( {
		init:function(){
			this.eIndex = ++JCSpinEdit.editors;
			U.d.copyAttr( this, {mName: "sedit", min:0, max:10, inc:1, value:1 } );
			this.min = parseInt(this.min,10);
			this.max = parseInt(this.max,10);
			this.inc = parseInt(this.inc,10);
		},

		getHTML: function()
		{
			return	"<table><tr>" + 
						"<td><input cid='editor' type='text' autocomplete='off' " + " value='" + this.value + "' " + 
						" name='" + this.mName + "'/></td>" +
						"<td><map name='spinMap" + this.eIndex + "' >" + 
							"<area cid='uBtn' shape=rectangle COORDS='0,0,15,8' ><area cid=dBtn shape=rectangle COORDS='0,8,15,16'>" +
						"</map>" + 
						"<img cid='image' border='0' src='images/spin_btns.gif' style='background:silver;vertical-align:top;' usemap='#spinMap" + this.eIndex + "' /></td>" +
					"</tr></table>";
		},
		
		getValue: function(){
			return parseInt(this.$.editor.value,10);
		},
		
		getEditor: function(){
			return this.$.editor;
		},
		
		setValue: function( value ){
			this.$.editor.value = value;
		},

		onSpinUp:function(){
			var newValue = this.getValue() + this.inc;
			if(newValue <= this.max ){
				this.setValue( newValue );
			}
		},

		onSpinDown:function(){
			var newValue = this.getValue() - this.inc;
			if(newValue >= this.min ){
				this.setValue( newValue );
			}
		},

		validateValue:function(){
			var currValue  = this.getValue();
			return ( ( currValue >= this.min ) && ( currValue <= this.max ) );
		},

		scroll:function( sFunction ){
			var self = this;
			this.hTimer = window.setInterval( 
								function(){
									self[sFunction]();
								}, 
								100
							);
		},

		onAddToDocument:function()
		{
			var self = this;
			this.$ = U.d.elementsByCID( this );
			
			this.$.editor.onkeydown	= function(e)
			{
				var event = U.ieEvent(e);
				if(38 == event.keyCode)
				{// key up
					event.preventDefault();
					event.stopPropagation();
					self.onSpinUp();
				}
				else if(40 == event.keyCode) // key down
				{
					event.preventDefault();
					event.stopPropagation();
					self.onSpinDown();
				}
			};

			this.$.editor.onkeypress	= function(e){

				var event = U.ieEvent(arguments[0]);

				if( event.charCode && ( event.charCode < 48 || event.charCode > 57 ) )
				{
					event.preventDefault();
					event.stopPropagation();
				}

			};
			this.$.editor.onblur = function(e){
				var currValue = self.getValue();
				if( currValue < self.min ){
					self.setValue(self.min);
				}
				if( currValue > self.max ){
					self.setValue(self.max);
				}
			}; 


			this.$.uBtn.onclick			= function(e){
				stopTimer("hTimer", self);
				self.$.image.src = "images/spin_btns.gif";
			};

			this.$.uBtn.onmousedown		= function(e){

				if( self.disabled == true)
					return;

				self.onSpinUp();
				self.$.image.src = "images/spin_btns_up.gif";
				self.hTimer = window.setTimeout( 
									function(){
										self.scroll("onSpinUp");
									}, 
									500
								);

			};
			this.$.uBtn.onmouseout		= this.$.uBtn.onclick;

			this.$.dBtn.onclick			= this.$.uBtn.onclick;
			this.$.dBtn.onmousedown		= function(e)
			{

				if( self.disabled == true)
					return;

				self.onSpinDown();
				self.$.image.src = "images/spin_btns_down.gif";
				self.hTimer = window.setTimeout( 
									function(){
										self.scroll("onSpinDown");
									}, 
									500
								);

			};
			this.$.dBtn.onmouseout		= this.$.uBtn.onclick;
		}
	}
);

JCSpinEdit.editors = 0;

var InstallSpin = function( eText, min, max ){
	eText.setAttribute("min", min);
	eText.setAttribute("max", max);

	var lastGoodValue = eText.value;
	
	var eParent = eText.parentNode;
	var eRoot = eParent.insertBefore( document.createElement("span"), eText );
	eRoot.appendChild(eText);

	var spinImage = eRoot.appendChild( document.createElement("img") );
	var eMap = eRoot.appendChild( document.createElement("map") );
	eMap.setAttribute("name", eText.id + "_map");
	spinImage.setAttribute("usemap", "#" + eText.id + "_map");
	var upArea = eMap.appendChild( document.createElement("area") );
	var downArea = eMap.appendChild( document.createElement("area") );
	upArea.coords  ="0,0,15,8";
	downArea.coords="0,8,15,16";
	
	var startUp = function(){
		moveUp();
		stopInterval( "up" );
		intervals["up"] = setTimeout( function(){ intervals["up"] = setInterval(moveUp,100) }, 300 );;
	};

	var startDown = function(){
		moveDown();
		stopInterval( "down" );
		intervals["down"] = setTimeout( function(){ intervals["down"] = setInterval(moveDown,100) }, 300 );;
	};

	var moveUp = eText.increment = function(){
		var currVal = parseInt( eText.value, 10 );
		if(currVal<parseInt(eText.getAttribute("max"),10)){
			lastGoodValue = eText.value = ( currVal + 1 ).toString();
			return true;
		}
		return false;
	};
	var moveDown = eText.decrement = function(){
		var currVal = parseInt( eText.value, 10 );
		if(currVal>parseInt(eText.getAttribute("min"),10)){
			lastGoodValue = eText.value = ( currVal - 1 ).toString();
			return true;
		}
		return false;
	};
	
	var intervals = {
		up:0,
		down:0
	};
	var stopInterval = function( id ){
		if(intervals[id]){
			clearInterval( intervals[id]);
			intervals[id] = 0;
			spinImage.setAttribute("src", "images/spin_btns.gif" );
		}
	};
	upArea.onmousedown = function(e){
		startUp();
		spinImage.setAttribute("src", "images/spin_btns_up.gif" );
	};
	upArea.onmouseup = upArea.onmouseout = function(e){
		stopInterval( "up" );
	};

	downArea.onmousedown = function(e){
		startDown();
		spinImage.setAttribute("src", "images/spin_btns_down.gif" )
	};
	downArea.onmouseup = downArea.onmouseout = function(e){
		stopInterval( "down" );
	};
	
	DU.applyStyles(spinImage, {
		borderWidth: "0px",
		backgroundColor: "#DDDDDD",
		verticalAlign: "top"
	} );

	DU.applyStyles(eRoot, {
		display:"inline-block",
		background:"silver",
		padding:"1px",
		height:"16px",
		whiteSpace:"nowrap"
	} );

	DU.applyStyles(eText, {
		height:"16px",
		borderWidth:"0px",
		padding:"0px"
	} );

	spinImage.setAttribute("src", "images/spin_btns.gif" )
	eText.onchange = function(e){
		var max = parseInt(this.getAttribute("max"),10);
		var min = parseInt(this.getAttribute("min"),10);
		if( this.value.isNumber() ){
			if( parseInt(this.value,10) < min){
				this.value = min;
			}
			if( parseInt(this.value,10) > max ){
				this.value = max;
			}
			lastGoodValue = this.value;
		}
		else{
			this.value = lastGoodValue;
		}
	};
};
