<?php
require_once 'myfacebook.php';

$facebook	= new Facebook($appapikey, $appsecret);

$action = GetParam("action","");
$page	= GetParam("page", "");

if( $action == "add" )
{
	$user_id = $facebook->require_add();
}
else if( $action == "login" )
{
	$user_id = $facebook->require_login();
}
else
{
	if( $page == "" )
	{
		$user_id = $facebook->get_loggedin_user();
	}
	else
	{
		$user_id = $facebook->require_login();
	}
}

unset( $facebook );

require_once ( $lang = DetectLanguage() ) . '_strings.php';
$other_lang = ($lang == "ar") ? "en" : "ar";
$direction = ( $lang == "ar" ) ? " dir=RTL " : " dir=LTR ";

setcookie("lang", $lang, time() + ( 86400 * 365 ) );

if( $page == "tab" )
{
	exit( "<fb:fbml>" . ComposeProfileFBML($user_id,16) . "</fb:fbml>" );
}

?>
<fb:fbml>
<div <?=$direction?>>
<?php 
if($user_id)
{
?>
	<fb:if-user-has-added-app>
		<fb:dashboard>
			<fb:action href="http://www.facebook.com/apps/application.php?id=<?=$appid?>"><?=$str_table["back2page"]?></fb:action>
		</fb:dashboard>
		<fb:else>
			<fb:dashboard>
				<fb:create-button href="?action=add"><?=$str_table["add_app"]?></fb:create-button>
				<fb:action href="http://www.facebook.com/apps/application.php?id=<?=$appid?>"><?=$str_table["back2page"]?></fb:action>
			</fb:dashboard>
		</fb:else>
	</fb:if-user-has-added-app>
<?php 
}
else
{
?>
	<fb:dashboard>
		<fb:action href="http://www.facebook.com/apps/application.php?id=<?=$appid?>"><?=$str_table["back2page"]?></fb:action>
		<fb:action href="?action=login"><?=$str_table["login"]?></fb:action>
	</fb:dashboard>

<?php 
}

?>

</div>
	<fb:tabs>
		<fb:tab-item href="?page=" title="<?=$str_table['exercise']?>" <?= ($page=="") ? "selected='true'" : "" ?>/>
		<fb:tab-item href="?lang=<?=$other_lang?>" title="<?=$str_table['other_lang']?>" />
		<fb:tab-item href="?page=chart" title="<?=$str_table['chart']?>" <?= ($page=="chart") ? "selected='true'" : "" ?> />
		<fb:tab-item href="?page=invite" title="<?=$str_table['invite']?>" <?= ($page=="invite") ? "selected='true'" : "" ?> />
	</fb:tabs>

<?php if( $page == "invite" ) { ?>

	<fb:request-form 
		action="" 
		method="POST" 
		invite="true" 
		type="<?=$app_title?>" 
		content= "Memorize Quran and strengthen your memory and Arabic typing skills. You will be able to type Arabic text using your keyboard even if it doesn't support it.<?= htmlentities("<fb:req-choice url=\"http://apps.facebook.com/${canvas_name}/?page=\" label=\"Sure! Let me try it.\"") ?>"
	>

		<fb:multi-friend-selector 
			showborder="false" 
			actiontext="<?= $str_table["invite_title"] ?>"
		/>
	</fb:request-form>

<?php }else{ ?>
	<fb:iframe src="http://cgi.muslim-web.com/<?=$app_folder?>/<?= ( $page == 'chart' ? 'mem_chart.php' : 'index.php' ) . '?lang=' . $lang ?>" 
		frameborder="0" 
		scrolling="auto" 
		smartsize 
		width="100%" 
		height="600"/>
<?php } ?>

</fb:fbml>
