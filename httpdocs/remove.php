<?php
	$password = 'begone';

	$file = $_POST['file'];
	$pass = $_POST['password'];
	if ($pass == $password)
		rename("sounds/$file", "sounds/.$file");
	header('Location: soundboard.php?admin');
?>