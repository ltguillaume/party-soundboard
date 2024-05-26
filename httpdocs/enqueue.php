<?php

$file = file_get_contents('php://input') ?? false;

if (!$file)
	return http_response_code(400);
if (!file_exists('uploads/'. $file))
	return http_response_code(410);
if (file_get_contents('client.id') == '0')
	return http_response_code(503);

$queue = 'client.cue';
$handle = fopen($queue, 'r+');
$locked = flock($handle, LOCK_EX);
if ($locked || !file_exists($queue))
	if (!file_put_contents($queue, (filesize($queue) == 0 ? '' : "\r\n") . $file, FILE_APPEND))
		http_response_code(507);
fclose($handle);

?>