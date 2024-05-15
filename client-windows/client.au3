$title = "Soundboard"
$text  = "Sounds of the Soundboard will be played on this PC. Click on the icon to close the client."
$pause = "Pause"
$exit  = "Exit"
$register_error = "Failed to register the client. Check the URL in the .ini file. Exiting..."
$download_error = "Downloading failed."
$playback_error = "Playback failed."

$ini = @ScriptDir &"\client.ini"
$url = IniRead($ini, "Soundboard", "url", "http://127.0.0.1")
$cmd = IniRead($ini, "Soundboard", "playbackcmd", "mpv.exe --af=lavfi=dynaudnorm --af-add=lavfi=[apad=pad_dur=1] --no-audio-display")
$lag = IniRead($ini, "Soundboard", "querydelay", 1000)
IniWriteSection($ini, "Soundboard", "url="& $url &@LF&"playbackcmd="& $cmd &@LF&"querydelay="& $lag)

Opt("TrayAutoPause", 0)
TraySetToolTip($title)
TrayItemSetText(3, $exit)
TrayItemSetText(4, $pause)
TrayTip($title, $text, 10, 1)
DirCreate(@ScriptDir &"\uploads")

$registered = InetRead($url &"/client.php?register=1", 1)
If $registered <> "1" Then
	TrayTip($title, $register_error, 10, 16)
	Exit
Else
	OnAutoItExitRegister("Unregister")
EndIf

While 1
	$queue = InetRead($url &"/queue.php", 1)
	If @extended > 0 Then
		$queue = StringSplit(BinaryToString($queue), @CR&@LF, 3)
		For $sound In $queue
			Play($sound)
		Next
	Else
		Sleep($lag)
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
		$proc = Run($cmd &" """& @ScriptDir &"\uploads\"& $sound &"""", @ScriptDir, @SW_MINIMIZE)
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

Func Unregister()
	InetRead($url &"/client.php?register=0", 1)
EndFunc