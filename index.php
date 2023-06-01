<?php
// Quran Main Page
include("qlib.php");
include("strings.php");

$UserAgent = $_SERVER['HTTP_USER_AGENT'];
$Browser = GetBrowserInfo($UserAgent);
$IsIE = ($Browser['Name'] == "msie");
$IEver = $Browser['Version'];
$IsOldIE = ($IsIE && $IEver < 8);

if ($IsOldIE) {
	Header("HTTP/1.1 301 Moved Permanently");
	Header("Location: /ie.php");
	exit();
}

header("Expires: Sun, 19 Aug 2012 05:00:00 GMT"); //expires in the past for guranteed refreshment
#header("Cache-Control: max-age=0, s-maxage=0, no-cache, no-store"); // HTTP/1.1

$lang = DetectLang();
include($lang . "_strings.php");
include("filesver.php");

$suraCellWidth = 140;
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN">

<html host="<?= $host ?>">

<head>
	<meta http-equiv="X-UA-Compatible" content="IE=8" />
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
	<meta http-equiv="imagetoolbar" content="no" />
	<meta name="keywords" content="Koran Islam book Mohamed memorizing Quran Koraan Quraan reciting" />
	<meta property="fb:admins" content="890570346" />

	<title>
		<?= $Str['page_title'] ?>
	</title>

	<link type="text/css" rel="StyleSheet" href="<?= $FV['base_css'] ?>" />
	<link type="text/css" rel="StyleSheet" href="<?= $FV['index_css'] ?>" />
	<link type="text/css" rel="StyleSheet" href="<?= $FV['keyboard_css'] ?>" />
	<link type="text/css" rel="StyleSheet" href="<?= $FV['spin_edit_css'] ?>" />
	<link type="text/css" rel="StyleSheet" href="<?= $FV['memorizer_css'] ?>" />
	<link type="text/css" rel="stylesheet" href="<?= $FV['menu_css'] ?>" />
	<link type="text/css" rel="stylesheet" href="<?= $FV['chelp_css'] ?>" />

	<script type="text/javascript" src="<?= $FV['ScriptLoader'] ?>"></script>
	<? if ($_SERVER['HTTP_HOST'] == "localhost") {
		echo "<script type='text/javascript' src='http://localhost/js/quran/MapEditor.js'></script>";
	} ?>

	<script type="text/javascript">
		var PgMapBase = "<?= $pg_map_base ?>",
			JSLoaderBase = "<?= $js_loader_base ?>",
			CGIBase = "<?= $cgi_base ?>";

		window.onload = function () {
			ScriptLoader.loadScripts({
				gStrings: "<?= $FV['gStrings'] ?>",
				MemApp: "<?= $FV['MemApp'] ?>",
				//swfobject:			"<?= $FV['swfobject'] ?>",
				//PageMp3Player:		"<?= $FV['PageMp3Player'] ?>",
				AudioPlayer: "<?= $FV['AudioPlayer'] ?>",
				Utils: "<?= $FV['utils'] ?>",
				DefineJClass: "<?= $FV['jclass'] ?>",
				QData: "<?= $FV['qdata'] ?>",
				RecitersInfo: "<?= $FV['audio_data'] ?>",
				uncompressMem: "<?= $FV['lib'] ?>",
				GetSaveURL: "<?= $FV['qlib'] ?>",
				addAya: "<?= $FV['tlib'] ?>",
				GetData: "<?= $FV['xml_loader'] ?>",

				JCSpinEdit: "<?= $FV['JCSpinEdit'] ?>",
				PageMap: "<?= $FV['PageMap'] ?>",
				JCQuranViewer: "<?= $FV['JCQuranViewer'] ?>",
				JCSuraCell: "<?= $FV['JCSuraCell'] ?>",
				JCToggler: "<?= $FV['JCShowHideSwitcher'] ?>",
				JCSuraViewer: "<?= $FV['JCSuraViewer'] ?>",
				JCKeyboard: "<?= $FV['JCKeyboard'] ?>",
				JCTabs: "<?= $FV['JCTabs'] ?>",
				JCSettings: "<?= $FV['JCSettings'] ?>",
				createMenu: "<?= $FV['menu'] ?>",

				HomePage: "<?= $FV['home'] ?>",
				QSearch: "<?= $FV['qsearch'] ?>"
			},
				function () {
					Utils.setupCrossBrowser();
					HomePage.init();
					<? if ($host != "local") { ?>
						LoadJSON(CGIBase + 'counter.js.pl?p=main');
						// setTimeout( 
						// 	function(){
						// 		_E("FBShare").innerHTML = _S.spread_site + "&nbsp;&gt;&nbsp;";
						// 		ScriptLoader.loadJScript("http://static.ak.fbcdn.net/connect.php/js/FB.Share");
						// 		_E("FBLike").src="http://www.facebook.com/plugins/like.php?href=http://quran.muslim-web.com/&layout=button_count&amp;show_faces=false&amp;width=120&amp;action=like&amp;colorscheme=dark";
						// 	},
						// 	10
						// );
					<? } ?>
				}
			);
		}

		var suraCellWidth = <?= $suraCellWidth ?>;
		var gPageMapVersion = <?= $PageMapVersion ?>;
		var gPagesServer = "<?= $qpages_host ?>";
		var gTafBase = "<?= $tafseer_base ?>";
		var gImgHost = "";
		var gAppRoot = "<?= $app_root ?>";
		var gLang = "<?= $lang ?>";

	</script>
</head>

<body lang="<?= $lang ?>" class="xhelp_on">
	<div id="LangSwitcher" class="href" onclick="SwitchLang('<?= $lang ?>')"><?= ($lang == "ar") ? $Str['english'] : $Str['arabic'];
	?></div>

	<div id="GooglePlayBadge">
		<a href="https://play.google.com/store/apps/details?id=com.muslim_web.quran" target="_blank"><img id="GooglePlay"
				src="images/google-play-badge.png" alt="get it on Google Play" /></a>
		<!-- <a href="https://itunes.apple.com/us/app/quran-hafiz/id1384358953?ls=1&mt=8" target="_blank"
										><img id="AppStore" src="images/<?= $lang == 'ar' ? 'Download_on_the_App_Store_Badge_AR_RGB_blk_102417.svg' : 'Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg' ?>" 
					alt="Download on the App Store"/>
			</a> -->
	</div>

	<table id="TopPanel" cellpadding="0" class="collapsed">
		<tr>
			<td class="top_logo" id="TopLogo">
				<div id="SiteTitle" class="site_title">
					<?= $Str['holy_quran'] ?>
				</div>
				<div style="direction:ltr;font-size:10px">
					<?= GetStr("site_url") ?>
				</div>
				<audio id="AudioPlayerElement">
					Browser doesn't support audio
				</audio>
			</td>
			<td id="Header">
				<div class="AnnouncementBar"><a href="http://hafiz.muslim-web.com" target="_blank">
						اضغط هنا لتجربة النسخة الجديدة من الموقع.
						Click here to try the new version</a>
				</div>
				<table id="TopMenu">
					<tr>
						<td>
							<span id="UserInfoPanel">
								<?= $Str['welcome'] ?>
							</span>
						</td>
						<td id="TopMenuSearch">
							<form id="SearchForm">
								<?= $Str['search'] ?>:
								<input type="text" mClass="JCKeyboard" id="SearchKeyword" name="keyword" size="10" /><input type="image"
									src="images/search.gif" class="btnSearch" />
							</form>
						</td>
						<td id="SearchTabsRoot">
							<div mClass="JCTabs" id="SearchTabs" pid="SearchResultsRoot" fast="1"
								onRemoveAll="DU.hide('SearchResultsRoot')"></div>
							<div id="SearchResultsRoot" style="display:none"></div>
						</td>
						<td style="display:none"><span class="checkTitle" id="cHelp">Help</span></td>
						<td>
							<div style="max-height: 18px;overflow:hidden">
								<a name="fb_share" id="FBShare" type="icon_link" share_url="http://quran.muslim-web.com"
									href="http://www.facebook.com/sharer.php"></a><!-- script 
							src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" 
							type="text/javascript"
						></script -->
							</div>
						</td>
						<td>
							<iframe id="FBLike" scrolling="no" frameborder="0" allowTransparency="true"
								style="border:none; overflow:hidden; width:120px; height:18px;"></iframe>
						</td>
						<? if ($IsIE !== false) { ?>
							<td id='BackToOld'>
								| <a href='/ie.php'>
									<?= GetStr('back_to_old_ver') ?>
								</a>
							</td>
						<? } ?>
					</tr>
				</table>
				<div id="TopMenuItems">
					<span id="RecentReciters"></span>
					<div class="inline">
						<!--<span class="help_anchor h_left" >-->
						<!--<span class="h_frame">Audio controls</span>-->
						<!--<span class="h_arrow"></span>-->
						<!--</span>-->
						<div id="GetFlash" style="display:none">
							<a href='http://www.adobe.com/go/getflashplayer'>
								<img src='http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'
									alt='Get Adobe Flash player' />
							</a>
						</div>

						<table id="AudioControls" cellspacing="0" class="idle" cellspadding="0" style="display:none">
							<tr>
								<td>&nbsp;<a id="PlayerSura" onClick="QViewer.onclickSuraTitle(PlayList.current.sura)"></a></td>
								<td id="PlayerStatus"></td>
								<td><span tabIndex="0" id="BtnPlay" class="btn playBtn" onClick="AudioPlayer.play(true);"></span> <span
										tabIndex="0" id="BtnStop" class="btn playStop" disabled onclick="AudioPlayer.stop()"></span>
								</td>
								<td id="VolumeCtrl"></td>
								<td id="SyncOption"><span class="checkTitle" id="SyncCheck" checked="1"
										onclick="AudioPlayer.syncAudio(1)">
										<?= GetStr("view") ?>&nbsp;&nbsp;
									</span>
								</td>
								<td id="ReciteTillEnd"><span class="checkTitle" id="ReciteTillEndCheck" onclick="_TA(this,'checked')">
										<?= GetStr("ReciteTillEnd") ?>&nbsp;&nbsp;
									</span>
								</td>
								<td id="RepeatOption">
									<span id="RepeatCheck" class="checkTitle"
										onclick="_TA(this,'checked');_E('RepeatBar').style.display=_EA(this,'checked')?'':'none'">
										<?= GetStr("repeat") ?>&nbsp;&nbsp;
									</span>
								</td>
								<td id="RepeatBar" style="display:none">
									<span id="RepeatCounter">1</span><span> : </span>
									<span id="CustomRepeat">&nbsp;<input type="text" id="Repeat" value="2" /></span>
									<span class="checkTitle" id="EndlessLoop"
										onclick="_TA(this,'checked');_E('CustomRepeat').style.display=_EA(this,'checked')?'none':''">
										<?= GetStr("endless") ?>
									</span>
								</td>
							</tr>
						</table>
						<span id="RandomPlayLink" style="display:none" class="href" onclick="ISura.reciteRandom()">
							<?= GetStr("rand_sura") ?>
						</span>

					</div>
				</div>
				<table id="ControlBar" cellpadding="0">
					<tr>
						<td id="idViewTabs" mClass="JCTabs" changeHandler="onChangeView" pid="MainIndex"><span tid="index"
								pid="idQuranIndex">
								<?= $Str['index'] ?>
							</span><span tid="pages" pid="idPageViews" class="pages_tab"><?= $Str['pages'] ?>
							</span><span tid="mem" pid="MemReport" class="left_align">
								<?= $Str['mem_percent'] ?>: <span id="idMemorized">0</span>%<br />
								<!--<span class="help_anchor h_bottom">-->
								<!--<span class="h_frame">Memory Report</span>-->
								<!--<span class="h_arrow"></span>-->
								<!--</span>-->
							</span><span tid="exercise" pid="Trainer">
								<?= $Str['writing_exercise'] ?>
							</span></td>
						<!-- td>&nbsp;<a href="http://apps.facebook.com/memorizer/" target="_blank"><?= $Str['memorizer'] ?></a></td -->
						<td>&nbsp;
							<span onclick="QViewer.onClickReview(this)" id="MemReviewTitle" class="checkTitle">
								<?= $Str['mem_review'] ?>
							</span>&nbsp;
							<span id="idPageMarks">&nbsp;</span>
							<span id="idRecentSuras">&nbsp;</span>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>

	<div id="MainIndex">
		<div id="RightMenu">
			<!-- div id="UrgentMsg" class="sideBox" style="background:white;color:maroon"></div -->
			<div class="sideBox">
				<div mClass="JCToggler" mTargetElement="AdsFrame">
					<span cid="bullet" class="arrowBtn down"></span>
					<?= $Str['ads'] ?>
				</div>
				<div id="AdsFrame">
					<div id="idKoboolAd" onclick="window.open('http://www.kobool.com','_blank')">
						<div>هل تريد أن تحصن نفسك؟</div>
						<div style="font-size:14px;color:brown">موقع (قبــول) للزواج</div>
						<div>من شبكة المسلم</div>
					</div>
					<? /*include('side_ads.php');*/?>
				</div>
			</div>

			<div class="sideBox">
				<div>التلاوات والتفسير من:</div>
				<div>
					<a target="_blank" href="http://www.versebyversequran.com">everyayah.com</a><br>
					<!-- طريق الإسلام:<a target="_blank" href="http://www.islamway.com">islamway.com</a><br>
						موقع الإسلام:<a target="_blank" href="http://www.al-islam.com">al-islam.com</a><br>
						الشبكة الإسلامية:<a target="_blank" href="http://www.islamweb.net">islamweb.net</a> -->
				</div>
				<!-- <div>
						المرتل: <b>reciter.org</b>
					</div> -->
			</div>

		</div>
		<div id="Trainer" style="display:none;">
			<? include("exercise.php") ?>
		</div>
		<div id="MemReport" style="display:none"></div>
		<div id="idQuranIndex">
			<div mClass="JCQuranIndex">
				<!-- Index goes here -->
				<div id="SiteIntro">
					<div style="direction:rtl">
						موقع القرآن الكريم من شبكة المسلم يحتوي على برنامج لعرض سور وصفحات القرآن الكريم وربطها بالتفسير والتراجم
						لعدة لغات وتلاوات للعديد من مشاهير القراء. بالإضافة الى خدمات البحث والتدريب على حفظ القرآن الكريم وتسجيل
						ماتم حفظة لسرعة المتابعة والمراجعة.
					</div>
					<hr />
					<div style="direction:ltr">
						Holy Quran website from muslim-web network contains an application used to browse the Quran chapters and
						verses and links them with different translations and explanations and the recitations of famous reciters.
						In addition to Search capabilities and memorization tools that train the user and can save the memorized
						verses for fast review and follow up.
					</div>
				</div>
				<div id="ProgressPanel">
					<div id="WaitingMsg">
						<?= $Str['page_loading'] ?>
					</div>

					<div id="ProgressBarPanel">
						<div id="ProgressBar">
							<div id="ProgressText"><span id="ProgressValue">0</span>%</div>&nbsp;
						</div>
					</div>

					<div style="color:gray;padding-top:5px">
						<?= $Str['page_loading_help'] ?>.
					</div>
				</div>
			</div>
		</div>

		<div id="idPageViews" mClass="JCQuranViewer" style="display:none;">
			<div id="SuraBar">
				<div id="SuraTools">
					<input type="image" id="ZoomButton" src="images/space.gif" /><input type="image" id="ShowTextBtn"
						src="images/noon2.jpg" onclick="QViewer.openSuraText()" />
				</div>
				<div id="PagesViewControls">
					<div id="PageSpinTable" class="inline" tabindex="0"><span class="inline_title">
							<?= $Str['p'] ?>:
						</span><span mClass="JCSpinEdit" min="1" max="604" id="gPageSpin"></span></div><input type="button"
						id="SpinnerBtn" value="<?= $Str['goto'] ?>" />
					<div id="idPages" title="Current Sura Pages"></div>
				</div>
				<div onclick='QViewer.prevSura()' class='arrowBtn right'></div>
				<div id="SuraTitle"><span id='ViewerSuraName'></span></div>
				<div onclick='QViewer.nextSura()' class='arrowBtn left'></div>
				<div id='idPageViewAudio'></div>
				<div class="inline">
					<!--<span class="help_anchor h_top">-->
					<!--<span class="h_frame">Memorization Chart</span>-->
					<!--<span class="h_arrow"></span>-->
					<!--</span>-->
					<div id="AyatChart"></div>
				</div>
				<div id="SelectionViewer">
					<?= GetStr("selection_help") ?>
				</div>
			</div>
			<table id="idPagesTable" cellpadding="0">
				<tr>
					<td valign="top">
						<div class="anchor">
							<div id="VerseMask">
								<div id="Mask_0"></div>
								<div id="Mask_1"></div>
							</div>
							<div id="Memorized">
								<div id="Memorized_0"></div>
								<div id="Memorized_1"></div>
							</div>
							<div id="Pending">
								<div id="Pending_0"></div>
								<div id="Pending_1"></div>
							</div>
							<div id="VerseSelect">
								<div id="Selection_0"></div>
								<div id="Selection_1"></div>
							</div>
							<div id="VerseHover"></div>
						</div>

						<table cellspacing="0" cellpadding="0" style="direction:ltr" id="PageViewer">
							<tr>
								<td id="PageSide_1">
									<table class="page_header_tbl">
										<tr>
											<td id="idPageSuraName_1" class="full_width"></td>
											<td id="PageMarkCell_1"></td>
											<td id="idPageChapter_1" class="nowrap" style="text-align:right"></td>
										</tr>
									</table>

									<div id="idPageViewFrame_1" class="pageViewFrame" side="1"></div>

									<table class="pageFooter" id="PageFooter_1">
										<tr>
											<td id="LeftNavCell" class="pageNavigator">
												<img src='images/next.gif' border='0' />
												<?= $Str['next'] ?>
											</td>
											<td style='width:100%;height:16px;text-align:center'>
												<span class='btn playBtn res' title="<?= $Str['recite_page'] ?>"
													onclick="QViewer.reciteSide(1)"></span>&nbsp;
												<span id="idPageNo_1"></span>
											</td>
										</tr>
									</table>
								</td>
								<td id="PageSide_0">
									<table class="page_header_tbl">
										<tr>
											<td id="idPageSuraName_0" class="full_width">
											</td>
											<td id="PageMarkCell_0"><span id="idBtnPageMark" class="button"></span></td>
											<td id="idPageChapter_0" class="nowrap" style="text-align:right">
											</td>
										</tr>
									</table>

									<div id="idPageViewFrame_0" side="0" class="pageViewFrame">
									</div>

									<table class="pageFooter" id="PageFooter_0">
										<tr>
											<td style="text-align:center;width:100%;height:16px;">
												<span class='btn playBtn res' title="<?= $Str['recite_page'] ?>"
													onclick="QViewer.reciteSide(0)"></span>&nbsp;
												<span id="idPageNo_0"></span>
											</td>
											<td id="RightNavCell" class="pageNavigator">
												<?= $Str['prev'] ?> <img src="images/prev.gif" border="0" />
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
					<!-- vertical index -->
					<td id="IndexPanel">
						<div mClass="JCTabs" id="idSelectVerticalIndex" pid="VerticalIndex"
							changeHandler="VerticalIndex.onChange()"><span tid="p" pid="Parts" sel="1">
								<?= $Str['parts'] ?>
							</span><span tid="s" pid="Chapters">
								<?= $Str['chapters'] ?>
							</span><span tid="taf" pid="Tafseer">
								<?= $Str['tafseer'] ?>
							</span><span tid="edit" pid="Editor" id="EditTab" style="display:none">edit</span></div>
						<div id="VerticalIndex">
							<div id="Parts"></div>
							<div id="Chapters"></div>
							<div id="Tafseer">
								<div id="TafFrame">
									<table cellspacing="0" cellpadding="0" style="margin-bottom:3px">
										<tr>
											<td>
												<select id='SelTaf'>
													<option value='KATHEER'>
														<?= $Str['katheer'] ?>
													</option>
													<option value='TABARY'>
														<?= $Str['tabary'] ?>
													</option>
													<option value='GALALEEN'>
														<?= $Str['galaleen'] ?>
													</option>
													<option value='KORTOBY'>
														<?= $Str['kortoby'] ?>
													</option>
													<option value='en_yusufali'>English</option>
													<option value='fr_hamidullah'>Français</option>
													<option value='de_bubenheim'>Deutsch</option>
													<option value='tr_ozturk'>Turkish</option>
													<option value='id_muntakhab'>Indoneisan</option>
													<option value='ms_basmeih'>Malayu</option>
												</select>
											</td>
											<td>
												<div id="TafNav" style="display:none">
													<span onclick="TafPage.decrement()" class="arrowBtn right"></span><span id="TafAyaCell"><span
															class="href" onclick="TafPage.gotoAyaPage()" id="TafAya"></span></span><span
														onclick="TafPage.increment()" class="arrowBtn left"></span><span class="tafBtn"
														id="OpenTafBtn"><img src="images/new_window.jpg" /></span>
												</div>
											</td>
										</tr>
									</table>
									<div id='TafText'>
										<div class="litePadding">
											<?= $Str['taf_prompt'] ?>
										</div>
									</div>
								</div>
							</div>
						</div>
					</td>
				</tr>
			</table>
		</div>
	</div>

	<div id="Footer" style="border-top:solid 1px silver">
		<table>
			<tr>
				<td>
					<span class="href" onclick="HomePage.showHelp()">
						<?= GetStr('help') ?>
					</span>
				</td>
				<td> | <a href="https://www.facebook.com/quran.hafiz.page" target="_blank">
						<?= $Str['guest_page'] ?>
					</a></td>
				<td id="FeedbackInfo"> |
					<span>
						<?= $Str['footer_note'] ?>
						<A href="mailto:webmaster@muslim-web.com">webmaster@muslim-web.com</A>
					</span> |
					<span id="PrayRequest">
						<?= $Str['prayer_request'] ?>
					</span>
				</td>
			</tr>
		</table>
		<div id="fb-root"></div>
		<!-- script src="http://connect.facebook.net/en_US/all.js#appId=6254142583&amp;xfbml=1"></script><fb:comments href="quran.muslim-web.com" num_posts="4" width="400"></fb:comments -->
	</div>

	<div id="HelpBox" style="display:none">
		<div id="HelpFrame">
			<div class="helpTopic">
				<?= GetStr("help_topic_4") ?>.
			</div>
			<hr />
			<div class="helpTopic">
				<?= GetStr("help_topic_1") ?>.
			</div>
			<hr />
			<div class="helpTopic">
				<?= GetStr("help_topic_2") ?>.
			</div>
			<hr />
			<div class="helpTopic">
				<?= GetStr("help_topic_3_1") ?>
				<a target="_blank"
					href="http://www.real.com/realcom/R?href=http%3A%2F%2Fforms.real.com%2Freal%2Frealone%2Frealone.html%3Ftype%3Ddlrhap_bb&pageid=realplayerPage&pageregion=right_bottom_text&src=downloadr%2Crpchoice%2Crealplayer_8020&pcode=rn&opage=realplayer_8020">
					Real&nbsp;Player</a>.<br />
				<?= GetStr("help_topic_3_2") ?>,
				<a target="_blank"
					href="http://www.real.com/realcom/R?href=http%3A%2F%2Fforms.real.com%2Freal%2Frealone%2Frealone.html%3Ftype%3Ddlrhap_bb&pageid=realplayerPage&pageregion=right_bottom_text&src=downloadr%2Crpchoice%2Crealplayer_8020&pcode=rn&opage=realplayer_8020">
					<?= GetStr("click_here") ?>
				</a>
				<?= GetStr("help_topic_3_3") ?>.
			</div>
		</div>
	</div>

	<div id="HiddenUI" style="display:none">
		<div id="ConfirmUpdate">
			<div class="popupMsg">
				<?= GetStr("update_mem_desc") ?>
			</div>
			<div class="buttonsBar">
				<input type="button" value="<?= GetStr("ok") ?>" onclick="IMember.syncMemorization();" />
			</div>
		</div>
		<div id="CopyText">
			<div><textarea id="CopyTextArea" style="width:100%;box-sizing:border-box;height:150px"></textarea></div>
			<div class="buttonsBar">
				<input type="button" value="<?= GetStr("copy_selected") ?>" onclick="doCopyText();" />
			</div>
		</div>
		<div id="idRecitersPanel">
			<div id="idRecentReciters"></div>
			<div id="idListFilters" style="padding:2px;"></div>
			<div id="idReciterList"></div>
			<div id="RecitersFootnote">
				<?= GetStr("reciter_footnote") ?>
			</div>
		</div>
		<div id="UserOptions">
			<div class='menu_item' onclick="IMember.showLoginForm();">
				<?= $Str['other_user'] ?>
			</div>
			<div class='menu_item' onclick="IMember.showNewUserForm();">
				<?= $Str['new_user'] ?>
			</div>
			<div class='menu_item' onclick="IMember.logout()">
				<?= $Str['logout'] ?>
			</div>
		</div>

		<div id="LoginPanel">
			<div id="LoginFormPanel">
				<form id="idLoginForm" onsubmit="return IMember.login(this)">
					<div><span>
							<?= $Str['login_name'] ?>
						</span><input name="lname" type="text" /></div>
					<div><span>
							<?= $Str['password'] ?>
						</span><input name="pw" type="password" /></div>
					<div><input name="newuser" type="checkbox" onclick="IMember.toggleNewUser(this.checked)" />
						<?= $Str['new_member'] ?>
					</div>
					<div id="idEmail" style="display:none">
						<input name="keepdata" type="checkbox" checked="1" />
						<?= $Str['keep_mem_data'] ?>
						<div><span>
								<?= $Str['email'] ?>
							</span><input name="email" type="text" /></div>
					</div>
					<div class="buttonsBar">
						<input type="submit" id="idBtnLogin" value="<?= $Str['login'] ?>" />
						<input id="idCancelLogin" type="button" value="<?= $Str['cancel'] ?>" />
					</div>
				</form>
			</div>
			<div id="LoginProgress" style="color:green;display:none">
				<?= $Str['contacting_db'] ?>..
			</div>
		</div>
	</div>
	<!-- <div id="flashContent"></div> -->

</body>

</html>