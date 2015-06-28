function ActivateJC( sID, bNoMouse )
{
	var el = document.getElementById(sID);
	if( el ){
		var hClass = el.getAttribute("hClass");
		el.onmouseover = null;
		if(hClass) {
			el.setAttribute("mClass", hClass);
			InitDocObjects( el, true );
			if(!bNoMouse && el.onmouseover){
				el.onmouseover({currentTarget:el});
			}
		}
	}
}

function DefineJClass( classDef, baseClass )
{
	var classConstructor = function()
	{
		if( baseClass ){
			baseClass.apply( this, arguments );
		}

		for( var item in classDef ){// copy elements from passed classDef
			this[item] = classDef[item];
		}

		this.destruct = function(){
			var chain = [];

			for( var currConst = classConstructor; currConst ; currConst=currConst.baseClass )
			{
				if( currConst.classDef && currConst.classDef.destroy ){
					chain.push( currConst );
				}
			}

			for( var i=chain.length-1; i >=0; i -- )
			{
				var classDef = chain[i].classDef;
				if(classDef.destroy){
					classDef.destroy.apply(this);
				}
			}
		};

		if( this["init"] != undefined ){
			this.init.apply( this, arguments );
		}
	};

	classConstructor.classDef  = classDef;
	classConstructor.baseClass = baseClass;

	return classConstructor;
}

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
	var r = rootNode || document;
	return r.querySelectorAll("[" + att + ( typeof( value ) != "undefined" ? "='" + value + "'"  : "" ) + "]");
}

function InitDocObjects(rootElement, bNoRecursion)
{
	if(typeof( rootElement ) == "string"){
		rootElement = document.getElementById(rootElement);
	}
	gCFactory.processClasses( rootElement, bNoRecursion );			
}
/////////////////////////////
// call this function inside object constructor to use another object constructor as base class
// syntax : UseBaseClass( this, fnConstructor )
function ImplementClass( obj, classDef ){
	classDef.apply(obj);
};

var UseBaseClass = ImplementClass;

/////////////////////////////
function JCFactory_ProcessClasses( rootElement, bNoRecursion )
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

			if( currElement.getAttribute("mMouseInit") )
			{
				if( currElement.onmouseover )
				{
					currElement.saved_onmouseover = currElement.onmouseover;
				}

				currElement.onmouseover = function initByMouse()
				{
					currElement.removeAttribute( "mMouseInit" );

					gCFactory.createObject( this );
					
					if( this.onAddToDocument )
					{
						this.onAddToDocument();
						delete this.onAddToDocument;
					}
					

					if( this.saved_onmouseover )
					{
						this.onmouseover = this.saved_onmouseover;
						this.saved_onmouseover = null;
						this.onmouseover();
					}
					else
					{
						this.onmouseover = null;
					}
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
		//docElement.classManager = this;


		// implement JClass base
		ImplementClass( docElement, JClass );
	
		var constructors;
		
		constructors = docElement.mClass.split(".");
		
		for( var i=0; i<constructors.length ; i++ )
		{
			classDef = window[constructors[i]];
			

			// implement mClass
			if( classDef ) {
				docElement.implementClass( classDef );
			}
		}
	
		return docElement;
	}

	return null;	
}

var gCFactory = {
	objects_count: 0,
	processClasses : JCFactory_ProcessClasses,
	createObject   : JCFactory_CreateObject
};

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

function JClass_GetChildElements( sClassName, nMaxCount )
{// find child objects with/without specific class name
	
	var ret_elements = [];
	
	var allElements = getElementsByAttribute( this, "mClass" );

	var classRef = window[sClassName];

	for( var i=0,len=allElements.length; i<len; i++ )
	{
		var childElement = allElements[i];

		if( childElement.sID && ( !sClassName || childElement.isClassRefImplemented( classRef ) ) )
		{
			ret_elements.push( childElement );

			if(nMaxCount && ret_elements.length == nMaxCount)
			{
				if(nMaxCount == 1){
					return childElement;
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

/////////////////////// Generic class, the root of all classes
var JClass = DefineJClass( {
	
	init:function()
	{
		this.implementedClasses = [JClass];
		this.implementClass( JCFreeMe );
		this.add2FreeMe( ["implementedClasses", "sID" ]);
		this.sID = this.uniqueID;//TODO: remove sID and replace it with uniqueID, IE Only
		this.toString= null;// override HTML Dom default function
	},

	extend: function( classDef, bNoOverwrite ){
		for( var item in classDef )
		{
			this[item] = classDef[item];
		}
	},

	isClassImplemented: function( className )
	{
		var classDef = eval(className);
		
		for( var i=0;i<this.implementedClasses.length; i++){
			if(this.implementedClasses[i] == classDef)
				return true;
		}
		return false;
	},

	implementClass: function(classDef)
	{
		if(this.isClassImplemented(classDef))
			return;

		this.implementedClasses[this.implementedClasses.length] = classDef;

		classDef.apply(this);
	},
	
	processInnerClasses: function()
	{
		if(this.classManager){
			this.classManager.processClasses(this);
		}
	},

	getTaggedChildren: 	function( sTagName, nMaxCount )
	{
		var ret_elements = [];
		var allTags = this.getElementsByTagName( sTagName );

		for( var i=0,len=allTags.length; i<len; i++ )
		{
			var childElement = allTags[i];

			if( !sTagName || childElement.tagName==sTagName )
			{
				ret_elements.push( childElement );

				if(nMaxCount && ret_elements.length == nMaxCount)
				{
					if(nMaxCount == 1){
						return childElement;
					}
					return ret_elements;
				}
			}
		}

		if( nMaxCount == 1 && ret_elements.length == 0 ){
			return null;
		}

		return ret_elements;
	},
	
	getChildObjects:	JClass_GetChildElements,
	getChildElements:	JClass_GetChildElements,
	getParentObject:	JClass_getParentElement,
	getParentElement:	JClass_getParentElement,

	getPrevSibling:	function JClass_getPrevSibling( sClassName ){
		var oParent = this.getParentObject();
		var oRetObject = null;
		
		if(oParent){
			var siblings = oParent.getChildObjects(sClassName);

			for( var i=1, len=siblings.length; i<len; i++ )
			{
				var sibling = siblings[i];
				if( sibling)
				{//
					return siblings[i-1];
					//for(i=i-1; i >= 0; i--)
					//{
					//	sibling = siblings[i];
					//	if( !sClassName || ( sClassName.indexOf( sibling.mClass ) >= 0 ) ){
					//		oRetObject = sibling;
					//		break;
					//	}
					//}
					//break;
				}
			}
		}
		
		return oRetObject;
	},
	
	getNextSibling:		function JClass_getNextSibling( sClassName )
	{
		var oParent = this.getParentObject();
		var oRetObject = null;
		
		if(oParent){
			var siblings = oParent.getChildObjects();

			for( var i=0,len = siblings.length - 1; i<len; i++ )
			{
				var sibling = siblings[i];
				if(sibling == this){//
					return siblings[i + 1];
					//for(i=i+1; i < siblings.length; i++){
					//	sibling = siblings[i];
					//	if( !sClassName || ( sClassName.indexOf( sibling.mClass ) >= 0 ) ){
					//		oRetObject = sibling;
					//		break;
					//	}
					//}
					//break;
				}
			}
		}
		
		return oRetObject;
	},

	showUI:function JClass_ShowUI()
	{
		var getHTML = this.toString ? "toString" : "getHTML";
		
		if( this[getHTML] )
		{
			var sHTML = this[getHTML]();
			if( sHTML && sHTML.length )
			{
				//setHTML( this.uniqueID, sHTML);
				this.innerHTML = sHTML;
				return true;
			}
		}
		
		if( this["getActiveHTML"] ){
			var self = this;
			this.innerHTML=this.getActiveHTML();
			window.setTimeout( 
				function()
				{
					InitDocObjects(self)
				}, 
				1 
			);
		}

		return false;
	},

	isClassRefImplemented: function( classRef )
	{
		for( var i=0;i<this.implementedClasses.length; i++){
			if(this.implementedClasses[i] == classRef)
				return true;
		}
		return false;
	},

	// constructor could override show & hide if required
	show: function(){
		ShowElement( this.sID );
		return true;
	},

	hide: function(){
		this.style.display = "none";
	},

	processTemplate: function( sText )
	{

		var re = /\<\!--\$\s{0,}([^\$]+)\$--\>/i;

		while( sText.match(re) ){	
			//alert(RegExp.lastMatch);
			sText = sText.replace( re, eval(RegExp.$1) );
		}


		return sText.replaceAll( "_this_", this.sID );
	}

} );



function GetParentObject( curr_element, sClassName )
{
	var parentElement = curr_element.parentNode;

	var classRef = eval(sClassName);
	
	while( parentElement )
	{
		if(		Defined(parentElement.isClassRefImplemented) 
			&& ( !sClassName || parentElement.isClassRefImplemented( classRef ) ) 
		){
			return parentElement;
		}

		parentElement = parentElement.parentNode;
	};

	return null;
}

function JClass_getParentElement( sClassName )
{
	return GetParentObject( this, sClassName );
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


function SafeInitDocObjects(sRootElement, bNoRecursion)
{
	var rootElement = document.getElementById(sRootElement);
	if(rootElement){
		InitDocObjects(rootElement,bNoRecursion);
	}
}
