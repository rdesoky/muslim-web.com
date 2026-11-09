var JCTabs = DefineJClass( {
	
	init:function()
	{
		this.fastSwitch = this.getAttribute("fast");
		this.pid = this.getAttribute("pid");
	},

	showUI: function()
	{
		var self = this;
		this.$ = Utils.d.elementsByAttr( this, "tid" );

		for( var i=0; i<this.$._elist.length; i++ )
		{
			var tabID = this.$._elist[i];
			var tab = this.$[tabID];
			var pid = tab.getAttribute("pid");
			if(pid){
				if( this.pid != undefined && _E(this.pid)!=undefined && _E(pid)==undefined){// create a panel
					var el = document.createElement("div");
					el.setAttribute("id", pid);
					_E(this.pid).appendChild( el );
				}
				DU.hide(pid);
			}

			tab.onclick= function(e){
				self.onClickTab( this.getAttribute("tid") );
			}

			if(this.fastSwitch){
				tab.onmouseover = tab.onclick;
			}
			
			if( tab.getAttribute("sel") ){
				this.selectTab( tabID );
			}
		}
	},

	removeTab:function(tid){
		this.unselectTab( tid );
		this.removeChild( this.$[tid] );
		this.showUI();
		if(this.$._elist.length){
			this.selectByIndex(0);
		}else{
			var onRemoveAll = this.getAttribute("onRemoveAll");
			if(onRemoveAll){
				if( typeof window[onRemoveAll] == "function" ){
					window[onRemoveAll](tid, this);
				}else{
					eval(onRemoveAll);
				}
			}
		}
	},
	
	addTab:function(sTid, sTitle, pid, changeHandler){
		var eTab = this.selectTab(sTid);
		if( eTab ){
			return eTab;
		}

		eTab = document.createElement("span");
		this.appendChild(eTab);
		eTab.setAttribute("tid", sTid);
		eTab.setAttribute("changeHandler", changeHandler);
		if( pid ){
			eTab.setAttribute("pid", pid);
		}
		this.showUI();
		this.selectTab(sTid);

		eTab.appendChild( document.createTextNode(sTitle) );
		var img = document.createElement( "img" );
		img.className = "tabRemoveBtn";
		img.setAttribute("src", "images/delete.gif");
		var self = this;
		img.onclick = function(e){
			U.ieEvent(e).stopPropagation();
			self.removeTab(sTid);
		};
		eTab.appendChild( img );
		return eTab;
	},
	
	getSelectedTab: function(){
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
		return undefined;
	},
	
	unselectTab:function( tid ){
		if( tid == undefined ){
			return;
		}
		U.d.removeClass( this.$[tid], "sel" );
		var pid = this.$[tid].getAttribute("pid");
		if(pid){
			DU.hide(pid);
		}
		if( tid == this._selected ){
			this._selected = null;
		}
	},
	
	selectTab: function( tid )
	{
		this.unselectTab( this._selected );

		if( this.$[tid] ){
			this._selected = tid;
			var pid = this.$[tid].getAttribute("pid");
			if(pid){
				DU.show(pid);
			}
			U.d.addClass( this.$[tid], "sel" );
			return this.$[tid];
		}
		return null;
	},
	
	selectByIndex: function( ndx )
	{
		if(ndx<this.$._elist.length){
			this.selectTab( this.$._elist[ndx] );
		}
	},

	onClickTab:function( tid ){
		if(tid==this._selected){
			return;
		}

		this.selectTab(tid);

		var chHandler = this.getAttribute("changeHandler");
		var self = this;
		if(chHandler){
			window.setTimeout(
				function()
				{
					if( typeof window[chHandler] == "function" ){
						window[chHandler](tid, self);
					}else{
						eval(chHandler);
					}
				},
				1
			);
		}
	}
});


