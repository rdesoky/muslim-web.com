<div style="padding:10px">
<?php
// Copyright 2007 Facebook Corp.  All Rights Reserved. 
// 
// Application: kobool
// File: 'index.php' 
//   This is a sample skeleton for your application. 
// 
require_once 'facebook.php';
$appapikey = 'e490d16e4685507b8be762ea836c82ef';
$appsecret = '6f63a0c583757629441851220e59ae20';
$facebook = new Facebook($appapikey, $appsecret);
$user_id = $facebook->require_login();
?>

<p>Hello, <fb:name uid="<?php echo $user_id; ?>" useyou="false" />!
</p>


Friends:

<table>
<?php
// Print out at most 25 of the logged-in user's friends,
// using the friends.get API method

$friends = $facebook->api_client->friends_get();

$friends = array_slice($friends, 0, 25);
$friends_info = $facebook->api_client->users_getInfo($friends,"name,pic_square,current_location");

foreach( $friends_info as $friend_info ) 
{
	$friend_id = $friend_info['uid'];
	$img_url = $friend_info['pic_square'];
	$img_url = $img_url ? $img_url : "http://static.ak.fbcdn.net/pics/t_default.jpg";
	$friend_name = $friend_info['name'];
	$friend_country = $friend_info['current_location'][0];

echo <<<EOT
		<tr><td>
				<a href="http://www.facebook.com/profile.php?id=$friend_id">
					<img width="50" src="$img_url">
				</a>
			</td>
			<td>
				<a href="http://www.facebook.com/profile.php?id=$friend_id">
					$friend_name
				</a>
			</td>
			<td>
				<a href="http://www.facebook.com/profile.php?id=$friend_id">
					$friend_country
				</a>
			</td>
		</tr>
EOT;
}

echo "</table>";

?>
</div>