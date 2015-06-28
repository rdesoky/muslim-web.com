function JCShowHideSwitcher()
{
	//if(!window.SHSetting){
	//	window.SHSetting = [];
	//	window.SHSetting[this.m_target_element] = 1;
	//}

	this.style.cursor = "hand";

	if( this.m_title_sid ){
		this.mTitleText = getString( this.m_title_sid, this.m_title_src ? this.m_title_src : null );
	}

	this.innerContents = this.innerHTML;

	this.toString = function(){
		var sTitle = "";
		if(this.mTitleText){
			sTitle="&nbsp;" + this.mTitleText;
		}

		var targetElement = this.targetElement();

		var sImageName = targetElement && ( targetElement.style.display != "none") ? "collapse_up.gif" : "expand_down.gif";

		return "<img src=/images/" + sImageName + " id=" + this.sID + "Btn style='cursor:hand' >" + sTitle + this.innerContents;
	};

	this.onAddToDocument = function(){
		//if(window.SHSetting[this.m_target_element]==0){
		//	this.doHide();
		//}else if(window.SHSetting[this.m_target_element]==1){
		//	this.doShow();
		//}
	};

	this.targetElement=function()
	{
		return document.getElementById( this.m_target_element );
	};

	this.onclick = function(){
		var targetElement;
		if( targetElement = document.getElementById( this.m_target_element ) )
		{
			if(targetElement.style.display == "none" ){
				this.doShow();
			}
			else{
				this.doHide();
			}
		}
	};

	this.doShow = function(){
		var targetElement;

		if( targetElement = document.getElementById( this.m_target_element ) ){
			targetElement.style.display = "";
			eval( this.sID + "Btn.src='/images/collapse_up.gif'" );
			if(this.mOnShow){
				window.setTimeout(this.mOnShow, 1);
			}
			//window.SHSetting[this.m_target_element] = 1;
		}
	};
	this.doHide = function(){
		var targetElement;
		if( targetElement = document.getElementById( this.m_target_element ) )
		{
			targetElement.style.display = "none";
			eval( this.sID + "Btn.src='/images/expand_down.gif'" );
			//window.SHSetting[this.m_target_element] = 0;
		}
	};
}
