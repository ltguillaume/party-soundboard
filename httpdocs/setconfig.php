<?php

@include 'config.php';
$noUpload = $NOUPLOAD ?? false;
$partyUrl = $PARTYURL ?? '';
$password = $PASSWORD ?? 'party time excellent';

if (isset($_GET['get'])) {
	echo json_encode([
		'no-upload' => $noUpload,
		'party-url' => $partyUrl
	]);
	return;
}

$passSent = $_POST['password'] ?? false;

if ($passSent != $password)
	return http_response_code(401);

$newPass = $_POST['new-password'] ?? false;

$keys = [
	'NOUPLOAD' => $_POST['no-upload'] ?? false,
	'PARTYURL' => $_POST['party-url'] ?? false,
	'PASSWORD' => $newPass ?: $password
];

$newConfig = '<?php'. PHP_EOL . PHP_EOL;
foreach($keys as $key => $value) {
	if (strpos($value, '"') !== false)
		return http_response_code(406);
	$newConfig .= "$$key = \"$value\";". PHP_EOL;
}
$newConfig .= PHP_EOL .'?>';

if (!file_put_contents('config.php', $newConfig, LOCK_EX))
	http_response_code(507);

?>