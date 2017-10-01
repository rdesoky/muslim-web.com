
var	google_ad_client = "pub-0784395403030784";
var	google_alternate_ad_url = "";
//var google_ad_width = 160;
//var google_ad_height = 600;
//var	google_ad_format = "160x600_as";
var google_ad_width = 160;
var google_ad_height = 600;
var	google_ad_format = "160x600_as";
var	google_ad_type = "text";
var	google_color_border = "F2F5E6";//"BACCA6";
var	google_color_bg = "F2F5E6";
var	google_color_link = "000080";
var	google_color_url = "008000";
var	google_color_text = "000000";
var	google_ad_channel = 0;

var gAdKeywords = Array(
	"business",			"5638516723",
	"subscription",		"5638516723",
	"Hajj and Umrah",		"5638516723",
	"Islamic Books",		"5638516723",
	"educational books",		"5638516723",
	"kids books",		"5638516723",
	"islamic media",		"5638516723",
	"islamic software",		"5638516723",
	"islamic CD",		"5638516723",
	"islamic audio",		"5638516723",
	"islamic charities",		"5638516723",
	"donation",		"5638516723",
	"zakat",		"5638516723",
	"islamic financing",		"5638516723",
	"islamic home financing",		"5638516723",
	"islamic investment",		"5638516723",
	"islamic funds",		"5638516723",
	"islamic schools",		"5638516723",
	"financial consulting",		"5638516723",
	//"islamic loans",		"5638516723",
	//"islamic mortgage",		"5638516723",
	"halal mortgage",		"5638516723",
	"halal foods",		"5638516723",
	"content",		"5638516723",
	"contract",		"5638516723",
	"voice over ip",		"5638516723",
	//"islamic clothing",		"5638516723",
	"project management", "5638516723",

	"",					"1008119152"// unknown						
);
function GetAdParamKey( start_query )
{
	var randomKeyword = RandomAdKeyword();
	switch(start_query)
	{
		case 0:
		//return ( "?search=" + EscapeEx(randomKeyword) + "&" );
		return "?";
		case 1:
		//return ( "search=" + EscapeEx(randomKeyword) + "&" );
		return "";
		case 2:
		//return ( "&search=" + EscapeEx(randomKeyword) + "&" );
		return "";
	}
}

function RandomAdKeyword()
{
	var wordsCount = (gAdKeywords.length/2) - 1;
	var index = Math.floor( wordsCount * Math.random() );
	return gAdKeywords[index*2];
}

function ChannelID(sKeyword)
{
	for(var i=0; i<gAdKeywords.length ; i+=2 )
	{
		if( sKeyword == gAdKeywords[i]){
			return gAdKeywords[i+1];
		}
	}
	return "1008119152";// unknown
}

function AdChannelName()
{
	var query = window.parent.location.search.substr( 1 );
	var name_pos = query.indexOf("search=");
	if( name_pos < 0 ){
		//alert("[" + query + "]");	
		return "1008119152";
	}
	
	query = query.substr( name_pos + 7 );
	var channel_name = unescape( query.substr( 0 , query.indexOf("&") ) );
	channel_name = Replace(channel_name, '+' , " " );
	for(var i=0; i<gAdKeywords.length ; i+=2 ){
		if( channel_name == gAdKeywords[i]){
			//alert( gAdKeywords[i+1] );
			return gAdKeywords[i+1];
		}
	}

	//alert( window.location.search );
	return "1008119152";
}

function GetChannelTitle(id)
{
	for(var i=0; i<gAdKeywords.length ; i+=2 ){
		if( id == gAdKeywords[i + 1]){
			return gAdKeywords[i];
		}
	}
	return "unknown";
}

function Replace( sText, sSearchFor, sReplaceWith )
{
	var nStart=0;
	var nJump = sReplaceWith.length; 

	while( true ){
		var nIndex = sText.indexOf( sSearchFor , nStart );
		
		if( nIndex == -1 )
			break;

		sText = sText.replace( sSearchFor, sReplaceWith );
		nStart += nIndex + nJump;
	}
	return sText;
}

function RandomColor( color )
{
	var ret_color = (color.constructor == Array) ? 
					color[ Math.floor( color.length * Math.random() ) ] : color;

	return ret_color;
}

function RotateAd()
{
	if( !document.getElementById( "idAdFrame" ) )
		return;
	
	//sKeyword = RandomAdKeyword();
	google_ad_channel = 5638516723;//ChannelID(sKeyword);
	save_channel = google_ad_channel;

	var nTime = (new Date()).getTime();
	idAdFrame.innerHTML="<iframe width=" + google_ad_width + " height=" + google_ad_height +
							" SCROLLING=\"NO\" BORDER=0 frameborder=\"0\" " + 
							"src=http://pagead2.googlesyndication.com/pagead/ads?client=ca-pub-0784395403030784&dt=" + nTime + 
								"&alternate_ad_url=" + escape(google_alternate_ad_url) + 
								"&format=" + google_ad_format + 
								"&output=html&channel=" + google_ad_channel + 
								//"&url=http%3A%2F%2Fwww.kobool.com%2F%3Fsearch%3D" + escape(sKeyword) + 
								//"&url=http%3A%2F%2Fwww.kobool.com%2Fa%2F" + escape(sKeyword) + ".htm" +
								"&url=http%3A%2F%2Fquran.muslim-web.com" +
								"&color_bg=" + RandomColor( google_color_bg ) + 
								"&color_text=888888&color_link=000080&color_url=008000&color_border=" + RandomColor( google_color_border )+ 
								"&ad_type=" + google_ad_type + 
								"&u_h=768&u_w=1024&u_ah=738&u_aw=1024&u_cd=32&u_tz=-480&u_his=26&u_java=true>" + 
						"</iframe>";
}
