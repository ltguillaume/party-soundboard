<div id="navbar">
	<div id="title" onclick="adminmode ? adminSwitch() : refresh()" oncontextmenu="adminSwitch(event)">{soundboard}</div>
	<div id="buttons"><img id="output" class="hidden" title="{output}" onclick="outputSwitch()" src="images/switch-on.svg" alt=""><img title="{record}" onclick="recordSwitch()" src="images/record.svg" alt=""><img title="{refresh}" onclick="refresh()" src="images/refresh.svg" alt=""></div>
	<div id="outputmsg"><img src="images/switch-on.svg" height="12px"> {output-msg}</div>
</div>
<div id="contents" data-playing="{playing}" data-password="{password}" data-remove="{remove}">
	{contents}
	<div id="bottomnav">
		<div id="adminbtn" class="hidden" data-admin-mode="{admin-mode}" data-admin-title="{admin-title}" onclick="adminSwitch()">{admin}</div>
		<div onclick="location.search = 'credits'">{credits}</div>
	</div>
</div>
<div id="form" data-no-recording="{no-recording}" data-no-name="{no-name}" data-no-title="{no-title}" data-too-long="{too-long}">
	<h3>{record-msg}</h3>
	<center id="record">
		<button id="recordbtn" onclick="recStartStop()" data-record="{record}" ><h1>⏺️</h1>{record}</button>
		<button id="playbtn" onclick="playStartStop()" data-play="{play}" disabled><h1>▶️</h1>{play}</button>
	</center>
	<form name="sbForm" action="save.php" onsubmit="return validate()" method="post" enctype="multipart/form-data">
		<input id="sound" type="file" name="sound" accept="audio/*" capture="user" hidden>
		{your-name}:
		<input type="text" name="user" autocapitalize="sentence">
		{rec-title}:
		<input type="text" name="desc" autocapitalize="sentence">
		<br><br>
		<input type="button" value="{cancel}" onclick="recordSwitch()">
		<input type="submit" value="{send}">
	</form>
</div>
<audio id="localplay"></audio>