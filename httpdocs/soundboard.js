const maxRecordingTime = 30;	// in seconds
const localplay = document.getElementById('localplay') || null;
if (localplay) localplay.onended = playingEnded;
let remoteplay = adminmode = playingid = false;
if (document.getElementById('output') && document.remoteplay == 1)
	outputSwitch(true);
if (location.search == '?admin') adminSwitch();
if (location.search == '?credits') credits();
if (/^((?!chrome).)*safari/i.test(navigator.userAgent))
	adminbtn.classList.remove('hidden');
function outputSwitch(registered = false) {
	remoteplay = registered ? true : !remoteplay;
	if (registered && localStorage.getItem('remoteplay') == 'false')
		remoteplay = false;
	output.src = remoteplay ? 'images/switch-on.svg' : 'images/switch-off.svg';
	if (registered) output.classList.remove('hidden');
	if (remoteplay)
		outputmsg.classList.remove('hidden');
	else
		outputmsg.classList.add('hidden');
	if (!registered)
		localStorage.setItem('remoteplay', remoteplay);
}
function adminSwitch(e = false) {
	if (e) e.preventDefault();
	if (adminmode)
		refresh();
	else if (location.search == '?admin' || confirm('Enter admin mode?')) {
		adminmode = true;
		title.textContent = 'Admin🛡';
	}
}
async function credits() {
	const response = await fetch('credits.htm');
	contents.innerHTML = await response.text();
	window.scroll(0,0);
}
async function recordSwitch() {
	const showing = (form.style.display == 'block' ? true : false);
	if (!showing) await tryInBrowserRecording();
	contents.style.display = (showing ? 'block' : 'none');
	form.style.display = (showing ? 'none' : 'block');
}
function refresh() {
	location.href = location.href.replace(location.search, '');
}
function play(el) {
	if (adminmode) return remove(el);
	if (playingid) return false;
	playingid = el.getAttribute('id');
	const file = el.getAttribute('src');
	const sound = document.getElementById(playingid),
		playing = document.getElementById(playingid +'-playing');
	playing.style.display = 'block';
	playing.innerHTML ='Playing...';
	sound.classList.add('selected');
	if (remoteplay) {
		fetch('remoteplay.php?file='+ file);
		setTimeout(playingEnded, 5000);
	} else {
		localplay.src = 'uploads/'+ file;
		localplay.play();
	}
}
function playingEnded() {
	if (form.style.display == 'block') {
		stopTimer(playbtn);
		playbtn.timer = 0;
	} else {
		document.getElementById(playingid +'-playing').style.display = 'none';
		document.getElementById(playingid).classList.remove('selected');
		playingid = false;
	}
};
function remove(el) {
	if (el.removing) return false;
	el.removing = true;
	const delForm = document.createElement('form'),
		fileInput = document.createElement('input'),
		passInput = document.createElement('input'),
		submitBtn = document.createElement('input');
	fileInput.name = 'file';
	fileInput.value = el.getAttribute('sound');
	fileInput.hidden = true;
	delForm.action = 'remove.php';
	delForm.method = 'post';
	passInput.name = passInput.type = 'password';
	passInput.placeholder = 'Password...';
	submitBtn.name = submitBtn.type = 'submit';
	submitBtn.value = 'Remove';
	delForm.appendChild(fileInput);
	delForm.appendChild(passInput);
	delForm.appendChild(submitBtn);
	el.appendChild(delForm);
}
function validateX(x, msg) {
	if (x == 0 || x == null || x == '') {
		alert(msg);
		return false;
	} else return true;
}
function validate() {
//alert('length = '+ document.forms['sbForm']['sound'].files.length);
	if (validateX(document.forms['sbForm']['sound'].files.length, 'You haven\'t recorded anything yet!'))
		if (validateX(document.forms['sbForm']['user'].value, 'Please fill in your name!'))
			if (validateX(document.forms['sbForm']['desc'].value, 'Please fill in a title!'))
				return true;
	return false;
}

// https://dobrian.github.io/cmp/topics/sample-recording-and-playback-with-web-audio-api/3.microphone-input-and-recording.html
let
	mediaRecorder = false,
	timer = null,
	stream = false;

async function recStartStop() {
	let isRecording = mediaRecorder.state == 'recording';
	if (isRecording) {
		await mediaRecorder.stop();
		stopTimer(recordbtn);
	} else {
		playbtn.disabled = true;
		await tryInBrowserRecording();
		mediaRecorder.start();
		recordbtn.timer = playbtn.timer = 0;
		startTimer(recordbtn);
	}
	isRecording ^= 1;
	if (isRecording)
		recordbtn.classList.add('recording');
	else
		recordbtn.classList.remove('recording');
}

function playStartStop() {
	if (localplay.paused) {
		localplay.play();
		startTimer(playbtn);
	} else {
		localplay.pause();
		stopTimer(playbtn);
	}
}

async function tryInBrowserRecording() {
	if (navigator.mediaDevices) {
		try {
			stream = await navigator.mediaDevices.getUserMedia({ 'audio': true });
			mediaRecorder = new MediaRecorder(stream);
			let chunks = [];
			mediaRecorder.ondataavailable = (e) => { chunks.push(e.data) };
			mediaRecorder.onstop = () => {
				stream.getTracks().forEach((track) => { track.stop() });
				const fileType = chunks[0].type;
				const blob = new Blob(chunks, { 'type': fileType });
				chunks = [];
				const audioURL = window.URL.createObjectURL(blob);
				localplay.src = audioURL;
				const extension = fileType.match(/audio\/([a-z]+)\;/i);
				const fileName = 'Recording'+ Date.now() +'.'+ (extension ? extension[1] : 'webm');
				const file = new File([blob], fileName, { type: fileType, lastModified: Date.now() });
				const container = new DataTransfer();
				container.items.add(file);
				sound.files = container.files;
				playbtn.disabled = false;
			}
			record.style.display = '';
			sound.hidden = true;
			return true;
		} catch(e) {
			console.log(e);
		}
	}
	record.style.display = 'none';
	sound.hidden = false;
}

function startTimer(btn) {
	if (!btn.timed) {
		timer = setInterval(startTimer, 1000, btn);
		btn.timed = true;
	}

	let minutes = Math.floor(btn.timer / 60);
	let seconds = btn.timer % 60;
	if (seconds < 10)
		seconds = '0'+ seconds;

	if (minutes > 0 || seconds > 6)
		btn.style.color = 'red';
	else if (minutes == 0 && seconds > 3)
		btn.style.color = 'orange';
	else
		btn.style.color = '';
	btn.innerHTML = `<h1>${btn == playbtn ? '⏸️' : '⏹'}</h1>${minutes}:${seconds}`;

	btn.timer += 1;

	if (btn == recordbtn && btn.timer > maxRecordingTime) {
		recStartStop();
		alert('This message is too long. The recording has been stopped.');
	}
}

function stopTimer(btn) {
	clearInterval(timer);
	btn.timed = false;
	btn.style.color = '';
	if (btn == playbtn)
		btn.innerHTML = localplay.ended ? '<h1>▶️</h1>Play' : btn.innerHTML.replace('⏸️', '▶️');
	else
		btn.innerHTML = btn.innerHTML.replace('⏹', '⏺️');
}