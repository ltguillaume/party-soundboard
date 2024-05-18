<?php
//header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.//header('Pragma: no-cache'); // HTTP 1.0.//header('Expires: 0'); // Proxies.

$page = file_get_contents('soundboard.htm');
$remoteplay = $_GET['remoteplay'] == '1' || file_get_contents('remoteplay') == '1' ? 1 : 0;
$contents = "<script>document.remoteplay = $remoteplay;</script>";

if (!isset($_GET['credits']) && $dir = opendir('sounds')) {
	while (false !== ($sound = readdir($dir)))
		if ($sound[0] != '.')
			$sounds[] = $sound;

	rsort($sounds);

	$index = 1;
	foreach ($sounds as $sound) {
		$id = 's'. $index;
		$handle = @fopen('sounds/' . $sound, 'r');
		$file = rtrim(fgets($handle));
		$desc = rtrim(fgets($handle));
		$user = rtrim(fgets($handle));
//		$userpic = file_exists('users/'. iconv("UTF-8", "Windows-1252", strtolower($user) .'.jpg')) ? 'users/'. rawurlencode(iconv("UTF-8", "Windows-1252", strtolower($user))) .'.jpg' : 'images/userdef.jpg';
		$userpic = file_exists('users/'. strtolower($user) .'.jpg') ? 'users/'. rawurlencode(strtolower($user) .'.jpg') : 'images/userdef.jpg';
		$contents .= 	'<div class="sound" id="'. $id .'" sound="'. $sound .'" src="'. $file .'" onclick="play(this)">
							<img class="userpic" alt="" src="' . $userpic .'"/>
							<div class="description">'. $desc .'</div>
							<div class="user">'. $user .'</div>
							<div class="playing" id="'. $id .'-playing"></div>
						</div>';
		fclose($handle);
		$index++;
	}

	closedir($dir);
}

$page = str_replace('{contents}', $contents, $page);
echo $page;
?>