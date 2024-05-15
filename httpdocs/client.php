<?php
	if (isset($_GET['register'])) {
		$remoteplay = $_GET['register'] == '1' ? 1 : 0;
		file_put_contents('remoteplay', $remoteplay);
	} else
		$remoteplay = file_get_contents('remoteplay');
	echo $remoteplay;
?>