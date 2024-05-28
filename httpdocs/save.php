<?php

@include 'config.php';

if ($NOUPLOAD ?? false)
	return http_response_code(405);
if (isset($_GET['check']))
	return;

$source = $_FILES['sound']['tmp_name'] ?? false;
$name = $_FILES['sound']['name'] ?? false;
$desc = $_POST['desc'] ?? '';
$user = $_POST['user'] ?? '';

if (!is_uploaded_file($source))
	return http_response_code(413);
if (!$source || !$name)
	return http_response_code(400);

$time = time();
$path_parts = pathinfo($name);
do $sound = time() .'_'. preg_replace('([^\w\s\d\.\-_~,;:\[\]\(\]]|[\.]{2,})', '', $desc);
while (file_exists($sound));
$upload = $sound .'.'. $path_parts['extension'];
$contents = $upload ."\r\n". ucfirst($desc) ."\r\n". ucfirst($user);

if (!move_uploaded_file($source, 'uploads/'. $upload))
	return http_response_code(500);

if (!file_put_contents('sounds/'. $sound, $contents, LOCK_EX))
	return http_response_code(507);

?>