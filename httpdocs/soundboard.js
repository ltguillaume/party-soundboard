const maxRecordingTime = 30;	// in seconds

let adminmode = playingid = remoteplay = false;
if (location.search == '?admin') adminSwitch();
else if (document.empty) recordSwitch();
if (document.getElementById('output') && document.remoteplay == 1)
	outputSwitch(true);

const localplay = document.getElementById('localplay');
if (localplay) localplay.onended = localplay.onerror = playbackEnded;

if (/^((?!chrome).)*safari/i.test(navigator.userAgent))
	adminbtn.classList.remove('hidden');

function outputSwitch(registered = false) {
	remoteplay = registered ? true : !remoteplay;
	if (registered && localStorage.getItem('remoteplay') == 'false')
		remoteplay = false;
	output.src = remoteplay ? 'images/switch-on.svg' : 'images/switch-off.svg';
	if (registered) output.classList.remove('hidden');
	if (remoteplay)
		document.body.classList.add('remoteplay');
	else
		document.body.classList.remove('remoteplay');
	if (!registered)
		localStorage.setItem('remoteplay', remoteplay);
}

function adminSwitch(e = false) {
	if (e) e.preventDefault();
	if (adminmode)
		location.search = 'soundboard';
	else if (location.search == '?admin' || confirm(adminbtn.dataset.adminMode)) {
		adminmode = true;
		title.textContent = adminbtn.dataset.adminTitle +'🛡';
	}
}

async function recordSwitch() {
	if (!form.classList.contains('shown')) {
		await tryInBrowserRecording();
		form.classList.add('shown');
		contents.classList.add('disabled');
	} else {
		form.classList.remove('shown');
		contents.classList.remove('disabled');
	}
}

function refresh() {
	location.reload();
}

function play(el) {
	if (adminmode) return remove(el);
	if (playingid) return false;
	playingid = el.getAttribute('id');
	const
		file = el.getAttribute('src');
		sound = document.getElementById(playingid),
		playing = document.getElementById(playingid +'-playing');
	sound.style.color = '';
	sound.classList.add('selected');
	playing.innerHTML = contents.dataset.playing +'...';
	playing.style.display = 'block';
	if (remoteplay) {
		fetch('remoteplay.php?file='+ file);
		setTimeout(playbackEnded, 5000);
	} else {
		localplay.src = 'uploads/'+ file;
		localplay.play();
	}
}

function playbackEnded(event = false) {
	if (form.classList.contains('shown'))
		stopTimer(playbtn);
	else {
		const
			sound = document.getElementById(playingid),
			playing = document.getElementById(playingid +'-playing');
		playing.style.display = 'none';
		sound.classList.remove('selected');
		if (event && event.type == 'error')
			sound.style.color = 'red';
		playingid = false;
	}
};

function remove(el) {
	if (el.removing) return false;
	el.removing = true;
	const
		delForm = document.createElement('form'),
		fileInput = document.createElement('input'),
		passInput = document.createElement('input'),
		submitBtn = document.createElement('input');
	fileInput.name = 'file';
	fileInput.value = el.getAttribute('sound');
	fileInput.hidden = true;
	delForm.action = 'remove.php';
	delForm.method = 'post';
	passInput.name = passInput.type = 'password';
	passInput.placeholder = contents.dataset.password +'...';
	submitBtn.name = submitBtn.type = 'submit';
	submitBtn.value = contents.dataset.remove;
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
	if (validateX(document.forms['sbForm']['sound'].files.length, form.dataset.noRecording))
		if (validateX(document.forms['sbForm']['user'].value, form.dataset.noName))
			if (validateX(document.forms['sbForm']['desc'].value, form.dataset.noTitle))
				return true;
	return false;
}

// https://dobrian.github.io/cmp/topics/sample-recording-and-playback-with-web-audio-api/3.microphone-input-and-recording.html
let
	mediaRecorder = false,
	stream = false;

async function recStartStop() {
	let isRecording = mediaRecorder && mediaRecorder.state == 'recording';
	if (isRecording) {
		await mediaRecorder.stop();
		stopTimer(recordbtn);
		recordbtn.classList.remove('recording');
	} else {
		localplay.pause();
		stopTimer(playbtn);
		playbtn.disabled = true;
		await tryInBrowserRecording();
		mediaRecorder.start();
		startTimer(recordbtn);
		recordbtn.classList.add('recording');
	}
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
			mediaRecorder.onstart = (e) => { recordbtn.startTime = e.timeStamp };
			mediaRecorder.onstop = () => {
				stream.getTracks().forEach((track) => { track.stop() });
				stream = null;
				const
					fileType = chunks[0].type,
					blob = new Blob(chunks, { 'type': fileType }),
					extension = fileType.match(/audio\/([a-z0-9]+)/i),
					fileName = 'Recording'+ Date.now() +'.'+ (extension ? extension[1] : 'mp4'),
					file = new File([blob], fileName, { type: fileType, lastModified: Date.now() }),
					container = new DataTransfer();
				container.items.add(file);
				sound.files = container.files;
				audioURL = window.URL.createObjectURL(sound.files[0]),
				localplay.src = audioURL;
				playbtn.disabled = false;
				chunks = [];
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
	if (!btn.timer) {
		btn.timer = setInterval(startTimer, 1000, btn);
		recordbtn.startTime = performance.now();
	}

	const
		time = btn == playbtn ? Math.round(localplay.currentTime) : Math.round((performance.now() - recordbtn.startTime) / 1000),
		minutes = Math.floor(time / 60);
	let seconds = time % 60;
	if (seconds < 10)
		seconds = '0'+ seconds;

	if (minutes > 0 || seconds > 7)
		btn.style.color = 'red';
	else if (minutes == 0 && seconds > 4)
		btn.style.color = 'orange';
	else
		btn.style.color = '';
	btn.innerHTML = `<h1>${btn == playbtn ? '⏸️' : '⏹'}</h1>${minutes}:${seconds}`;

	if (btn == recordbtn && time > maxRecordingTime) {
		recStartStop();
		alert(form.dataset.tooLong);
	}
}

function stopTimer(btn) {
	clearInterval(btn.timer);
	btn.timer = false;
	btn.style.color = '';
	if (btn == playbtn)
		btn.innerHTML = localplay.ended ? '<h1>▶️</h1>'+ btn.dataset.play : btn.innerHTML.replace('⏸️', '▶️');
	else
		btn.innerHTML = btn.innerHTML.replace('⏹', '⏺️');
}