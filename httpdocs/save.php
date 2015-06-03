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
			echo '<script type="text/javascript">location.replace("soundboard.php");</script>';
		} else {
			echo "<p style='color:red'>Je hebt 't kapotgemaakt! (file_put_contents)";
		}
	} else {
		die("<p style='color:red'>Er is iets misgegaan bij het verplaatsen van ". $_FILES['sound']['name'] ." op de server van ". $source ." naar ". $upload);
	}
} else {
	die("<p style='color:red'>Je hebt geen of vulste groot bestand gekozen of er ging wa mis bij het uploaden ". $_FILES['sound']['name']);
}
?>