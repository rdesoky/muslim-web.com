
var Mp3Player = {
	reciterID:"Hudhaify_32kbps",
	suraNum:0,
	ayaNum:0,

	init:function( sID ){
		var self=this;

		window.playerReady=function(obj){
			self.onPlayerReady();
		};

		swfobject.embedSWF(
			"player.swf", 
			sID, // element to replace
			"160", // width
			"19", // height
			"8.0.0", 
			"false", 
			{skin:"simple.swf"}, //flashvars
			{allowscriptaccess:"always"}, //params
			{id:"QPlayer",name:"QPlayer"}//attributes
		);
	},

	onPlayerReady:function(){
		if ( navigator.appName.indexOf ("Microsoft") != -1 ){
			this.obj = window["QPlayer"];
		} 
		else{
			this.obj = document["QPlayer"];
		}
	},
	
	getURL:function(suraNum, ayaNum, reciterID){
		var url = "http://www.everyayah.com/data/{rkey}/{sura}{aya}.mp3";
		url = url.replace ("{rkey}", reciterID );
		url = url.replace ("{sura}", suraNum.toStringEx(3) );
		url = url.replace ("{aya}", ayaNum.toStringEx(3) );
		return url;
	},
	
	load:function(suraNum, ayaNum){
		if(Defined(suraNum)){
			this.suraNum = suraNum;
		}
		if(Defined(ayaNum)){
			this.ayaNum = ayaNum;
		}
		if(this.obj){
			//document.title = "s:" + this.suraNum + ",a:" + this.ayaNum;
			var url = this.getURL(this.suraNum, this.ayaNum,this.reciterID);
			//alert(url);
			this.obj.sendEvent("load", url);
		}
	},
	
	show:function(bPlay){
		if( this.obj && this.suraNum && this.ayaNum ){
			DU.show("AudioPlayer");
			if(bPlay){
				this.play();
			}
		}
	},
	hide:function(bStop){
		if(bStop){
			this.stop();
		}
		DU.hide("AudioPlayer");
	},

	stop:function(){
		if( this.obj ){
			this.obj.sendEvent("play", "false");
		}
	},
	
	setAya:function(suraNum,ayaNum){
		this.suraNum = suraNum;
		this.ayaNum = ayaNum;
	},

	play:function(){
		if( this.obj && this.suraNum && this.ayaNum ){
			this.load( this.suraNum, this.ayaNum );
			this.obj.sendEvent("play", "true");
		}
	}
};
