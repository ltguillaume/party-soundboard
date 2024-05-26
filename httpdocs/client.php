<?php

$check = isset($_GET['check']);
$clientIdFile = 'client.id';
$clientId = file_get_contents($clientIdFile);
if ($check && $clientId == '0')
	exit('0');

@include 'config.php';

$password = $config->password ?? 'party time excellent';
$passHash = hash('sha256', $password);
$passSent = $_POST['password'] ?? false;

if (session_status() != PHP_SESSION_ACTIVE)
	session_start([
		'cache_limiter'   => 'nocache',
		'cookie_httponly' => 1,
		'cookie_lifetime' => 0,
		'cookie_samesite' => 'strict',
		'cookie_secure'   => 1
	]);

$play = isset($_GET['play']);
$register = isset($_GET['register']);
$deregister = isset($_GET['deregister']);
$sessionId = $_SESSION['id'] ?? false;

if ($check)
	exit($clientId == $sessionId ? '0' : '1');

$passed = $passSent == $password;
if (!$passed) $passed = ($_SESSION['hash'] ?? false) == $passHash;
if (!$passed) return http_response_code(401);

if ($play) {
	if ($sessionId != $clientId)
		return http_response_code(409);
	$queue = 'client.cue';
	if (filesize($queue) == 0)
		return http_response_code(204);
	$handle = fopen($queue, 'r+');
	$locked = flock($handle, LOCK_EX);
	if ($locked) {
		fpassthru($handle);
		ftruncate($handle, 0);
	}
	return fclose($handle);
}

if ($register) {
	$_SESSION['id'] = $clientId = uniqid();
	$_SESSION['hash'] = $passHash;
}

if ($deregister) {
	if (session_status() == PHP_SESSION_ACTIVE) {
		session_unset();
		session_destroy();
	}
	if ($sessionId != $clientId)
		return http_response_code(401);
	else
		$clientId = 0;
}

if (!file_put_contents($clientIdFile, $clientId))
	http_response_code(507);

?>