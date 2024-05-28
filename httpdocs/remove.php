<?php

@include 'config.php';
$password = $PASSWORD ?? 'party time excellent';

$file = $_POST['file'] ?? false;
$passSent = $_POST['password'] ?? false;

if (!$file)
	return http_response_code(400);
if ($passSent != $password)
	return http_response_code(401);
if (!rename("sounds/$file", "sounds/.$file"))
	return http_response_code(410);

?>