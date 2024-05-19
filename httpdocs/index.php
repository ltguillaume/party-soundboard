<?php
//error_reporting(E_ALL);
//header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.//header('Pragma: no-cache'); // HTTP 1.0.//header('Expires: 0'); // Proxies.

@include 'config.php';

$page = file_get_contents('index.tpl');
$strings = json_decode(file_get_contents('strings.json'));
$langs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
foreach($langs as $lang) {
	$langcode = substr($lang, 0, 2);
	if ($strings->$langcode) {
		$strings = $strings->$langcode;
		break;
	}
}
if ($strings->en)
	$strings = $strings->en;

switch($_SERVER['QUERY_STRING']) {
	case 'admin':
	case 'soundboard':
		$title = $strings->soundboard;
		$body = soundboard();
		break;
	case 'credits':
		$title = $strings->credits;
		$body = file_get_contents('credits.tpl');
		break;
	default:
		if ($partyUrl) {
			$title = $strings->landing;
			$body = file_get_contents('landing.tpl') . "<script>const partyUrl = '$partyUrl'</script>";
		} else {
			$title = $strings->soundboard;
			$body = soundboard();
		}
}

foreach($strings as $str => $value)
	$body = str_replace('{'. $str .'}', $value, $body);
$page = str_replace('{title}', $title, $page);
$page = str_replace('{body}', $body, $page);

echo $page;

function soundboard() {
	$body = file_get_contents('soundboard.tpl');
	$empty = 1;

	if ($dir = opendir('sounds')) {
		while (($sound = readdir($dir)) !== false)
			if ($sound[0] != '.')
				$sounds[] = $sound;

		if ($sounds) {
			$empty = 0;
			rsort($sounds);
			$index = 1;
			foreach ($sounds as $sound) {
				$id = 's'. $index;
				$handle = @fopen('sounds/' . $sound, 'r');
				$file = rtrim(fgets($handle));
				$desc = rtrim(fgets($handle));
				$user = rtrim(fgets($handle));
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

		$remoteplay = $_GET['remoteplay'] == '1' || file_get_contents('remoteplay') == '1' ? 1 : 0;
		$contents .= "<script>document.remoteplay = $remoteplay; document.empty = $empty</script>";
		$body = str_replace('{contents}', $contents, $body);
	}
	return $body;
}

?>