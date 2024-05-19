<?php

if (is_uploaded_file($_FILES['sound']['tmp_name']))
{
	$time = time();
	$source = $_FILES['sound']['tmp_name'];
	$path_parts = pathinfo($_FILES['sound']['name']);
	$sound = time() ."_". preg_replace("([^\w\s\d\.\-_~,;:\[\]\(\]]|[\.]{2,})", '', $_POST['desc']);
	while (file_exists($sound))
		$sound = time() ."_". preg_replace("([^\w\s\d\.\-_~,;:\[\]\(\]]|[\.]{2,})", '', $_POST['desc']);
	$upload = $sound .'.'. $path_parts['extension'];

	if (move_uploaded_file($source, 'uploads/'. $upload)) {
		$sounddesc = $upload ."\r\n". ucfirst($_POST['desc']) ."\r\n". ucfirst($_POST['user']);
		if (file_put_contents('sounds/'. $sound, $sounddesc)) {
			header('Location: index.php?soundboard');
		} else {
			echo "<p style='color:red'>You broke it! (file_put_contents)";
		}
	} else {
		die("<p style='color:red'>Something went wrong while moving ". $_FILES['sound']['name'] ." on the server from ". $source ." to ". $upload);
	}
} else {
	die("<p style='color:red'>Your file is too big or something went wrong while uploading ". $_FILES['sound']['name']);
}
?>