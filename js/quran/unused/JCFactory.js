var gImageBase = "";

function InitDocObjects(rootElement, bNoRecursion)
{
	if( ! document.classManager ) {
		document.classManager = new JCFactory();
	}
	
	document.classManager.processClasses( rootElement, bNoRecursion );			
	return document.classManager;
}
/////////////////////////////
// call this function inside object constructor to use another object constructor as base class
// syntax : UseBaseClass( this, fnConstructor )
function UseBaseClass( obj, constructor )
{
	obj.constructor = constructor;// attach the constructor
	obj.constructor();// call constructor
}
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
function JCFactory_ProcessClasses( rootElement, bNoRecursion )
{
	var nCount;
	
	if( !rootElement ){
		rootElement = document.body;
	}
	

	do{
		nFoundClasses = 0;
		
		if( rootElement.mClass && !rootElement.mID )
		{
			if( this.createObject( rootElement ) )
			{
				rootElement.showUI();
				nFoundClasses ++;
			}
		}

		if(! bNoRecursion )
		{
			for( var i=0; i < rootElement.all.length; i++ )
			{//TODO: support other browsers as .all is not found in Firefox
				var currElement = rootElement.all[i];
							
				if( currElement.mClass && !currElement.mID )
				{
					if( this.createObject( currElement ) )
					{
						nFoundClasses ++;

						currElement.showUI();
					}
				}
			}
		}

		if( nFoundClasses > 0 )
		{
			////// Post classes creations
			if( rootElement.mClass )
			{
				if(rootElement.onAddToDocument)
				{
					rootElement.onAddToDocument();
					rootElement.onAddToDocument = null;
				}
			}

			if(! bNoRecursion )
			{
				for( var i=0; i < rootElement.all.length; i++ )
				{
					var currElement = rootElement.all[i];
					/////// call Post rendering notifications
					if(currElement.onAddToDocument)
					{
						currElement.onAddToDocument();
						currElement.onAddToDocument = null;
					}
				}
			}
		}		

	}while( nFoundClasses > 0 );// more classes could be found
}

/////////////////////////////
function JCFactory_CreateObject( docElement )
{
	var sConstructor = docElement.mClass;
	
	if( sConstructor && sConstructor.length )
	{
		var constructor;

		constructor = eval( docElement.mClass );// script error will happen if the constructor function is not found

		this.objects_count ++;
		
		////// Pre creation operations
		docElement.mID	= this.objects_count;
		//docElement.docElement = docElement;// TODO: remove this attribute after removing all its users
		docElement.classManager = this;

		// implement JClass base
		UseBaseClass( docElement, JClass );
	
		// implement mClass
		docElement.implementClass( constructor );
	
		return docElement;
	}

	return null;	
}
/////////////////////// Generic class, the root of all classes
function JClass()
{
		this.implementedClasses= new Array(JClass);

		this.processInnerClasses = function()
		{
			if(this.classManager){
				this.classManager.processClasses(this);
			}
		};
		
		this.sID	= this.uniqueID;//TODO: remove sID and replace it with uniqueID
		this.getTaggedChildren = JClass_getTaggedChildren	;
		this.getChildObjects = this.getChildElements = JClass_GetChildElements;
		this.getParentObject = this.getParentElement = JClass_getParentElement;
		this.getPrevSibling = JClass_getPrevSibling;
		this.getNextSibling = JClass_getNextSibling;
		this.toString = null;
		this.showUI	= JClass_ShowUI;
		
		this.implementClass = this.useBaseClass = function(constructor)
		{
			this.implementedClasses[this.implementedClasses.length] = constructor;
			this.constructor = constructor;// attach the constructor
			this.constructor();// call constructor
		};
		
		this.isClassImplemeted = function( className )
		{
			var constructor = eval(className);
			
			for( var i=0;i<this.implementedClasses.length; i++){
				if(this.implementedClasses[i] == constructor)
					return true;
			}
			return false;
		};

		// constructor could override show & hide if required
		this.show = function()
		{
			this.style.display = "block";
		};
		this.hide = function()
		{
			this.style.display = "none";
		};

}

function JClass_ShowUI()
{
	if( this.toString )
	{
		var sHTML = this.toString();
		if( sHTML && sHTML.length )
		{
			this.innerHTML = sHTML;	
			return true;
		}
	}
	return false;
}

function JClass_GetChildElements( sClassName, nMaxCount )
{// find child objects with/without specific class name
	
	var ret_elements = [];

	for( var i=0; i<this.all.length; i++ )
	{
		var childElement = this.all[i];

		if( childElement.mClass && ( !sClassName || ( sClassName.indexOf(childElement.mClass) >= 0 ) ) )
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

function JClass_getParentElement( sClassName )
{
	var parentElement = this.parentElement;
	
	while( parentElement )
	{
		if( parentElement.mClass && ( !sClassName || ( sClassName.indexOf( parentElement.mClass ) >= 0 ) ) )
			return parentElement;

		parentElement = parentElement.parentElement;
	};
	
	return null;
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

