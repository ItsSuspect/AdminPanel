async function signIn() {
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    try {
        let body = {
            login: login,
            password: password
        }

        let response = await fetch("/auth/signIn", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        })

        if (response.ok) {
            sendNotification('Авторизация', 'Авторизация успешно произведена!', 'success')
            setTimeout(()=> window.location.pathname = 'admin', 4500)
        } else {
            sendNotification('Авторизация', 'Не удалось выполнить авторизацию.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Авторизация', 'Не удалось выполнить авторизацию.\nError: '+e.toString(), 'error')
    }
}