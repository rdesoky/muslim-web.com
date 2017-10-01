//try{ OnLoadScriptFile("JCFactory3");}catch(e){}

var gImageBase = "images/";

//function ProcessObjectsByTagName( rootElement, sTag )
//{
//	var allElements = rootElement.getElementsByTagName(sTag);
//	alert( allElements.length );
//	for( var i=0; i < allElements.length; i++ ){
//		var currElement = allElements[i];
//		InitDocObjects(currElement,true);
//	}				
//}

var walk_the_DOM = function walk( node, func )
{
	func( node );
	node = node.firstChild;
	while( node ){
		walk( node, func );
		node = node.nextSibling;
	}
};

function getElementsByAttribute(rootNode, att, value )
{
	var results=[];
	walk_the_DOM(	rootNode, 
					function( node )
					{
						if( node.nodeType === 1 )
						{
							if( typeof( value ) == "undefined" ) 
							{
								if( node.getAttribute( att ) )
									results.push(node);
							}
							else
							{
								if( node.getAttribute( att ) == value )
									results.push(node);
							}
						}
					}
	);

	return results;
}

function FindMClasses( eRoot, sClassName, nMaxCount )
{
	var results = [];
	var allNodes = getElementsByAttribute( eRoot, "mClass" );
	
	for( var i=0,len=allNodes.length; i<len; i++ )
	{
		var node		= allNodes[i];
		var mClass		= node.getAttribute( "mClass" );
		var classPath	= "." + mClass + ".";

		if( classPath.indexOf("." + sClassName + ".") != -1 )
		{
			results.push(node);

			if(nMaxCount && results.length >= nMaxCount )
			{
				if(nMaxCount == 1){
					return results[i];
				}
				return results;
			}
		}
	}

	if( nMaxCount == 1 && results.length == 0 ){
		return null;
	}

	return results;

}


function SafeInitDocObjects(sRootElement)
{
	var rootElement = document.getElementById(sRootElement);
	if(rootElement){
		InitDocObjects(rootElement);
	}
}


function JClassInit( rootElement )
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
			JClassInit( rootElement );
		}
	}
	else if( typeof( rootElement ) == "object" && rootElement.length)
	{
		for( var i=0; i< rootElement.length; i ++ ){
			JClassInit( rootElement[i] );
		}
	}
	else
	{
		document.classManager.processClasses( rootElement );			
	}
	return document.classManager;
}

var InitDocObjects = JClassInit;

/////////////////////////////
// call this function inside object constructor to use another object constructor as base class
// syntax : UseBaseClass( this, fnConstructor )
var UseBaseClass = function ImplementClass( obj, classDef ){
	classDef.apply(obj);
};

/////////////////////////////
function JCFactory()
{
	CopyObject( this, {
		objects_count : 0,
		processClasses: JCFactory_ProcessClasses,
		createObject:	JCFactory_CreateObject
	} );
	//this.objects_count	= 0;
	//this.processClasses = JCFactory_ProcessClasses;
	//this.createObject   = JCFactory_CreateObject;
}
/////////////////////////////
function JCFactory_ProcessClasses( rootElement )
{
	var nCount = 0;
	
	if( !rootElement ){
		rootElement = document.body;
	}
	
	var allElements = getElementsByAttribute(rootElement, "mClass");

	for( var i=0, len=allElements.length; i < len; i++ )
	{
		var currElement = allElements[i];

		if( !currElement.mID )
		{// not implemented
	
			currElement.mClass = currElement.getAttribute("mClass");

			if(currElement.mMouseInit)
			{
				currElement.onmouseenter = function(){
					currElement.mMouseInit = undefined;
					//document.title = "MouseInit:" + this.tagName + ";" + document.title;
					//InitDocObjects(this,true);
					document.classManager.createObject(this);
					if(this.onAddToDocument){
						this.onAddToDocument();
						this.onAddToDocument = undefined;
					}
					this.onmouseenter = null;
					if(this.onmouseover)
						this.onmouseover();
				};
			}
			else if( this.createObject( currElement ) )
			{
				nCount ++;
				currElement.showUI();
			}
		}
	}
	
	if( nCount > 0 )
	{
		for( var i=0, len=allElements.length; i < len; i++ )
		{
			var currElement = allElements[i];
			/////// call Post rendering notifications
			if( currElement.onAddToDocument )
			{
				currElement.onAddToDocument();
				currElement.onAddToDocument = undefined;
			}
		}
	}		
}
/////////////////////////////
function JCFactory_CreateObject( docElement )
{
	var sConstructor = docElement.mClass;
	
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
		
		constructors = docElement.mClass.split(".");
		
		for( var i=0; i<constructors.length ; i++ )
		{
			classDef = eval( constructors[i] );// script error will happen if the constructor function is not found

			// implement mClass
			docElement.implementClass( classDef );
		}
	
		return docElement;
	}

	return null;	
}

function JCFreeMe()
{
	this.arFreeMe = [];

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
	this.implementedClasses= [JClass];

	this.isClassImplemented = function( className )
	{
		var classDef = eval(className);
		
		for( var i=0;i<this.implementedClasses.length; i++){
			if(this.implementedClasses[i] == classDef)
				return true;
		}
		return false;
	};

	this.implementClass = function(classDef)
	{
		if(this.isClassImplemented(classDef))
			return;

		this.implementedClasses[this.implementedClasses.length] = classDef;

		classDef.apply(this);
	};

	this.implementClass( JCFreeMe );
	this.add2FreeMe( ["implementedClasses", "sID" ]);

	this.processInnerClasses = function()
	{
		if(this.classManager){
			this.classManager.processClasses(this);
		}
	};

	this.sID = this.uniqueID;//TODO: remove sID and replace it with uniqueID
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

}

function JClass_ShowUI()
{
	if( this.toString )
	{
		var sHTML = this.toString();
		if( sHTML && sHTML.length )
		{
			setHTML( this.uniqueID, sHTML);
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

	for( var i=0; i<this.all.length; i++ )
	{
		var childElement = this.all[i];

		if( !sTagName || childElement.tagName==sTagName )
		{
			ret_elements[ret_elements.length] = this.all[i];

			if(nMaxCount && ret_elements.length == nMaxCount)
			{
				if(nMaxCount == 1){
					return this.all[i];
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
////////// utility functions
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

function CopyObject( targetObj, srcObj, bKeepExisiting )
{
	for( var item in srcObj )
	{
		if( ! bKeepExisiting || ( targetObj[item] == undefined ) )
		{
			targetObj[item] = srcObj[item];
		}
	}
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
