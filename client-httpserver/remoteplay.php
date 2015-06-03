<?php
$server = 'http://server-address.com';
$url = $_GET['file'];
date_default_timezone_set("Europe/Amsterdam");
if (!file_exists(dirname(__FILE__) .'/uploads/'. $url)) {
	if (!is_dir('uploads')) mkdir('uploads');
	$dl = file_put_contents('uploads/'. $url, fopen($server .'/uploads/'. rawurlencode($url), 'r'));
	file_put_contents (dirname(__FILE__) .'/playback.log',  date('Y-m-d H:i:s') . ($dl ? ' +' : ' !!!') . $url ."\r\n", FILE_APPEND);
}
exec('start /min "" "'. dirname(__FILE__) .'/mpv.com" --af=drc=1:1 "'. dirname(__FILE__) .'/uploads/'. $url .'"');
file_put_contents (dirname(__FILE__) .'/playback.log',  date('Y-m-d H:i:s') .' '. $url ."\r\n", FILE_APPEND);
?>