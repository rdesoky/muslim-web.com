var PageMp3Player = {
	obj:null,
	playCount:1,
	lastState:"IDLE",
	statusIcons:{
		PLAYING:"<img style='height:16px;width:16px;' src='images/equalizer4.gif'/>",
		BUFFERING:"<img style='height:18px;width:18px' src='images/wait.gif'/>"
	},
	
	init: function(){
		InstallSpin(_E("Repeat"),1,999);
		CreateVolumeBar("VolumeCtrl", {
			onClickMute:function(bMute){
				PageMp3Player.obj.sendEvent("mute", bMute?"true":"false");
			},
			onChangeVolume:function(newVol){
				PageMp3Player.obj.sendEvent("volume", newVol);
			}
		});
		//<!-- For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection. --> 
		var swfVersionStr = "8.0.0";
		//<!-- To use express install, set to playerProductInstall.swf, otherwise the empty string. -->
		var xiSwfUrlStr = 'false';//"playerProductInstall.swf";
		var flashvars = {
		};
		var params = {
			allowscriptaccess:"always"
		};
		var attributes = {
			id:"QPlayer",
			name:"QPlayer"
		};
		swfobject.embedSWF(
			"player.swf", 
			"flashContent", // element to replace
			"110", // width
			"24", // height
			swfVersionStr, 
			xiSwfUrlStr, 
			flashvars, 
			params, 
			attributes
		);

		//<!-- JavaScript enabled so display the flashContent div in case it is not replaced with a swf object. -->
		//swfobject.createCSS("#flashContent", "display:block;text-align:left;");
	},
	
	onPlayerReady:function(){
		this.obj = getFlexApp("QPlayer");
		this.obj.addModelListener("state","stateTracker");
		this.obj.addControllerListener("volume","VolumeTracker");
		this.obj.addControllerListener("mute","MuteTracker");
		_E("VolumeCtrl").setVolume(this.obj.getConfig().volume);
		_E("VolumeCtrl").setMute(this.obj.getConfig().mute);
		DU.show("AudioControls");
		DU.hide("GetFlash");
	},
	
	playQuranPart:function(partNum){
		var pInfo = QData.parts[partNum-1];
		this.playRange(1, {sura:pInfo.s, aya:pInfo.a}, {sura:pInfo.es, aya:pInfo.ea} );
	},

	playRange:function(play_res, startInfo, endInfo){
		DU.show("SyncOption");
		if(this.obj){
			this.loadRange(play_res, startInfo, endInfo);
			this.play(true);
			return true;
		}
		return false;
	},

	loadRange:function(play_res, startInfo, endInfo){
		PlayList.setRange(play_res, startInfo, endInfo);
		this.loadTrack( PlayList.getFirstTrack() );
	},
	
	loadTrack:function(url){
		this.obj.sendEvent( "load", url );
	},

	pause:function(){
		this.obj.sendEvent("play","false");
		this.setState("PAUSED");
	},
	resume:function(){
		this.obj.sendEvent("play","true");
		this.setState("PLAYING");
	},
	play:function(uiCall){
		if(!this.obj){
			return false;
		}
		if(uiCall){
			IReciters.select(PlayList.getActiveReciter());
			this.setPlayCount(1);
		}
		this.syncAudio();

		this.obj.sendEvent("play","true");
		this.showPlayCount();
		this.setState("PLAYING");
		return true;
	},

	syncAudio:function(togg){
		if(togg){
			_SA("SyncCheck","checked",_EA("SyncCheck","checked")?undefined:1);
		}
		if( _EA("SyncCheck","checked") && PlayList.list_res ){
			QViewer.gotoAya(PlayList.current.aya-1, PlayList.current.sura-1, 1);
		}
	},
	
	setPlayCount:function(count){
		this.playCount = count;
		this.showPlayCount();
	},
	showPlayCount:function(){
		_E("RepeatCounter").innerHTML = this.playCount.toString();
	},
	onTrackFinish:function(){
		var repeat = parseInt( _E("Repeat").value, 10 );
		if(!PlayList.list_res )
		{// sura mode
			if( _EA('RepeatCheck','checked') && ( _EA("EndlessLoop",'checked') || repeat > this.playCount ) )
			{// repeat current sura if repeat is active
				this.setPlayCount( this.playCount + 1);
				this.play();
				return;
			}else{
				this.setPlayCount(1);//reset counter
			}
		}
		var nextTrack = PlayList.getNextTrack();
		if( nextTrack != null ){
			this.loadTrack( nextTrack );
			this.play();
		}else{// end of list
			this.loadTrack( PlayList.getFirstTrack() );
			if( _EA('RepeatCheck','checked') && ( _EA("EndlessLoop",'checked') || repeat > this.playCount ) ){
				this.setPlayCount( this.playCount + 1 );
				this.play();
			}else{
				this.setState("IDLE");
				this.setPlayCount(1);
			}
		}
	},
	
	setState:function( state ){
		switch(state){
		case "IDLE":
			_E("BtnPlay").onclick = function(){
				PageMp3Player.loadTrack( PlayList.getFirstTrack() );
				PageMp3Player.play(true);
			};
			_E("BtnPlay").value = ">";
			_E("BtnPlay").disabled = false;
			_E("BtnStop").disabled = true;
			break;
		case "PLAYING":
		case "BUFFERING":
			_E("BtnPlay").value = "||";
			_E("BtnPlay").onclick = function(){PageMp3Player.pause();};
			_E("BtnPlay").disabled = false;
			_E("BtnStop").disabled = false;
			break;
		case "PAUSED":
			_E("BtnPlay").value = "|>";
			_E("BtnPlay").onclick = function(){PageMp3Player.resume();};
			_E("BtnPlay").disabled = false;
			_E("BtnStop").disabled = false;
			break;
		}
		this.lastState = state;
	},

	stop:function(){
		//this.setPlayCount(1);
		if(this.obj && this.lastState != "IDLE"){
			this.obj.sendEvent("stop");
			this.loadTrack( PlayList.getFirstTrack() );
		}
		this.setState("IDLE");
	}

};

var PlayList = {
	list_res: 0,//0: sura, 1: aya, 2:page
	aya_reciter:"hozefee",

	start:{
		sura:1,
		aya:1,
		page:1
	},
	end:{
		sura:114,
		aya:6,
		page:604
	},
	current:{
		sura:1,
		aya:1
	},
	
	setRange:function( list_res, startInfo, endInfo ){
		this.list_res = list_res;//0 sura, 1: aya, 2: page
		
		if( list_res ){
			DU.show("SyncOption");
			DU.hide("ReciteTillEnd");
		}else{
			DU.hide("SyncOption");
			DU.show("ReciteTillEnd");
		}

		DU.show("SyncOption");

		U.copyObject( this.start,startInfo );
		U.copyObject( this.current,startInfo );

		if(endInfo!=undefined){
			this.setEnd(endInfo);
		}else{
			U.copyObject( this.end,this.start );
		}
	},

	setEnd:function(info){
		U.copyObject( this.end,info );
	},
	
	getFirstTrack:function(){
		U.copyObject(this.current, this.start);
		return this.getCurrTrackURL();
	},
	
	getNextTrack:function(){
		while(true){
			if(this.list_res){// versebyverse
				var nextAya = QData.nextAya(this.current.sura, this.current.aya);
				if(nextAya && QData.compareVerses( nextAya, this.end ) <= 0 ){
					U.copyObject( this.current, nextAya )
				}else{
					return null;
				}
			}else{
				if( _EA("ReciteTillEndCheck","checked") ){
					if(this.current.sura < 114){
						this.current.sura ++;
					}else{
						this.current.sura=1;
					}
				}else{
					return null;
				}
			}
			var trackURL = this.getCurrTrackURL();
			if( trackURL ){
				return trackURL;
			}
		}
		return null;
	},

	getCurrTrackURL:function(){
		//TODO: check if file is missing return null
		var suraNum = this.current.sura;
		var reciterID = this.getActiveReciter();
		var url;
		if( this.list_res ){
			url = GetAudioURL( reciterID, suraNum, this.current.aya );
		}else{
			url = GetAudioURL( reciterID, suraNum );
		}
		
		return url;
	},

	getActiveReciter:function(){
		var reciterID = IReciters.activeReciter;
		if(this.list_res){
			if( RecitersInfo[reciterID].ayaAudio == undefined ){
				reciterID = this.lastAyaReciter || "hozefee";
			}else{
				this.lastAyaReciter = reciterID;//save last good reciter
			}
		}else{
			if( RecitersInfo[reciterID].suraAudio != undefined 
				&& AudioServers[RecitersInfo[reciterID].suraAudio.server].cross_domains == true )
			{
				this.lastSuraReciter = reciterID;
			}else{
				reciterID = this.lastSuraReciter;
			}
		}
		return reciterID;
	}
};

function getFlexApp(appName)
{
	if ( navigator.appName.indexOf ("Microsoft") !=-1 ){
		return window[appName];
	} 
	else{
		return document[appName];
	}
}
	
//Called by Flash Plugin 
function playerReady( obj ){
	setTimeout(
		function(){
			PageMp3Player.onPlayerReady(obj);
		},
		1 
	);
};
//called by Flash Plugin
function VolumeTracker(obj) {
	_E("VolumeCtrl").setVolume( obj.percentage );
}

function MuteTracker(obj) {
	_E("VolumeCtrl").setMute( obj.state );
}

function stateTracker(obj) {
	switch( obj.newstate ){
		case "IDLE":
		case "PLAYING":
		case "PAUSED":
			PageMp3Player.setState( obj.newstate );
			break;
		case "COMPLETED":
			setTimeout(
				function(){
					PageMp3Player.onTrackFinish();
				},
				1 
			);
			break;
	}
	_E("PlayerStatus").innerHTML = PageMp3Player.statusIcons[obj.newstate] || "";
}
