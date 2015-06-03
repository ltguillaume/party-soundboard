<?php
$filename = 'queue.lst';
$queue_handle = fopen($filename, 'r+');
$locked = flock($queue_handle, LOCK_EX);
if ($locked) {
	fpassthru($queue_handle);
	ftruncate($queue_handle, 0);
}
fclose($queue_handle);
?>