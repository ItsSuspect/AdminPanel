function sendNotification(title, text, type = 'base') {
    let notif = document.createElement('div')
    notif.classList.add('notification')

    let img = document.createElement('img')
    notif.append(img)

    let content = document.createElement('div')
    content.classList.add('content')
    notif.append(content)

    let head = document.createElement('div')
    head.classList.add('head')
    head.textContent = title
    content.append(head)

    let message = document.createElement('div')
    message.classList.add('text')
    message.textContent = text
    content.append(message)

    let audio = new Audio('../static/sounds/'+type+'.mp3')
    audio.play()

    document.querySelector('#notifications').append(notif)

    setTimeout(()=> {
        notif.style.transform = 'translateX(-120%)'
        setTimeout(()=> notif.remove(), 500)
    }, 5000)
}