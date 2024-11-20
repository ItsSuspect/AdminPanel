async function signIn() {
	try {
		let body = {
			login: document.getElementById('login').value.trim(),
			password: document.getElementById('password').value.trim()
		}

		let response = await fetch('/office/auth/signIn', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		})

		if (response.ok) {
			window.location.pathname = '/office/panel'
		}
	} catch (e) {
		console.log(e)
	}
}