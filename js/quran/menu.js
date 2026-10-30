
function createMenu(items, sID)
{
	if( sID && _E(sID) ){
		return _E(sID);
	}

	var menu = document.createElement("div");
	
	if(sID){
		menu.id = sID;
	}

	U.extend( menu, {
			className: "aMenu",
			attach: function( parentNode, position, mousePos ){

				stopTimer("hDetatch", menu );

				if( parentNode && parentNode.menu ){
					parentNode.menu.detach();
				}
				
				parentNode.appendChild(this);
				parentNode.menu = this;
				var anchor = mousePos||parentNode;
				switch(position){
					case "sub":
						this.style.left = ( anchor.offsetLeft - (this.offsetWidth/2) ) + "px";
						this.style.top  = (anchor.offsetTop + anchor.offsetHeight - 2).toString() + "px";
						break;
					case "side":
						this.style.left = ( anchor.offsetLeft + ( (gLang=="ar") ? -this.offsetWidth : anchor.offsetWidth ) ) + "px";
						this.style.top =  ( anchor.offsetTop).toString() + "px";
						break;
					case "flow":
						this.style.left = this.style.top =  "";
						break;
					case "mouse":
						this.style.position = "fixed";
						this.style.left =( mousePos.x - this.offsetWidth * ( (gLang=="ar") ? 1 : 0 ) - 6 * ( (gLang=="ar") ? -1 : 1 ) ).toString() + "px";
						this.style.top = ( mousePos.y - 6 ).toString() + "px";
						break;
				}
			},
			
			delayedDetach: function(delay){
				if(this.hDetach){
					return;
				}
				var self = this;
				delay = delay || 750 ;
				this.hDetach = window.setTimeout(
					function(){
						self.hDetach = null;
						self.detach();
					}, 
					delay 
				);
			},
			
			detach: function(){
				var menuHost = this.parentNode;
				if( menuHost ){
					if(menuHost.menu == this){
						menuHost.menu = null;
						menuHost.removeChild(this);
						return menuHost;
					}
				}
			},

			detachAll: function(){
				var menuHost = this.detach();
				while( menuHost ){
					if( menuHost["detachAll"] != undefined ){
						menuHost = menuHost.detachAll();
					}else{
						menuHost = menuHost.parentNode;
					}
				}
			},

			onmouseover:function(){
				stopTimer("hDetach", this);
			},

			onmouseout:function(e){
				var event = U.ieEvent(e);
				if( !IsChildOf( event.toElement, this ) ) {
					this.delayedDetach();
				}
			},

			hilightItem:function(item){
				if(this.activeItem){
					if(item == this.activeItem){
						return;
					}
					DU.removeClass( this.activeItem, "mhover" );
					if( this.activeItem.subMenu ){
						this.activeItem.subMenu.detach();
					}
				}
				this.activeItem = item;
				DU.addClass( item, "mhover" );
				if(item.subMenu){
					item.subMenu.attach(this, item.subMenuPos, item);
				}

			}
			
		} 
	);
	
	function createMenuItem( data, rootMenu )
	{
		var el = document.createElement("div");
		el.className = "menuItem" + ( data.menu ? " subMenu" : "" );
		el.innerHTML = data.label;
		//sMenu.innerHTML = "<div class='menuItem" +  ( data.menu ? " subMenu" : "" ) + "'>" + data.label + "</div>";

		U.extend( el, 
			{
				onclick: function(e){
					var event = U.ieEvent(e);
					event.stopPropagation();
					var context = data.context || window;
					if(data.handler && context[data.handler]){
						context[ data.handler ](this);
					}
					rootMenu.detachAll();
				},

				getData: function(){
					return data;
				},

				getContextSura:function(){
					if(data.sura){
						return data.sura;
					}
					if(data.info && data.info.sura){
						return data.info.sura;
					}
					return gSuraNo;
				},
				
				getContextAya: function(){
					if(data.aya){
						return data.aya;
					}
					if(data.info && data.info.aya){
						return data.info.aya;
					}
					var parentNode = this.parentNode;
					while( parentNode ){
						var aya = parentNode.getAttribute("aya");
						if(aya){
							return aya;
						};
						parentNode = parentNode.parentNode;
					}
					return "1";
				}
			}
		);
		return el;
	};
	
	for( var i=0; i<items.length; i++ ){
		var mItem = createMenuItem(items[i], menu);
		
		menu.appendChild( mItem );

		mItem.onmouseover = function(e){
			menu.hilightItem( this );
		};

		if( items[i].menu ){
			mItem.subMenu = createMenu( items[i].menu );
			mItem.subMenuPos = items[i].menuPos;
		}
	}
	
	return menu;
}

var CopyWindow;

function copyTextRange(suraNum, start_aya, end_aya)
{
	LoadData( CGIBase + "get_sura_text.pl?s=" + (suraNum-1).toString() + 
				"&f=" + start_aya + "&t=" + end_aya, 
				"confirmCopy(gDataResponse)", 
				true);
}
function confirmCopy(text){
	var copyTextForm = confirmCopy.copyTextForm = confirmCopy.copyTextForm || _E("CopyText");
	var copyTextArea = confirmCopy.copyTextArea = confirmCopy.copyTextArea || _E("CopyTextArea");
	copyTextArea.value = text;
	UI.openPopup("confirmCopy", copyTextForm,_S.copy_selected);
}
function doCopyText(){
	var copyTextArea = _E("CopyTextArea");
	var docRange = document.createRange();
	docRange.selectNode(copyTextArea);
	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(docRange);
	var success=document.execCommand('copy');
	if(success){
		selection.removeAllRanges();
		UI.closePopup("confirmCopy");
	}
}


