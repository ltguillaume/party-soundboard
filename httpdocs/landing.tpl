<div id="navbar">
	<div id="title" onclick="refresh()">{landing}</div>
	<div id="buttons"><img title="{refresh}" onclick="refresh()" src="images/refresh.svg" alt=""></div>
</div>
<div id="contents">
	<button id="soundboardbtn" class="navbtn" onclick="location.search = 'soundboard'"><h1><img src="images/record.svg" width="100px"></h1>{play-record}</button>
	<button id="playlistbtn" class="navbtn" onclick="location.assign(partyUrl)"><h1><img src="images/playlist.svg" width="100px"></h1>{request}</button>
</div>
<div class="bottomnav">
	<div onclick="location.search = 'credits'">{credits}</div>
</div>