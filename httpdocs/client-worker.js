onmessage = () => setInterval(clientMode, 2000);

async function clientMode() {
	const response = await fetch('client.php?play');
	switch (response.status) {
		case 204:	// empty
			return;
		case 401:	// unauthorized
		case 409:	// new client
			return postMessage('client-change');
		default:
			const
				list = await response.text(),
				files = list.split('\r\n');
			postMessage(files);
	}
}