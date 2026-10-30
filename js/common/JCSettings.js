
var JCSettings = CK = {

	keys:{
		temp:"tms",
		fixed:"fxs"
	},

	loadGroup:function( key ){
		this[key] = {};
		var settings = getCookie( key, "" );
		var sa = settings.split("$");
		for( var i=0; i<sa.length; i++ ){
			var item = sa[i].split(":");
			this[key][item[0]] = unescape(item[1]);
		}
	},

	saveGroup:function(key, fixed){
		var settings = "";
		var expires = "";
		
		for( var item in this[key] ){
			if( item.length && this[key][item] != undefined ) {
				if( settings.length ){
					settings += "$";
				}
				settings += item + ":" + escape(this[key][item]);
			}
		}

		if(fixed){
			var fiveYears = new Date( (new Date()).getTime() + 1000 * 60 * 60 * 24 * 365 * 5 );
			expires = "; expires=" + fiveYears.toGMTString();
		}
		
		document.cookie = key + "=" + settings + "; path=/;" + expires;
	},
	
	remove:function( list, fixed ){
		var key = fixed ? this.keys.fixed : this.keys.temp;
		if( this[key] == undefined){
			this.loadGroup( key );
		}
		var names = list.split(",");
		for( var i=0; i<names.length; i++ ){
			var name = names[i];
			if(this[key][name]!= undefined){
				this[key][name] = "";
			}
		}
		this.saveGroup( key, fixed );
	},

	set:function( name, value, fixed ){
		var key = fixed ? this.keys.fixed : this.keys.temp;

		if( this[key] == undefined){
			this.loadGroup( key );
		}

		this[key][name] = value;
		this.saveGroup( key, fixed );
	},

	get:function( name, def_value ){

		for( var k in this.keys ){
			var key = this.keys[k];
			
			if( this[key] == undefined ){
				this.loadGroup( key );
			}
		
			if( this[key][name] != undefined ){
				return this[key][name];
			}
		}
		
		return def_value;
	}
};