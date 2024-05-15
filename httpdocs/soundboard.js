const maxRecordTime = 30;
var remoteplaying = adminmode = false;

if (remoteplay)	outputSwitch(true);
if (location.href.endsWith('admin')) adminSwitch();

function play(el) {
	const id = el.getAttribute('id');
	const file = el.getAttribute('src');
	if (remoteplaying || el.removing) return false;
	remoteplaying = true;
	const
		sound = document.getElementById(id),
		playing = document.getElementById(id +'-playing');
	playing.style.display = 'block';
	playing.innerHTML ='Playing...';
	sound.className = 'sound selected';
	if (remoteplay)
		document.createElement("img").src = 'remoteplay.php?file='+ file;
	else {
		localplay.src = 'uploads/'+ file;
		localplay.play();
	}
	setTimeout(function() {
		remoteplaying = false;
		playing.style.display = 'none';
		sound.className = 'sound';
	}, 5000);
}

function remove(e, el) {
	e.preventDefault();
	if (!adminmode || el.removing) return false;
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

function outputSwitch(force = false) {
	remoteplay = force ? 1 : !remoteplay;
	output.src = remoteplay ? 'images/switch-on.svg' : 'images/switch-off.svg';
	if (force) output.className = '';
	outputmsg.className = remoteplay ? '' : 'hide';
}

async function showForm() {
	const showing = (form.style.display == 'block' ? true : false);
	if (!showing) await tryInBrowserRecording();
	contents.style.display = (showing ? 'block' : 'none');
	form.style.display = (showing ? 'none' : 'block');
}

function refresh() {
	location.href = location.href;
}

function adminSwitch(e = false) {
	if (e) e.preventDefault();
	adminmode ^= 1;
	title.textContent = 'Soundboard'+ (adminmode ? ' 🛡' : '');
}

function validateX(x, msg) {
	if (x == 0 || x == null || x == "") {
		alert(msg);
		return false;
	} else return true;
}

function validate() {
//alert('length = '+ document.forms["sbForm"]["sound"].files.length);
	if (validateX(document.forms["sbForm"]["sound"].files.length, "You haven't recorded anything yet!"))
		if (validateX(document.forms["sbForm"]["user"].value, "Please fill in your name!"))
			if (validateX(document.forms["sbForm"]["desc"].value, "Please fill in a title!"))
				return true;
	return false;
}

function credits() {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('GET', 'credits.htm', false);
	xmlHttp.send(null);
	contents.innerHTML=xmlHttp.responseText;
	window.scroll(0,0);
}

// https://dobrian.github.io/cmp/topics/sample-recording-and-playback-with-web-audio-api/3.microphone-input-and-recording.html
let
	mediaRecorder = false,
	timer = null,
	stream = false;

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
				const fileName = 'Recording'+ Date.now() +'.ogg';
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

function playStartStop() {
	let isPaused = localplay.paused;
	if (isPaused) {
		localplay.play();
		startTimer(playbtn);
	} else {
		localplay.pause();
		stopTimer(playbtn);
	}
}

localplay.onended = () => {
	if (form.style.display == 'block') {
		stopTimer(playbtn);
		playbtn.timer = 0;
	} else {
		remoteplaying = false;
	}
};

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
	recordbtn.className = isRecording ? 'on' : '';
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

	if (btn == recordbtn && btn.timer > maxRecordTime) {
		recStartStop();
		alert('This message is too long. The recording has been stopped.');
	}
}

function stopTimer(btn) {
console.log(btn);
	clearInterval(timer);
	btn.timed = false;
	btn.style.color = '';
	if (btn == playbtn)
		btn.innerHTML = localplay.ended ? '<h1>▶️</h1>Play' : btn.innerHTML.replace('⏸️', '▶️');
	else
		btn.innerHTML = btn.innerHTML.replace('⏹', '⏺️');
}