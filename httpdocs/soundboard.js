const maxRecordingTime = 30;	// in seconds

let adminMode = audioContext = clientWorker = playingId = remotePlay = false;
let queue = sounds = [];

if (location.search == '?credits')
	document.body.classList.add('credits');
else {
	if (document.getElementById('output') && document.extClientRegistered) outputSwitch(true);
	if (document.empty) recordSwitch();

	localPlay = document.getElementById('local-play');
	if (localPlay) localPlay.onended = localPlay.onerror = playbackEnded;
	initCompressor();

	if (/^((?!chrome).)*safari/i.test(navigator.userAgent))
		adminbtn.classList.remove('hidden');
}

async function extClientRegistered() {
	const response = await fetch('client.php?check');
	const id = await response.text();
	return (id != '0');
}

async function outputSwitch(registered = false) {
	if (clientWorker) return clientSwitch();
	remotePlay = registered ? true : !remotePlay;
	if (registered && localStorage.getItem('remotePlay') == 'false')
		remotePlay = false;
	if (!registered) {
		localStorage.setItem('remotePlay', remotePlay);
		const registerCheck = await extClientRegistered();
		if (remotePlay && !registerCheck)
			clientSwitch();
		else {
			outputmsg.textContent = outputmsg.dataset.remotePlay;
			document.body.classList.remove('clientregister');
		}
	}
	output.src = remotePlay ? 'images/switch-on.svg' : 'images/switch-off.svg';
	if (remotePlay)
		document.body.classList.add('remoteplay');
	else
		document.body.classList.remove('remoteplay');
}

function adminSwitch(e = false) {
	if (e) e.preventDefault();
	if (adminMode) {
		adminMode = false;
		title.textContent = title.dataset.title;
		configform.classList.add('hidden');
	} else if (confirm(adminbtn.dataset.adminPrompt)) {
		adminMode = true;
		title.textContent = title.dataset.adminTitle +'🛡';
		configform.classList.remove('hidden');
		getConfig();
	}
}

async function getConfig() {
	const response = await fetch('setconfig.php?get');
	const config = await response.json();
	configform['no-upload'].checked = config['no-upload'];
	configform['party-url'].value = config['party-url'];
}

async function setConfig(e) {
	e.preventDefault();
	configform.password.classList.remove('error');
	const response = await fetch('setconfig.php', {
		method: 'POST',
		body: new FormData(configform)
	});
	if (response.status == 401)
		configform.password.classList.add('error');
	else if (response.status == 406)
		alert(configform.dataset.noQuotes);
	else if (response.status == 200)
		refresh();
	else alert(response.status);
}

async function clientSwitch(clientRegistered = false) {
	if (clientWorker) {
		clientWorker.terminate();
		clientWorker = false;
		deregisterClient();
		return outputSwitch();
	}
	outputmsg.textContent = outputmsg.dataset.clientSwitch;
	if (!clientRegistered) {
		const registered = await extClientRegistered();
		if (registered && !confirm(outputbar.dataset.clientFound)) {
			outputmsg.textContent = outputmsg.dataset.remotePlay;
			return document.body.classList.remove('clientregister');
		}
		const response = await fetch('client.php?register');
		if (response.status == 401) {
			document.body.classList.add('clientregister');
			return clientform.password.focus();
		}
	}
	document.body.classList.remove('clientregister');
	sounds = contents.querySelectorAll('.sound');
	clientWorker = new Worker('client-worker.js');
	clientWorker.onerror = (e) => alert(e.message);
	clientWorker.onmessage = clientWorkerHandler;
	clientWorker.postMessage('start');
	window.addEventListener('beforeunload', deregisterClient);
}

async function clientRegister(e) {
	e.preventDefault();
	clientform.password.classList.remove('error');
	const response = await fetch('client.php?register', {
		method: 'POST',
		body: new FormData(clientform)
	});
	if (response.status == 401)
		clientform.password.classList.add('error');
	else if (response.status == 200)
		clientSwitch(true);
	else alert(response.status);
}

function clientWorkerHandler(e) {
	switch (e.data) {
		case 'client-change':
			alert(outputbar.dataset.clientChange);
			return clientSwitch();
		default:
			queue = queue.concat(e.data);
			if (localPlay.paused) clientPlayNext();
	}
}

function clientPlayNext() {
	if (audioContext.state == 'suspended')
		audioContext.resume();
	file = queue.shift();
	localPlay.src = 'uploads/'+ file;
	localPlay.play();
	let sound = file;
	for (s of sounds)
		if (s.dataset.src == file)
			sound = s.querySelector('.description').textContent;
	if (sound == file) refresh();
	outputmsg.textContent = (sound || file) +' ♫';
}

function deregisterClient(e = false) {
	if (e) e.preventDefault();
	fetch('client.php?deregister');
	window.removeEventListener('beforeunload', deregisterClient);
}

async function recordSwitch() {
	if (recpanel.classList.contains('shown')) {
		recpanel.classList.remove('shown');
		contents.classList.remove('disabled');
	} else {
		const response = await fetch('save.php?check');
		if (response.status == 405) return alert(recform.dataset.noUpload +'!');
		await tryInBrowserRecording();
		recpanel.classList.add('shown');
		contents.classList.add('disabled');
	}
}

async function refresh() {
	if (location.search == '?credits') return location.reload();
	const response = await fetch('index.php?refresh');
	if (response.status != 200) return alert(`${recform.dataset.errorRefresh} (${response.status})`);
	const newContents = await response.text();
	contents.innerHTML = '';
	scrollTo(0,0);
	contents.innerHTML = newContents;
}

function initCompressor() {
	audioContext = new AudioContext();
	const compressor = new DynamicsCompressorNode(audioContext, {
//		'threshold': -20,
//		'ratio': 20,
		'knee': 0,
		'attack': 0,
//		'release': 0.25
	});
	const gain = new GainNode(audioContext, { 'gain': 2 });
	const source = audioContext.createMediaElementSource(localPlay);
	source.connect(compressor).connect(gain).connect(audioContext.destination);
}

function play(el) {
	if (adminMode) return removeForm(el);
	if (playingId && remotePlay && !clientWorker) return false;	// Wait for timeout before sending a new remote playback request
	if (!remotePlay || clientWorker) playbackEnded();	// Remove 'Playing...' from current sound
	playingId = el.id;
	const
		file = el.dataset.src;
		sound = document.getElementById(playingId),
		playing = document.getElementById(playingId +'-playing');
	sound.style.color = '';
	sound.classList.add('selected');
	playing.innerHTML = contents.dataset.playing +'...';
	playing.style.display = 'block';
	if (!clientWorker && remotePlay)
		playRemotely(file);
	else {
		if (audioContext.state == 'suspended')
			audioContext.resume();
		localPlay.src = 'uploads/'+ file;
		localPlay.play();
	}
}

async function playRemotely(file) {
	const response = await fetch('enqueue.php', {
		method: 'POST',
		body: file
	});
	switch (response.status) {
		case 400:
		case 410:
			alert(file +'\n'+ outputbar.dataset.fileGone);
			return refresh();
		case 503:
			alert(outputbar.dataset.clientGone);
			outputSwitch();
			return playbackEnded();
		default:
			setTimeout(playbackEnded, 5000);
	}
}

function playbackEnded(event = false) {
	if (recpanel.classList.contains('shown'))
		stopTimer(playbtn);
	else if (playingId) {	// Local playback
		const
			sound = document.getElementById(playingId),
			playing = document.getElementById(playingId +'-playing');
		playing.style.display = 'none';
		sound.classList.remove('selected');
		if (event && event.type == 'error')
			sound.style.color = 'red';
		playingId = false;
	}
	if (clientWorker && queue.length) clientPlayNext();
};

function removeForm(el) {
	if (el.removing) return false;
	el.removing = true;
	const
		formEl = document.createElement('form'),
		fileInput = document.createElement('input'),
		passInput = document.createElement('input'),
		submitBtn = document.createElement('input');
	fileInput.name = 'file';
	fileInput.value = el.dataset.sound;
	fileInput.hidden = true;
	passInput.name = passInput.type = 'password';
	passInput.placeholder = contents.dataset.password +'...';
	submitBtn.name = submitBtn.type = 'submit';
	submitBtn.value = contents.dataset.remove;
	submitBtn.onclick = (e) => remove(e, formEl);
	formEl.appendChild(fileInput);
	formEl.appendChild(passInput);
	formEl.appendChild(submitBtn);
	el.appendChild(formEl);
}

async function remove(e, formEl) {
	e.preventDefault();
	const response = await fetch('remove.php', {
		method: 'POST',
		body: new FormData(formEl)
	});
	if (response.status == 401)
		formEl.password.classList.add('error');
	else
		refresh();
}

async function save(e) {
	e.preventDefault();
	if (!validate()) return;
	const response = await fetch('save.php', {
		method: 'POST',
		body: new FormData(recform)
	});
	switch (response.status) {
		case 200:
			refresh();
			recordSwitch();
			if (playbtn) stopTimer(playbtn);
			recordbtn.innerHTML = '<h1>⏺️</h1>'+ recordbtn.dataset.record;
			playbtn.disabled = true;
			recform.desc.value = '';
			break;
		case 405:
			return alert(recform.dataset.noUpload +'!');
		default:
			return alert(`${recform.dataset.errorSaving} (${response.status})`);
	}
}

function validateX(x, msg) {
	if (x == 0 || x == null || x == '') {
		alert(msg);
		return false;
	} else return true;
}

function validate() {
	if (validateX(document.forms['recform']['sound'].files.length, recform.dataset.noRecording))
		if (validateX(document.forms['recform']['user'].value, recform.dataset.noName))
			if (validateX(document.forms['recform']['desc'].value, recform.dataset.noTitle))
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
		recform.cancel.disabled = recform.send.disabled = false;
	} else {
		localPlay.pause();
		stopTimer(playbtn);
		playbtn.disabled = true;
		await tryInBrowserRecording();
		mediaRecorder.start();
		startTimer(recordbtn);
		recordbtn.classList.add('recording');
		recform.cancel.disabled = recform.send.disabled = true;
	}
}

function playStartStop() {
	if (audioContext.state == 'suspended')
		audioContext.resume();
	if (localPlay.paused) {
		localPlay.play();
		startTimer(playbtn);
	} else {
		localPlay.pause();
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
				recform.sound.files = container.files;
				audioURL = window.URL.createObjectURL(recform.sound.files[0]),
				localPlay.src = audioURL;
				playbtn.disabled = false;
				chunks = [];
			}
			record.style.display = '';
			recform.sound.hidden = true;
			return true;
		} catch(e) {
			console.log(e);
		}
	}
	record.style.display = 'none';
	recform.sound.hidden = false;
}

function startTimer(btn) {
	if (!btn.timer) {
		btn.timer = setInterval(startTimer, 1000, btn);
		recordbtn.startTime = performance.now();
	}

	const
		time = btn == playbtn ? Math.round(localPlay.currentTime) : Math.round((performance.now() - recordbtn.startTime) / 1000),
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
	btn.innerHTML = `<h1>${btn == playbtn ? '⏸️' : '⏹️'}</h1>${minutes}:${seconds}`;

	if (btn == recordbtn && time > maxRecordingTime) {
		recStartStop();
		alert(recform.dataset.tooLong);
	}
}

function stopTimer(btn) {
	clearInterval(btn.timer);
	btn.timer = false;
	btn.style.color = '';
	if (btn == playbtn)
		btn.innerHTML = localPlay.ended ? '<h1>▶️</h1>'+ btn.dataset.play : btn.innerHTML.replace('⏸️', '▶️');
	else
		btn.innerHTML = btn.innerHTML.replace('⏹️', '⏺️');
}