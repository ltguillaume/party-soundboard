<?php

@include 'config.php';

$pass  = $password ?? 'party time excellent';
$file = $_POST['file'] ?? false;
$input = $_POST['password'] ?? false;

if (!$file)
	return http_response_code(400);
if ($input != $pass)
	return http_response_code(401);
if (!rename("sounds/$file", "sounds/.$file"))
	return http_response_code(410);

?>