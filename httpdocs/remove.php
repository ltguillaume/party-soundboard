<?php
	@include 'config.php';

	$file = $_POST['file'];
	$pass = $_POST['password'];
	if ($file && $pass == ($password ?? 'begone'))
		rename("sounds/$file", "sounds/.$file");
	header('Location: index.php?admin');
?>