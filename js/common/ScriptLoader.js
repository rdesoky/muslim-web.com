var ScriptLoader = {

	PENDING:	0,
	LOADED:		1,
	packages: {},
	definitionFiles: {},
	loadedPackages: {},
	loadedScripts: {},
	
	addDefinitions: function AddDifinitions( defCollection ){
		for( var defName in defCollection )
		{
			this.definitionFiles[ defName ] = defCollection[defName];
		}
	},
	
	loadScripts:function( defCollection, onFinish )
	{
		this.addDefinitions(defCollection);
		var defArray=[];
		for(var def in defCollection ){
			defArray.push(def);
		}
		return this.loadNewPackage(defArray, onFinish);
	},
	
	loadNewPackage: function( defsArray, onFinish ){
		this.packages["unnamed"] = defsArray;
		this.loadedPackages["unnamed"] = undefined;
		return this.loadPackage( "unnamed", onFinish );
	},

	loadPackage: function LoadScriptPackage( packageName, onFinish )
	{
		if(		typeof this.packages[packageName] != "object" 
			||	this.packages[packageName].length == 0	
		  )
			return ScriptLoader.LOADED;//	no package defined
			
		if(	undefined == this.loadedPackages[packageName]	)
		{//	create the loading thread
			this.loadedPackages[packageName] = { 
				state: ScriptLoader.PENDING,
				index: 0,
				total: this.packages[packageName].length
			};

			// start loading	
			this.loadNextScript(packageName, onFinish);
		}

		return this.loadedPackages[packageName].state;
	},

	loadNextScript: function LoadNextScript( packageName, onFinish )
	{
		var	index =	this.loadedPackages[packageName].index;
		var	definitionName	= this.packages[packageName][ index	];
		var	scriptName		= this.definitionFiles[definitionName];
		var self = this;
		
		this.loadJScript( scriptName, 
			function onLoadNextScript()
			{
				// increment the script	index
				self.loadedPackages[packageName].index ++;

				self.setProgress( self.loadedPackages[packageName].index, self.loadedPackages[packageName].total );

				if(	self.loadedPackages[packageName].index >=	self.loadedPackages[packageName].total )
				{//	last script	has	been loaded
					self.loadedPackages[packageName].state = ScriptLoader.LOADED;
					window.setTimeout( onFinish, 1);
				}
				else
				{//	more scripts 
					self.loadNextScript(	packageName, onFinish );
				}
			},
			definitionName
		);
	},


	loadJScript: function LoadJScript( scriptName, onFinish, sExpression ) 
	{
		var self = this;
		if(	this.loadedScripts[scriptName] != undefined )
		{//	script is loaded or	pending

			if( onFinish != undefined )
			{
				if(	this.loadedScripts[scriptName]	== ScriptLoader.LOADED )
				{
					window.setTimeout(onFinish, 1);
				}
				//TODO:	manage list	of script loading completion listners to be	called
				
			}
			return this.loadedScripts[scriptName];
		}
	

		this.loadedScripts[scriptName]	= ScriptLoader.PENDING;
		
		if(	sExpression	!= undefined )
		{//	check if the script	is already loaded by other means
			var	bExpFound =	eval( "typeof "	+ sExpression +	" != 'undefined';" );
			if(bExpFound)
			{
				this.loadedScripts[scriptName]	= ScriptLoader.LOADED;
				window.setTimeout(onFinish,1);
				return ScriptLoader.LOADED;
			}
		}
		
		var	newScript =	document.createElement("script");
	
		newScript.type=	( scriptName.search(/\.vbs$/i) > 0 ) ? "text/vbscript" : "text/javascript";
		newScript.src =	scriptName;
		
		document.getElementsByTagName("head")[0].appendChild( newScript );
		
		if( sExpression == undefined )
		{
			this.loadedScripts[scriptName]	= ScriptLoader.LOADED;
			if( onFinish != undefined ){
				window.setTimeout( onFinish, 1 );
			}
			return;
		}
		var tCount = 0;
		var maxCount = 400;
		window.setTimeout(	
			function CheckNewScript() 
			{
				tCount ++;
				var	bExpFound =	eval( "typeof "	+ sExpression +	" != 'undefined'" );
				if(	bExpFound || tCount > 5000)
				{
					self.loadedScripts[scriptName]	= ScriptLoader.LOADED;
					window.setTimeout(onFinish,1);
				}
				else
				{//TODO: check timeout
					if(tCount >= maxCount){
						alert("couldn't load :" + scriptName);
					}else{
						window.setTimeout(CheckNewScript, 50);
					}
				}
			},
			4
		);
		
	},

	setProgress: function( step, total )
	{
		var progValue, propBar;
		var nProgress = step * 100/total;

		if( progValue = document.getElementById( "ProgressValue" ) ){
			progValue.innerHTML = Math.floor( nProgress );
		}
		if( progBar = document.getElementById( "ProgressBar" ) ){
			progBar.style.width = nProgress + "%";
		}
	}

	
}

