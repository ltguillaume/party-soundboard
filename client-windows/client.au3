$title = "Soundboard"
$text = "Sounds of the Soundboard will be played back on this PC. Klik on the icon to close the client."
$download_error = "Download failed."
$playback_error = "Playback failed."
$url = IniRead(@ScriptDir &"\client.ini", "Soundboard", "url", "")

Opt("TrayAutoPause", 0)
TraySetToolTip($title)
TrayTip($title, $text, 5000, 1)
DirCreate(@ScriptDir &"\uploads")

While 1
	$queue = InetRead($url &"/queue.php", 1)
	If @extended > 0 Then
		$queue = StringSplit(BinaryToString($queue), @CR&@LF, 3)
		For $sound In $queue
			Play($sound)
		Next
	Else
		Sleep(2000)
	EndIf
WEnd

Func Play($sound)
	If StringLen($sound) > 3 Then
		If FileGetSize(@ScriptDir &"\uploads\"& $sound) = 0 Then
			If InetGet($url &"/uploads/"& $sound, @ScriptDir &"\uploads\"& $sound) = 0 Then
				TrayTip($title, $download_error & @LF & $url &"/uploads/"& $sound & @LF & @ScriptDir &"\uploads\"& $sound & @LF &"@error: "& @error, 5000, 3)
				Return
			EndIf
		EndIf
		$proc = Run(@ScriptDir &"\mpv.com --af=drc=1:1 """& @ScriptDir &"\uploads\"& $sound &"""", @ScriptDir, @SW_MINIMIZE)
		If $proc = 0 Then
			TrayTip($title, $playback_error & @LF &"@error: "& @error, 5000, 3)
		Else
			$sound = StringLeft($sound, StringInStr($sound, ".", Default, -1) -1)
			$sounddata = BinaryToString(InetRead($url &"/sounds/"& $sound))
			If $sounddata <> "" Then
				$sounddata = StringSplit($sounddata, @CR&@LF, 3)
				TrayTip($sounddata[1], $sounddata[2], 2, 16)
				FileWriteLine(@ScriptDir &"\playbacklog.txt", @YEAR&"-"&@MON&"-"&@MDAY&" "&@HOUR&":"&@MIN&":"&@SEC&@TAB& $sounddata[1] &" - "& $sounddata[2])
			Else
				TrayTip("", $sound, 2, 16)
				FileWriteLine(@ScriptDir &"\playbacklog.txt", @YEAR&"-"&@MON&"-"&@MDAY&" "&@HOUR&":"&@MIN&":"&@SEC&@TAB& $sound)
			EndIf
			ProcessWaitClose($proc)
		EndIf
	EndIf
EndFunc