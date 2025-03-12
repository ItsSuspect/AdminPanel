function sendNotification(title, text, type = "base") {
	console.log(title + "\n" + text);
	let notif = document.createElement("div");
	notif.classList.add("notification");
	if (type === "base") notif.classList.add("notification_subject_info");
	else if (type === "error") notif.classList.add("notification_subject_error");
	else if (type === "success") notif.classList.add("notification_subject_success");

	let content = document.createElement("div");
	content.classList.add("content");
	notif.append(content);

	let head = document.createElement("div");
	head.classList.add("head");
	head.textContent = title;
	content.append(head);

	let message = document.createElement("div");
	message.classList.add("text");
	message.textContent = text;
	content.append(message);

	// Версия для бэкенда.
	let audio = new Audio("sounds/" + type + ".mp3");
	// let audio = new Audio('../static/sounds/'+type+'.mp3')
	audio.volume = 0.7;
	audio.play();

	document.querySelector("#notifications").append(notif);

	setTimeout(() => {
		notif.style.transform = "translateX(-120%)";
		setTimeout(() => notif.remove(), 500);
	}, 5000);
}
