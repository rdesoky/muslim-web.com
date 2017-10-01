try{ onLoadScriptFile(); } catch(e){};

var gHighResolution = 0;
var gPagesHost = "http://www.egylist.com/quran/getimg.pl?/quran";
var gPagesServer = "";//"pages/"; 
var gPagesFormat = ".gif";//".gif";
var gPageWidth = 264;
var gPageHeight = 401;


function imgBase(){
	return gImgHost || "";
}

function UpdateResolution(bForceLow)
{
	if(bForceLow)
		gHighResolution = 0;
	else
		gHighResolution = parseInt( getCookie( "hr", "1" ) );

	//gPagesServer = "http://quran.muslim-web.com/" + ( gHighResolution ? "/hpages/" : "/pages/p" );
	gPagesServer = gPagesHost + ( gHighResolution ? "/hpages/" : "/pages/p" );
	gPagesFormat = gHighResolution ? ".jpg" : ".gif";
	gPageWidth = gHighResolution ? 290 : 264;
	gPageHeight = gHighResolution ? 430 : 401;

	idPageViewFrame[0].style.width = idPageViewFrame[1].style.width = (gPageWidth + 2).toString() + "px";
	idPageViewFrame[0].style.backgroundImage = gHighResolution ? "url(/hpages/r_page.jpg)":"url(/pages/r_page.jpg)";
	idPageViewFrame[1].style.backgroundImage = gHighResolution ? "url(/hpages/l_page.jpg)":"url(/pages/l_page.jpg)";
	idPageView[0].style.height = idPageView[1].style.height = gPageHeight + "px";
	idPageView[0].width = idPageView[1].width = gPageWidth;

	var btnToggleResolution = document.getElementById("idBtnToggleResolution");
	if(btnToggleResolution){
		btnToggleResolution.value = gHighResolution ? "حجم صغير":"حجم كبير";
		btnToggleResolution.title = gHighResolution ? "اضغط هنا لاختيار مساحة أصغر للصفحات لتسريع زمن تحميل الصفحة اذا كان اتصالك بالإنترنت ذو سرعة بطيئة.":"اضغط هنا لاختيار مساحة أكبر للصفحات لسهولة القراءة اذا كان اتصالك بالإنترنت ذو سرعة عالية.";
	}
}

var gParts = new Array(
1,		1,		1,	//1
2,		142,	22,	//2
2,		253,	42,	//3
3,		93,		62,	//4
4,		24,		82,	//5
4,		149,	102,//6
5,		82,		121,//7
6,		111,	142,//8
7,		88,		162,//9
8,		41,		182,//10
9,		93,		201,//11
11,		6,		222,//12
12,		53,		242,//13
15,		1,		262,//14
17,		1,		282,//15
18,		75,		302,//16
21,		1,		322,//17
23,		1,		342,//18
25,		21,		362,//19
27,		56,		382,//20
29,		46,		402,//21
33,		31,		422,//22
36,		28,		442,//23
39,		32,		462,//24
41,		47,		482,//25
46,		1,		502,//26
51,		31,		522,//27
58,		1,		542,//28
67,		1,		562,//29
78,		1,		582//30
);

function getPageChapter(nPage)
{
	for (var i=0; i < gParts.length ; i++ ){
		var offset = i*3;
		if( gParts[offset+2] > nPage ){
			return i-1;
		}
	}
	return 29;
}

function GetChapterProgress( nChapter, nPageNo )
{
	var startPage = gParts[nChapter*3+2];
	var endPage   = nChapter>28 ? 604 : gParts[ (nChapter+1) * 3 +2 ];
	
	return ( ( nPageNo - startPage ) * 100 ) / ( endPage - startPage );
}

function GetSuraProgress( nSura, nPageNo )
{
	var startPage = gSuraPages[nSura];
	var endPage   = gSuraEndPages[nSura];
	
	return ( ( nPageNo - startPage ) * 100 ) / ( endPage - startPage );
}

var gSortedSura = [
14,3,33,46,112,17,7,87,21,76,94,84,6,8,82,85,2,90,98,66,64,102,
81,9,95,45,62,72,69,22,15,49,57,59,44,51,55,13,30,43,99,39,32,
26,91,42,37,61,93,86,65,52,100,103,96,29,88,1,48,89,25,113,105,
101,97,28,68,54,75,109,18,108,92,23,5,107,58,74,77,73,111,83,70,
67,60,63,79,114,78,53,16,4,110,27,24,104,56,34,38,20,80,40,35,41,
50,106,31,47,19,71,11,36,12,10 ];


VerseNoInSoura = [
  0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54
, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20
, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6 ];

var sura_type = [
0,1,1,1,1,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,
0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,1,1,
1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1];


//var gsAyatImageURL = "http://www.alazhr.com/quran/image/";
//var gsAyatImageURL = "http://24.6.182.32/ayaimage/";
var gsAyatImageURL = "http://www.elazhar.com/quran/image/";


var gReciterNames = [
"ابراهيم الأخضر",		//1
//"ابو بكر الشاطري",	
"احمد ابو زيد",			//2
"احمد خليل شاهين",		//3
"احمد العجمي",			//4
"احمد نعينع",			//5
//"توفيق الصايغ",
//"خالد القحطاني",
"عادل الكلباني",		//6
"عبد الباري الثبيتي",	//7
"عبد الباري محمد",		//8
"عبد الباسط عبد الصمد",	//9
"عبد الباسط (مجود)",	//10
"عبد الخالق علي",		//11
//"عبد العزيز الأحمد",
//"عبد الرحمن السديس",
"عبد الله الخياط",		//12
"عبد الله المطرود",		//13
"عبد الله بصفر",		//14
"عبد الله بصفر(مجود)",	//15
"عبد المحسن القاسم",	//16
"عبد المنعم عبد المبدئ",//17
"عبد الهادي الكناكري",	//18
"عبد الودود مقبول حنيف",//19
"علي الحذيفي",			//20
"علي السويسي",			//21
"علي عبد الله جابر",	//22
"عيسى العجمي",			//23
"زكي داغستاني",			//24
//"صلاح ابو خاطر",		
"طارق ابراهيم" ,		//25
//"محمد المحيسني",
"محمد ايوب",			//26
//"محمد حسان",
"محمد جبريل",			//27
"محمد رفعت",			//28
"محمد عبد الكريم",		//29
"محمد صالح أبو زيد",	//30
"محمد صديق المنشاوي",	//31
"محمد محمود الطبلاوي",	//32
"محمود البنا",			//33
"محمود خليل الحصري",	//34
"مصحف معلم - الحصري",	//35
"مشاري راشد العفاسي",	//36
"مصطفى اسماعيل",		//37
"سعد الغامدي",			//38
//"سعود الشريم",
"هاني الرفاعي",			//39
"العيون الكوشي*",		//40
"عبد الباسط عبد الصمد*",//41
"محمود خليل الحصري*",	//42
"مصطفى غربي*",			//43
"الدوكالي محمد العالم**",//44
"محمد أبو سنينة**",		//45
"عبد الرشيد الصوفي ***",//46
"محمود خليل الحصري****"	//47
];


var reciterLinks = [
"http://egylist.com/quran/ibr_kd/s%1%.rm",							//1
//"http://egylist.com/quran/shatri/s%1%.rm",
"http://egylist.com/quran/abuzaid/s%1%.rm",							//2
"http://egylist.com/quran/ah_sha/s%1%.rm",							//3
"http://egylist.com/quran/agmy/%2%.rm",			//4
"http://egylist.com/quran/noaenee/s%1%.rm",							//5
//"http://egylist.com/quran/taw_saig/s%1%.rm",
//"http://egylist.com/quran/qahtanee/s%1%.rm",
"http://egylist.com/quran/aalkalbani/s%1%.rm",						//6
"http://egylist.com/quran/Althobeaty/s%1%.rm",						//7
"http://egylist.com/quran/abdulbarymoh/%2%.rm",	//8
"http://egylist.com/quran/baset/s%1%.rm",								//9 escape("http://quran.islamway.com/quran3/74/") + "%2%.rm"
"http://quran.islamway.com/quran3/203/%2%.rm" ,	//10
"http://quran.islamway.com/quran3/77/%2%.rm",		//11
//"http://egylist.com/quran/aalahmad/s%1%.rm",
//"http://egylist.com/quran/Sudeas/s%1%.rm",
"http://egylist.com/quran/Alkhayyat/s%1%.rm",							//12
"http://quran.islamway.com/quran3/91/%2%.rm",		//13
"http://egylist.com/quran/abasfar/s%1%.rm",							//14
"http://quran.islamway.com/quran3/208/%2%.rm",	//15
"http://egylist.com/quran/alqasem/s%1%.rm",							//16
"http://quran.islamway.com/quran3/95/%2%.rm",		//17 
"http://egylist.com/quran/kanakree/s%1%.rm",							//18
"http://egylist.com/quran/abd_wad/s%1%.rm",							//19
"http://quran.islamway.com/quran3/99/%2%.rm",		//"http://quran.islamway.com/hudhaifi/%2%.rm",		//20
"http://egylist.com/quran/Alsoweasy/s%1%.rm",							//21
"http://egylist.com/quran/alijaber/s%1%.rm",							//22
"http://quran.islamway.com/quran3/21/%2%.rm",		//23 //audio/EsaAlajmee/s%1%.rm
"http://egylist.com/quran/Zak_Dag/s%1%.rm",							//24
//"http://egylist.com/quran/Bokhater/s%1%.rm",
"http://quran.islamway.com/quran3/68/%2%.rm",		//25 //http://quran.islamway.com/taribrahim/%2%.rm
//"http://egylist.com/quran/mehesnee/s%1%.rm",
"http://quran.islamway.com/quran3/122/%2%.rm",	//26
//"http://egylist.com/quran/mhassan/s%1%.rm",
"http://egylist.com/quran/mjebreel/s%1%.rm",							//27
"http://quran.islamway.com/quran3/134/%2%.rm",			//28
"http://egylist.com/quran/ma_kar/s%1%.rm",							//29
"http://egylist.com/quran/mbuzeed/s%1%.rm",							//30
"http://egylist.com/quran/menshawee/s%1%.rm",							//31
"http://egylist.com/quran/tablawee/s%1%.rm",							//32
"http://egylist.com/quran/mah_ban/s%1%.rm",							//33
"http://egylist.com/quran/hosaree/rm/s%1%.rm",						//34 //http://quran.islamway.com/quran3/212/004.rm
"http://quran.islamway.com/quran3/211/%2%.rm",		//35 //http://quran.islamway.com/quran3/211/004.rm
"http://quran.islamway.com/quran3/147/%2%.rm",	//36 //http://quran.islamway.com/quran3/213/004.rm
"http://egylist.com/quran/Mu_sma/s%1%.rm",							//37
"http://quran.islamway.com/quran3/45/%2%.rm",			//38
//"http://egylist.com/quran/shureem/s%1%.rm",
"http://quran.islamway.com/quran3/157/%2%.rm",			//39
"http://egylist.com/quran/koshee/s%1%.rm",							//40
"http://quran.islamway.com/quran3/179/%2%.rm",		//41	"http://egylist.com/quran/baset/w/s%1%.rm",							
"http://egylist.com/quran/hosaree/w/s%1%.rm", 		//42*	"http://quran.islamway.com/quran3/181/%2%a.rm",
"http://egylist.com/quran/Gharbi/s%1%.rm",							//43
"http://egylist.com/quran/dukalli/s%1%.rm",							//44
"http://quran.islamway.com/sunaynaqal/%2%.rm",		//45
"http://egylist.com/quran/Abdulrashid/s%1%.rm",						//46
"http://quran.islamway.com/quran3/192/%2%.rm"			//47
];



var reciterSuras = new Array (
"111111111111111101111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//1
//"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//2
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//3
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//4
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//5
//"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
//"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//6
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//7
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//8
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//9
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//10
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//11
//"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
//"111111110111111111111111111111111111111111111111111111111111111111111111111111111111111110000000000111111111111111",
"111111111111111111111111111111111100011111111111111111111111111111111111111111111111111111111111111111111111111111",	//12
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//13
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//14
"111111111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000000000000000",	//15
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//16
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//17
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//18
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//19
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//20
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//21
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//22
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//23
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//24
//"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
"111101111111111111111111111111111111111111111111111111111101001111111111111111111111111111111111111111111111111111",	//25
//"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//26
//"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//27
"000000000000000001100000000000000000000000000000000000100000000000000001101110000000100000000000111111111100000000",	//28
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//29
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//30
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//31
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//32
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//33
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//34
"100011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//35
"111111111111111111111111111111111111111111110111111111111111111111111111111111111111111111111111111111111111111111",	//36
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//37
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//38
//"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//39
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//40
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//41
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//42
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//43
"111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",	//44
"000000000000000000000000000000000000000000000000000000011111111111111111111111111111111111111111111111111111111111",	//45
"111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",	//46
"011111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"	//47
);


var gSuraNames = new Array ( "",
"الفاتحة","البقرة","ال عمران","النساء","المائدة","الانعام","الاعراف","الانفال","التوبة","يونس","هود","يوسف","الرعد","ابراهيم","الحجر",
"النحل","الاسراء","الكهف","مريم","طه","الانبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان",
"السجدة","الاحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الاحقاف","محمد","الفتح",
"الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة",	"المنافقون","التغابن",
"الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الانسان","المرسلات","النبا","النازعات","عبس","التكوير",
"الانفطار","المطففين","الانشقاق","البروج","الطارق","الاعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر",
"البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الاخلاص","الفلق","الناس",
"",""
);


var gSuraPages = new Array ( 
1,   2  , 50 , 77 , 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312, 322, 332, 342, 350, 359, 367, 377, 385,
396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467, 477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534,
537, 542, 545, 549, 551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585, 586, 587, 587, 589, 590,
591, 591, 592, 593, 594, 595, 595, 596, 596, 597, 597, 598, 598, 599, 599, 600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604, 604
);

var gSuraEndPages = new Array ( 
1,    49,  76, 106, 127, 150, 176, 186, 207, 221, 235, 248, 255, 261, 267, 281, 293, 304, 312, 321, 331, 341, 349, 359, 366, 376, 385, 396, 
404, 410, 414, 417, 427, 434, 440, 445, 452, 458, 467, 476, 482, 489, 495, 498, 502, 506, 510, 515, 517, 520, 523, 525, 528, 531, 534, 537, 
541, 545, 548, 551, 552, 554, 555, 557, 559, 561, 564, 566, 568, 570, 571, 573, 575, 577, 578, 580, 581, 583, 584, 585, 586, 587, 589, 589, 590, 
591, 592, 592, 594, 594, 595, 596, 596, 596, 597, 597, 598, 599, 599, 600, 600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604
);


function totalAyat()
{
	var count=0;
	for(i=1;i<VerseNoInSoura.length;i++)
		count+=VerseNoInSoura[i];
	return count;
}

function WindowReload( time )
{
	setTimeout( "window.location.reload()",time );
}

function DeleteRecentReciter( index )
{
	var	lastReciter = readCookie("reciter");
	
	var lastReciterList = lastReciter.split(",");
	
	lastReciterList = DeleteArrayElements( lastReciterList, index, 1 );

	writeCookie("reciter", lastReciterList.join(","));

	ShowFavoriteReciters();
}

function PushToRecentSuras( sura_index )
{
	var	lastSuras = readCookie("r_suras", "").split(",");

	for( var i=0;i<lastSuras.length;i++)
	{// remove it from the list 
		if(lastSuras[i] == sura_index)
		{
			lastSuras = DeleteArrayElements( lastSuras, i, 1 );
			i--;
		}
	}

	lastSuras.length = 15;

	writeCookie("r_suras", sura_index.toString(10) + "," + lastSuras.join(","));
}

function SaveCurrentReciter( index )
{
	var	lastReciter = readCookie("reciter");
	
	var lastReciterList = lastReciter.split(",");

	for( var i=0;i<lastReciterList.length;i++)
	{// remove it from the list 
		if(lastReciterList[i] == index)
		{
			lastReciterList = DeleteArrayElements( lastReciterList, i, 1 );
			i--;
		}
	}

	lastReciterList.length = 10;// remove the last one
	// add it to the top of the list
	writeCookie("reciter", index.toString(10) + "," + lastReciterList.join(","));
}

function openReciter( url, sura_index, reciter_index )
{
//	window.open (url, "telawa", "width=480,height=120");
//	window.focus();

	SaveCurrentReciter( reciter_index );
	PushToRecentSuras( sura_index );

	if( document.getElementById("idReciter") ){
		ShowFavoriteReciters();
	}

	var newWindow = window.open ("/reciter.htm?auto=1&url=" + escape(url) + "&sura=" + sura_index + "&reciter=" + reciter_index, 
								"telawa", "width=340,height=200");
	newWindow.focus();
}

function LoadRecitersList( idReciter )
{
	idReciter.options.length = gReciterNames.length;

	for	(var index=0; index < gReciterNames.length; index++ )
	{
		var oOption = idReciter.options[index];
		oOption.text = (index+1).toString(10) + " " + gReciterNames[index];
		oOption.value = reciterLinks[index] ;	
	}
}

////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function GetPagesButtons( suraNo, separator )
{
	var sRetStr, nSuraIndex, nStartPage, nEndPage, i;

	if(!separator)
		separator = ".";
	
	nSuraIndex = suraNo - 1;

	nStartPage	= gSuraPages[nSuraIndex];
	nEndPage	= gSuraEndPages[nSuraIndex];

	sRetStr = "";

	if(0==nStartPage%2){
		sRetStr = GetDummyPageButton();
	}

	for (i=nStartPage; i<=nEndPage; i++ )
	{
		sRetStr = sRetStr + GetPageButton(i);

		if( Math.floor( i/2 ) * 2 == i ) {// even number
			sRetStr += separator;
		}
	}

	return sRetStr;
}

function GetPageButton(i)
{
	return "<span class=PageButton onmouseover=\"this.style.backgroundColor='yellow';ShowPage(" + i + ");\" " + 
	"onmouseout=\"this.style.backgroundColor='';HidePage()\" onclick='gotoPage(" + i.toString(10) + ")'>" + i.toString(10) + "</span><span style='width:1px'></span>";
}

function GetDummyPageButton()
{
	return "";
}

function PrevPage()
{
	var nCurrPage = parseInt(idPageViews.page_number, 10);
	if(nCurrPage > 1)
		DisplayPage(nCurrPage - 1);
}

function NextPage()
{
	var nCurrPage = parseInt(idPageViews.page_number, 10);
	if(nCurrPage < 604){
		DisplayPage(nCurrPage + 1);
	}
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function DisplayPage(nPageNo, nDelay)
{
	if(!document.getElementById("idPageViews"))
		return;

	if(nPageNo == idPageViews.page_number){
		ShowElement("idPageViews", nDelay);
		if( parseInt( idPageViews.scroll ) ){
			idPageViews.style.top = document.body.scrollTop;// + 27;
		}
		return;
	}

	var pageButton = document.getElementById( "idPageBtn" + idPageViews.page_number );
	if(pageButton){
		pageButton.className="PageButton";
	}

	var nChapter = getPageChapter(idPageViews.page_number);
	var chapter = document.getElementById("idChapter_" + nChapter );
	if(chapter){
		chapter.style.border = "thin none";
		chapter.innerHTML = chapter.innerText;
	}

	var nSura = getSuraByPage(idPageViews.page_number);
	var sura = document.getElementById("idSura_" + nSura );
	if(sura){
		sura.style.border = "thin none";
		sura.innerHTML = sura.innerText;
	}

	var nActivePage	  = (nPageNo-1) % 2;
	var nInActivePage = (nActivePage == 0) ? 1:0;
	
	if( (idPageViews.page_number - nInActivePage ) != ( nPageNo - nActivePage ) )
	{
		idPageView[nInActivePage].src= imgBase() + "images/space.gif";
		idPageNo[nInActivePage].innerHTML = "";
		if(document.getElementById("idPageChapter")){
			idPageChapter[nInActivePage].innerHTML = idPageSuraName[nInActivePage].innerHTML = "";
		}
	}

	//idPageView[nInActivePage].style.filter = "progid:DXImageTransform.Microsoft.Alpha( style=0,opacity=50)";

	if( parseInt( idPageViews.scroll ) ){
		idPageViews.style.top = document.body.scrollTop;// + 27;
	}
	SetPage( nActivePage, nPageNo );
	var nSuraNo = getSuraByPage( nPageNo );
	var nNextSuraNo = getSuraByStartPage(nPageNo);
	
	if( (idPageViews.sura_number != nSuraNo) && (nNextSuraNo != idPageViews.sura_number ))
	{
		//alert( "current:" + nPageNo + ", " + idPageViews.sura_number + ", first:" + nSuraNo + ", next: " + nNextSuraNo);
		UpdatePageButtons(nSuraNo);
	}

	if( !nDelay )
		nDelay = 500;

	var pageNav = document.getElementById("idPageNav");
	if (pageNav){
		pageNav.innerHTML = nPageNo;
	}

	pageButton = document.getElementById( "idPageBtn" + nPageNo );
	if(pageButton){
		pageButton.className="ActivePageButton";
	}

	var nChapter = getPageChapter(nPageNo);
	var chapter = document.getElementById("idChapter_" + nChapter );
	if(chapter){
		chapter.style.border = "solid 1px gray";
		chapter.innerHTML = "<div style='position:absolute'>" + chapter.innerText + "</div><div style='width:" + GetChapterProgress(nChapter, nPageNo) + "%;background:#99CC00'></div>" ;
	}

	var nSura = getSuraByPage(nPageNo);
	var sura = document.getElementById("idSura_" + nSura );
	if(sura){
		sura.style.border = "solid 1px gray";
		sura.innerHTML = "<div style='position:absolute'>" + sura.innerText + "</div><div style='height:12px;width:" + GetSuraProgress(nSura-1, nPageNo) + "%;background:#99CC00'></div>" ;
	}

	if(document.getElementById("idPageSpin")){
		gPageSpin.setValue(nPageNo);
		if( PageMarkFound(nPageNo) ){
			idBtnPageMark.value = "حذف العلامة";
		}else{
			idBtnPageMark.value = "ضع علامة";
		}
	}

	ShowElement("idPageViews", nDelay);
}

function GotoPageText(nPage)
{
	LoadData("http://cgi.muslim-web.com/cgi-bin/goto_page.pl?p=" + nPage, "onGotoPageText( XMLDoc(gDataResponse) )");
}

function onGotoPageText( xmlDoc )
{
	var xmlRoot = xmlDoc.selectSingleNode("/*");
	if(xmlRoot)
	{
		var sura = xmlRoot.getAttribute("sura");
		var aya = xmlRoot.getAttribute("aya");
		window.open( "/sura.htm?aya=" + toStringEx(sura,3) + toStringEx(aya,3) , "_top" );
	}
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function SetPage( nSide, nPageNo )
{
	idPageView[nSide].src = imgBase() + "images/space.gif";
	idPageNo[nSide].innerHTML = "<font color=red>تحميل صفحة (" + nPageNo + ") ...</font>";
	
	if(document.getElementById("idPageChapter")){
		idPageChapter[nSide].innerHTML = idPageSuraName[nSide].innerHTML = "";
	}
		
	if( !idPageView[nSide].onload ) {
		idPageView[nSide].onload = function()
		{ 
			var idCurrPage = event.srcElement;
			idPageNo[idCurrPage.side].innerHTML= "<a style='font-size:11px' href='javascript:GotoPageText(" + idCurrPage.page_number + ")'>صفحة " + idCurrPage.page_number + "</a>";
			if(document.getElementById("idPageChapter")){
				idPageChapter[idCurrPage.side].innerHTML = "الجزء :" + ( getPageChapter( idCurrPage.page_number ) + 1 ).toString();
				var nSura = getSuraByPage( idCurrPage.page_number );
				idPageSuraName[idCurrPage.side].innerHTML = "سورة " + nSura + " : " + gSuraNames[ nSura ];
			}
		};
	}

	if( !idPageView[nSide].onerror ) {
		idPageView[nSide].onerror = function()
		{ 
			var idCurrPage = event.srcElement;
			idPageNo[idCurrPage.side].innerHTML="<font color=red>خطأ في تحميل الصفحة رقم: " + idCurrPage.page_number + "</font>";
		};
	}

	idPageView[nSide].page_number = nPageNo;
	idPageView[nSide].src= gPagesServer + toStringEx(nPageNo,3) + gPagesFormat;

	ActivatePage(nPageNo);
}

function ActivatePage( nPageNo )
{
	var nSide = (nPageNo -1) % 2;

	//idPageView[nSide].style.filter = "progid:DXImageTransform.Microsoft.Alpha( style=0,opacity=100)";

	idPageViews.page_number = nPageNo;
	idPageViews.active_page = nSide;
}
////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////
function HidePage()
{
	HideElement("idPageViews", 500);
}

function getSuraByPage(nPageNo)
{
	for (var i=0;i<gSuraPages.length ; i++)
	{
		if(gSuraEndPages[i] >= nPageNo)
			return i+1;
	}
	return 0;
}

function getSuraByStartPage(nPageNo)
{
	for (var i=0;i<gSuraPages.length ; i++)
	{
		if(gSuraPages[i] > nPageNo)
			return 0;

		if(gSuraPages[i] == nPageNo)
			return i+1;
	}
	return 0;
}

function gotoSide( nSide )
{
	var nPageNo = parseInt( idPageViews.page_number );
	nPageNo = Math.floor( (nPageNo - 1) / 2 ) * 2;// determine previous left side number
	DisplayPage( nPageNo + nSide + 1, 1 );// add number of pages
}

function WheelScrollPages()
{
	var wDelta = event.wheelDelta;

	if(wDelta<-100)
		NextPage();
	else if(wDelta>100)
		PrevPage();

	return false;
}