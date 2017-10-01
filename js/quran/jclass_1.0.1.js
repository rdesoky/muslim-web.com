//try{ OnLoadScriptFile("JCFactory3");}catch(e){}


var gImageBase = "images/";


function FindMClasses( eRoot, sClassName, nMaxCount )
{
	var ret_elements = [];
	
	//var allElements = this.all;
	var allElements = eRoot.getElementsByTagName("*");

	for( var i=0; i<allElements.length; i++ )
	{
		var childElement = allElements[i];
		var mClass;
		if( mClass = childElement.getAttribute("mClass") )
		{
			var classPath = "." + mClass + ".";
			if( classPath.indexOf("." + sClassName + ".") != -1 )
			{
				ret_elements[ret_elements.length] = allElements[i];

				if(nMaxCount && ret_elements.length == nMaxCount)
				{
					if(nMaxCount == 1){
						return allElements[i];
					}
					return ret_elements;
				}
			}
		}
	}

	if( nMaxCount == 1 && ret_elements.length == 0 ){
		return null;
	}

	return ret_elements;
}

function SafeInitDocObjects(sRootElement, bRecursive )
{
	var rootElement = document.getElementById(sRootElement);
	if(rootElement){
		InitDocObjects( rootElement, bRecursive );
	}
}

function JClassInit( rootElement, bRecursive )
{
	if( !document.crossBrowser ) {
		SetupCrossBrowser();
	}

	if( ! document.classManager ) {
		document.classManager = new JCFactory();
	}

	if( typeof(rootElement) == "string" )
	{
		rootElement = document.getElementById(rootElement);
		if(rootElement){
			JClassInit( rootElement, bRecursive );
		}
	}
	else if( typeof( rootElement ) == "object" && rootElement.length)
	{
		for( var i=0; i< rootElement.length; i ++ ){
			JClassInit( rootElement[i], bRecursive );
		}
	}
	else
	{
		document.classManager.processClasses( rootElement, bRecursive );			
	}
	return document.classManager;
}

var InitDocObjects = JClassInit;

/////////////////////////////
// call this function inside object constructor to use another object constructor as base class
// syntax : UseBaseClass( this, fnConstructor )
function ImplementClass( obj, constructor ){
	obj.jconst = constructor;// attach the constructor
	obj.jconst();// call constructor
};

/////////////////////////////
function JCFactory( bProcessBody )
{
	this.objects_count	= 0;
	this.processClasses = JCFactory_ProcessClasses;
	this.createObject   = JCFactory_CreateObject;
	
	//TODO: remove the following method 
	if(bProcessBody){
		document.classManager = this;
		this.processClasses();
	}

	return this;
}
/////////////////////////////
function JCFactory_ProcessClasses( rootElement, bRecursive )
{
	//htmlAlert("S:ProcessClasses(" + ( rootElement ? rootElement.id : "body" )+ ")");

	if( !Defined( bRecursive ) )
	{
		bRecursive = true;
	}

	var nCount;
	
	if( !rootElement ){
		rootElement = document.body;
	}
	

	//do{
		nFoundClasses = 0;
		
		if( rootElement.getAttribute("mClass") && !rootElement.mID )
		{
			if( this.createObject( rootElement ) )
			{
				rootElement.showUI();
				nFoundClasses ++;
			}
		}

		if( bRecursive )
		{
			//var nStartProcessingObjects = ( new Date() ).getTime() ;

			var allElements = rootElement.getElementsByTagName("*");
			//var allElements = rootElement.all;

			for( var i=0; i < allElements.length; i++ )
			{//TODO: support other browsers as .all is not found in Firefox
				var currElement = allElements[i];
							
				if( currElement.getAttribute("mClass") && !currElement.mID )
				{
					if(currElement.mMouseInit)
					{
						currElement.onmouseenter = function(){
							currElement.mMouseInit=null;
							//document.title = "MouseInit:" + this.tagName + ";" + document.title;
							InitDocObjects(this,false);
							this.onmouseenter = null;
							if(this.onmouseover)
								this.onmouseover();
						};
					}
					else if( this.createObject( currElement ) )
					{
						nFoundClasses ++;

						currElement.showUI();
					}
				}
			}
			
			//htmlAlert( "Processing " + allElements.length + " Nodes: " +  ( ( new Date() ).getTime()  - nStartProcessingObjects ).toString() + 
			//			" ms, found:" + nFoundClasses + " objects" );
		}

		if( nFoundClasses > 0 )
		{
			//var nStartPostCreation = ( new Date() ).getTime() ;

			////// Post classes creations
			if( rootElement.mClass )
			{
				if(rootElement.onAddToDocument)
				{
					rootElement.onAddToDocument();
					rootElement.removeAttribute("onAddToDocument");
				}
			}

			if( bRecursive )
			{
				var allElements = rootElement.getElementsByTagName("*");
				//var allElements = rootElement.all;
				for( var i=0; i < allElements.length; i++ )
				{
					var currElement = allElements[i];
					/////// call Post rendering notifications
					if(currElement.onAddToDocument)
					{
						currElement.onAddToDocument();
						currElement.onAddToDocument = null;
					}
				}

				//htmlAlert( "Processing onAddToDocument(): " +  ( ( new Date() ).getTime()  - nStartPostCreation ).toString() + " ms" ) ;
			}

		}		

	//htmlAlert("*E:ProcessClasses(" + ( rootElement ? rootElement.id : "body" )+ ")");

	//}while( nFoundClasses > 0 );// more classes could be found
}

/////////////////////////////
function JCFactory_CreateObject( docElement )
{
	var sConstructor = docElement.getAttribute("mClass");
	
	if( sConstructor && sConstructor.length )
	{
		this.objects_count ++;
		
		////// Pre creation operations
		docElement.mID	= this.objects_count;
		//docElement.docElement = docElement;// TODO: remove this attribute after removing all its users
		docElement.classManager = this;

		// implement JClass base
		ImplementClass( docElement, JClass );
	
		var constructors;
		
		constructors = sConstructor.split(".");
		
		for( var i=0; i<constructors.length ; i++ )
		{
			constructor = eval( constructors[i] );// script error will happen if the constructor function is not found

			// implement mClass
			docElement.implementClass( constructor );
		}
	
		return docElement;
	}

	return null;	
}

function JCFreeMe()
{
	this.arFreeMe = new Array();

	this.add2FreeMe = function( arFreeMe )
	{
		for(var i=0; i < arFreeMe.length; i++ )
		{
			this.arFreeMe[this.arFreeMe.length] = arFreeMe[i];
		}
	};

	this.cleanupMemory = function()
	{
		//if(!this.arFreeMe)
		//	return;

		for(var i=0; i < this.arFreeMe.length; i++ )
		{
			var item_name = this.arFreeMe[i];
		
			if(item_name == "arFreeMe")
				continue;

			var oItem = this[item_name];

			if(	oItem 
				//&& typeof(oItem) == "object" 
				&& Defined( oItem.cleanupMemory ) 
				&& !Defined( oItem.uniqueID ) ) // not a DOM object
			{
				oItem.cleanupMemory();
			}
			
			this[item_name] = null;
			//if( Defined(this[item_name]))
			//	delete this[item_name];
		}

		this.arFreeMe = null;
	};
};

/////////////////////// Generic class, the root of all classes
function JClass()
{
	if( !this.mClass )
	{

		this.mClass = this.getAttribute("mClass");
		
		var attrs = this.attributes;

		for( var i=0; i<attrs.length; i++ )
		{
			if( ( attrs[i].name != "mclass" ) && !Defined( this[attrs[i].name] ) )
			{
				this[attrs[i].name] = attrs[i].value;
			}
		}
	}
 
	this.implementedClasses= new Array(JClass);

	this.setHTML = function( sHTML, bProcessClasses )
	{
		var all = this.getElementsByTagName("*");

		for(var i=0;i<all.length;i++){
			if( all[i].cleanupMemory ){
				all[i].cleanupMemory();
			}
		}

		this.innerHTML = sHTML;

		if(bProcessClasses){
			this.processInnerClasses();
		}
	};

	this.isClassImplemented = function( className )
	{
		var constructor = eval(className);
		
		for( var i=0;i<this.implementedClasses.length; i++){
			if(this.implementedClasses[i] == constructor)
				return true;
		}
		return false;
	};

	this.implementClass = function(constructor)
	{
		if(this.isClassImplemented(constructor))
			return;
		this.implementedClasses[this.implementedClasses.length] = constructor;
		this.jconst = constructor;// attach the constructor
		this.jconst();// call constructor
	};

	this.implementClass( JCFreeMe );
	this.add2FreeMe(new Array("implementedClasses", "sID"));

	this.processInnerClasses = function()
	{
		if(this.classManager){
			this.classManager.processClasses(this);
		}
	};

	this.sID = this.uniqueID ? this.uniqueID : this.uniqueID = ( this.id ? this.id : this.id = "mclass_" + this.mID );
	this.getTaggedChildren = JClass_getTaggedChildren	;
	this.getChildObjects = this.getChildElements = JClass_GetChildElements;
	this.getParentObject = this.getParentElement = JClass_getParentElement;
	this.getPrevSibling = JClass_getPrevSibling;
	this.getNextSibling = JClass_getNextSibling;
	this.toString = null;
	this.showUI	= JClass_ShowUI;

	this.isClassRefImplemented = function( classRef )
	{
		for( var i=0;i<this.implementedClasses.length; i++){
			if(this.implementedClasses[i] == classRef)
				return true;
		}
		return false;
	};

	// constructor could override show & hide if required
	this.show = function()
	{
		ShowElement( this.sID );
		return true;
	};
	this.hide = function()
	{
		this.style.display = "none";
	};

	this.processTemplate = function( sText )
	{

		var re = /\<\!--\$\s{0,}([^\$]+)\$--\>/i;

		while( sText.match(re) ){	
			//alert(RegExp.lastMatch);
			sText = sText.replace( re, eval(RegExp.$1) );
		}


		return sText.replaceAll( "_this_", this.sID );
	};

	this.att = function( name )
	{
		return Defined( this[name] ) ? this[name] : ( this[name] = this.getAttribute( name ) ) ;
	};

}

function JClass_ShowUI()
{
	if( this.toString )
	{
		var sHTML = this.toString();
		if( sHTML && sHTML.length )
		{
			this.setHTML( sHTML );
			return true;
		}
	}
	return false;
}

function JClass_GetChildElements( sClassName, nMaxCount )
{// find child objects with/without specific class name
	
	var ret_elements = [];
	
	//var allElements = this.all;
	var allElements = this.getElementsByTagName("*");
	var classRef = eval( sClassName );

	for( var i=0; i<allElements.length; i++ )
	{
		var childElement = allElements[i];

		if( childElement.sID && ( !sClassName || childElement.isClassRefImplemented( classRef ) ) )
		{
			ret_elements[ret_elements.length] = allElements[i];

			if(nMaxCount && ret_elements.length == nMaxCount)
			{
				if(nMaxCount == 1){
					return allElements[i];
				}
				return ret_elements;
			}
		}
	}

	if( nMaxCount == 1 && ret_elements.length == 0 ){
		return null;
	}

	return ret_elements;
}


function GetParentObject( curr_element, sClassName )
{
	var parentElement = curr_element.parentElement;

	var classRef = eval(sClassName);
	
	while( parentElement )
	{
		if( Defined(parentElement.isClassRefImplemented) && ( !sClassName || parentElement.isClassRefImplemented( classRef ) ) )
			return parentElement;

		parentElement = parentElement.parentElement;
	};

	return null;
}

function JClass_getParentElement( sClassName )
{
	return GetParentObject( this, sClassName );
}

function JClass_getTaggedChildren( sTagName, nMaxCount )
{
	var ret_elements = [];

	var all = this.getElementsByTagName("*");

	for( var i=0; i< all.length; i++ )
	{
		var childElement = all[i];

		if( !sTagName || childElement.tagName==sTagName )
		{
			ret_elements[ret_elements.length] = all[i];

			if(nMaxCount && ret_elements.length == nMaxCount)
			{
				if(nMaxCount == 1){
					return all[i];
				}
				return ret_elements;
			}
		}
	}

	if( nMaxCount == 1 && ret_elements.length == 0 ){
		return null;
	}

	return ret_elements;
}

function JClass_getNextSibling( sClassName )
{
	var oParent = this.getParentObject();
	var oRetObject = null;
	
	if(oParent){
		var siblings = oParent.getChildObjects();

		for( var i=0; i < siblings.length; i++ )
		{
			var sibling = siblings[i];
			if(sibling == this){//
				for(i=i+1; i < siblings.length; i++){
					sibling = siblings[i];
					if( !sClassName || ( sClassName.indexOf( sibling.mClass ) >= 0 ) ){
						oRetObject = sibling;
						break;
					}
				}
				break;
			}
		}
	}
	
	return oRetObject;
}

function JClass_getPrevSibling( sClassName )
{
	var oParent = this.getParentObject();
	var oRetObject = null;
	
	if(oParent){
		var siblings = oParent.getChildObjects(sClassName);

		for( var i=0; i < siblings.length; i++ )
		{
			var sibling = siblings[i];
			if(sibling == this){//
				for(i=i-1; i >= 0; i--){
					sibling = siblings[i];
					if( !sClassName || ( sClassName.indexOf( sibling.mClass ) >= 0 ) ){
						oRetObject = sibling;
						break;
					}
				}
				break;
			}
		}
	}
	
	return oRetObject;
}

function setHTML( docElement ,sHTML, bProcessClasses )
{
	if( typeof ( docElement ) == "string" )
		docElement = DocElement( docElement );
	
	if( docElement )
	{
		var all = docElement.getElementsByTagName("*");

		for(var i=0;i<all.length;i++){
			if( all[i].cleanupMemory ){
				all[i].cleanupMemory();
			}
		}

		docElement.innerHTML = sHTML;

		if(bProcessClasses){
			InitDocObjects(docElement);
		}
	}
}

function DocElement( sID )
{
	return document.getElementById( sID );
}

function Defined( an_object )
{
	return ( typeof(an_object) != "undefined" )
}

function SetupCrossBrowser()
{
	document.crossBrowser = true;

	if( typeof HTMLElement!="undefined" && !HTMLElement.prototype.insertAdjacentElement )
	{
		HTMLElement.prototype.insertAdjacentElement = function (where,parsedNode)
		{
			switch (where)
			{
			case 'beforeBegin':
				this.parentNode.insertBefore(parsedNode,this);
				break;
			case 'afterBegin':
				this.insertBefore(parsedNode,this.firstChild);
				break;
			case 'beforeEnd':
				this.appendChild(parsedNode);
				break;
			case 'afterEnd':
				if (this.nextSibling) 
					this.parentNode.insertBefore(parsedNode,this.nextSibling);
				else 
					this.parentNode.appendChild(parsedNode);
				break;
			}
		};

		HTMLElement.prototype.insertAdjacentHTML = function(where,htmlStr)
		{
			var r = this.ownerDocument.createRange();
			r.setStartBefore(this);
			var parsedHTML = r.createContextualFragment(htmlStr);
			this.insertAdjacentElement(where,parsedHTML);
		};


		HTMLElement.prototype.insertAdjacentText = function(where,txtStr)
		{
			var parsedText = document.createTextNode(txtStr);
			this.insertAdjacentElement(where,parsedText);
		};
	}
}

function FindChildWithAttribute(docElement, attrName, nParent )
{
	if(nParent)
	{
		while(nParent){
			docElement = thisElement.parentNode;
			nParent --;
		}
	}
	
	var all = docElement.getElementsByTagName("*");

	for(var i=0;i<all.length;i++)
	{
		var eChild = all[i];
		var attrValue = eChild.getAttribute(attrName);
		if( attrValue != null )
			return eChild;
	}
}


//function ProcessObjectsByTagName( rootElement, sTag )
//{
//	var allElements = rootElement.getElementsByTagName(sTag);
//	alert( allElements.length );
//	for( var i=0; i < allElements.length; i++ ){
//		var currElement = allElements[i];
//		InitDocObjects(currElement,true);
//	}				
//}

