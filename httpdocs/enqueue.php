<?php

$file = file_get_contents('php://input') ?? false;

if (!$file)
	return http_response_code(400);
if (!file_exists('uploads/'. $file))
	return http_response_code(410);
if (file_get_contents('client.id') == '0')
	return http_response_code(503);
if (!file_put_contents('client.cue', (filesize($queue) == 0 ? '' : "\r\n") . $file, FILE_APPEND | LOCK_EX))
	http_response_code(507);

?>