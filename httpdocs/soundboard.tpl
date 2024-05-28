<div id="navbar">
	<div id="title" onclick="adminMode ? adminSwitch() : refresh()" oncontextmenu="adminSwitch(event)" data-admin-title="{admin-title}" data-title="{soundboard}">{soundboard}</div>
	<div id="buttons"><img id="output" title="{output}" onclick="outputSwitch()" src="images/switch-off.svg" alt=""><img title="{record}" onclick="recordSwitch()" src="images/record.svg" alt=""><img title="{refresh}" onclick="refresh()" src="images/refresh.svg" alt=""></div>
	<div id="outputbar" data-client-change="{client-change}" data-client-found="{client-found}" data-client-gone="{client-gone}" data-file-gone="{file-gone}" onclick="clientSwitch()"><img id="outputicon" src="images/switch-on.svg" height="12px"> <span id="outputmsg" data-client-switch="{client-switch}" data-remote-play="{remote-play}">{remote-play}</span></div>
	<form id="clientform" class="hidden"><input type="password" name="password" placeholder="{password}..."><input type="submit" value="{register}" onclick="clientRegister(event)"></form>
</div>
<form id="configform" class="hidden wideform" data-no-quotes="{no-quotes}">
	<input type="checkbox" id="no-upload" name="no-upload"><label for="no-upload">{no-upload}</label>
	<input type="url" name="party-url" placeholder="{party-url}...">
	<input type="password" name="new-password" placeholder="{new-password}...">
	<input type="password" name="password" placeholder="{password}...">
	<input type="submit" value="{send}" onclick="setConfig(event)">
</form>
<div id="contents" data-playing="{playing}" data-password="{password}" data-remove="{remove}" data-error-refresh="{error-refresh}">
	{contents}
</div>
<div id="bottomnav" class="bottomnav">
	<div id="adminbtn" class="hidden" data-admin-prompt="{admin-prompt}" onclick="adminSwitch()">{admin}</div>
	<div onclick="location.search = 'credits'">{credits}</div>
</div>
<div id="recpanel">
	<h3>{record-msg}</h3>
	<center id="record">
		<button id="recordbtn" onclick="recStartStop()" data-record="{record}" ><h1>⏺️</h1>{record}</button>
		<button id="playbtn" onclick="playStartStop()" data-play="{play}" disabled><h1>▶️</h1>{play}</button>
	</center>
	<form id="recform" class="wideform" data-no-recording="{no-recording}" data-no-name="{no-name}" data-no-title="{no-title}" data-no-upload="{no-upload}" data-too-long="{too-long}" data-error-saving="{error-saving}">
		<input type="file" name="sound" accept="audio/*" capture="user" hidden>
		{your-name}:
		<input type="text" name="user" autocapitalize="sentence">
		{description}:
		<input type="text" name="desc" autocapitalize="sentence">
		<br><br>
		<input type="button" name="cancel" value="{cancel}" onclick="recordSwitch()">
		<input type="submit" name="send" value="{send}" onclick="save(event)">
	</form>
</div>
<audio id="local-play"></audio>