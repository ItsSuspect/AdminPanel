async function signIn() {
    try {
        let body = {
            login: document.getElementById('login').value.trim(),
            password: document.getElementById('password').value.trim()
        }

        let response = await fetch('/pg_ru/auth/signIn', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })

        if (response.ok) {
            window.location.pathname = 'pg_ru/panel'
        }
    } catch (e) {
        console.log(e)
    }
}