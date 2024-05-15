<?php
if (file_get_contents('remoteplay') == '0')
	exit();
$filename = 'queue.lst';
$queue_handle = fopen($filename, 'r+');
$locked = flock($queue_handle, LOCK_EX);
if ($locked || !file_exists($filename)) {
	$queue = file_put_contents($filename, $_GET['file'] ."\r\n", FILE_APPEND);
}
fclose($queue_handle);
?>