var JCSelector = DefineJClass( {
	
	init:function()
	{
	},

	showUI: function()
	{
		var self = this;
		this.$ = Utils.d.elementsByAttr( this, "tid" );

		for( var i=0; i<this.$._elist.length; i++ )
		{
			var tabID = this.$._elist[i];
			var tab = this.$[this.$._elist[i]];
			if( tab.getAttribute("sel") ){
				this._selected = tabID;
			}
			tab.onclick=function(e){
				self.onClickItem( this.getAttribute("tid") );
			}
		}
	},
	
	getSelectedItem: function(){
		return this._selected;
	},

	getSelectedByIndex: function(){
		if( this._selected ){
			for(var i=0;i<this.$._elist.length;i++){
				if( this.$._elist[i] == this._selected ){
					return i;
				}
			}
		}
	},
	
	selectItem: function( tid )
	{
		if( this._selected ){
			this.$[this._selected].removeAttribute("sel");
			this.$[this._selected].innerHTML = this.$[this._selected].innerHTML;
			this._selected = null;
		}
		if( this.$[tid] ){
			this._selected = tid;
			this.$[tid].setAttribute("sel",1);
			this.$[tid].innerHTML = this.$[tid].innerHTML;
		}
	},
	
	selectByIndex: function( ndx )
	{
		if(ndx<this.$._elist.length){
			this.selectItem( this.$._elist[ndx] );
		}
	},

	onClickItem:function( tid ){
		if(tid==this._selected){
			return;
		}

		this.selectItem(tid);

		var chHandler = this.getAttribute("changeHandler");
		var self = this;
		if(chHandler){
			window.setTimeout(
				function()
				{
					window[chHandler](tid, self);
				},
				1
			);
		}
	}
});


