let users,
	currentIndexUser = 0,
	lastLoadedUserId,
	filteredUsers,
	searchUsers = false;

document.addEventListener("DOMContentLoaded", async () => {
	try {
		let response = await fetch("/admin/getFirstUsers", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		});

		if (!response.ok) {
			console.log("Network response was not ok");
			return;
		}

		let data = await response.json();

		if (data.length > 0) {
			users = data;
			filteredUsers = data
			lastLoadedUserId = data[0].id;
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}

	renderUsers();

	const containerTable = document.getElementById("user-table");
	const button = document.createElement("button");
	button.className = "table__load-more-btn";
	button.id = "loadMoreUsersBtn";
	button.textContent = "Load More";
	containerTable.appendChild(button);

	button.addEventListener("click", async () => {
		await loadMoreUsers();
	});

	if (users.length < batchSize) button.style.display = "none";
});

function editTableRowUser(user) {
	const userRow = document.querySelector(
		`div.table__row[data-userid="${user.id}"]`
	);

	if (userRow.classList.length > 1)
		userRow.classList.remove(userRow.classList[1]);

	const newClass = getRowClass(user).trim();
	if (newClass) userRow.classList.add(newClass);

	userRow.innerHTML = getTableRowContentUser(user);
}

function addUserToTable(container, user, insertToBegin) {
	const userHtml = `
    <div class="table__row${getRowClass(user)}" data-userid="${user.id}">
        ${getTableRowContentUser(user)}
    </div>
    `;

	if (insertToBegin) container.insertAdjacentHTML("afterbegin", userHtml);
	else container.insertAdjacentHTML("beforeend", userHtml);
}

function getRowClass(user) {
	const currentTime = Math.floor(Date.now() / 1000);
	if (user.banned) return " table__row_banned-user";
	else if (user.freeze) return " table__row_frozen-user";
	else if (user.lastUse === null) return " table__row_not-active-license";
	else if (user.endLicense < currentTime) return " table__row_expired-license";
	return "";
}

function getTableRowContentUser(user) {
	return `
    <div class="table__cell table__cell_content_id" data-label="ID">
        <p class="table__cell-text">${user.id}</p>
    </div>
    <div class="table__cell table__cell_content_application" data-label="Application">
        <p class="table__cell-text">${user.application}</p>
    </div>
    <div class="table__cell table__cell_content_secret-key" data-label="Secret Key">
        <p class="table__cell-text">${user.secretKey}</p>
    </div>
    <div class="table__cell table__cell_content_description" data-label="Description">
        <p class="table__cell-text">${user.description}</p>
    </div>
    <div class="table__cell table__cell_content_version" data-label="Version">
        <p class="table__cell-text">${user.version}</p>
    </div>
    <div class="table__cell table__cell_content_last-use" data-label="Last Use">
        <p class="table__cell-text">${formatDate(user.lastUse)}</p>
    </div>
    <div class="table__cell table__cell_content_end-license" data-label="End License">
        <p class="table__cell-text">${formatDate(user.endLicense)}</p>
    </div>
    <div class="table__cell table__cell_content_connections" data-label="Conns">
        <p class="table__cell-text">${user.currentConnections}/${user.maxConnections
		}</p>
    </div>
    <div class="table__cell table__cell_content_freezes" data-label="Freezes">
        <p class="table__cell-text">${user.countFreezes}</p>
    </div>
    <div class="table__cell table__cell_content_tg-id" data-label="Telegram ID">
        <p class="table__cell-text">${user.telegramId}</p>
    </div>
    <div class="table__cell table__cell_content_creator" data-label="Creator">
        <p class="table__cell-text">${user.creator}</p>
    </div>
    <div class="table__cell table__cell_content_creation-date" data-label="Creation Date">
        <p class="table__cell-text">${formatDate(user.creationDate)}</p>
    </div>
    <div class="table__action-block">
        <button class="table__action-btn table__action-btn_action_edit"
                data-userId="${user.id}" data-application="${user.application}"
                data-secret-key="${user.secretKey}" data-description="${user.description}"
                data-max-connections="${user.maxConnections}"
                data-telegram-id="${user.telegramId}" data-countFreezes="${user.countFreezes}"
                onclick="openEditWindow(this)"></button>
        <button class="table__action-btn table__action-btn_action_license-renewal" onclick="openAddLicenseWindow(${user.id})"></button>
        <button class="table__action-btn table__action-btn_action_ban" onclick="openBanUser(${user.id})"></button>
        <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteWindow(${user.id})"></button>
    </div>`;
}

function renderUsers(insertToBegin = true) {
	const container = document.getElementById("tableContentUsers");
	const end = currentIndexUser + batchSize;
	const slice = filteredUsers.slice(currentIndexUser, end);

	slice.forEach((user) => addUserToTable(container, user, insertToBegin));

	currentIndexUser = end;
}

async function loadMoreUsers() {
	if (lastLoadedUserId === null) return;

	if (searchUsers) {
		const end = currentIndexUser + batchSize;
		const slice = filteredUsers.slice(currentIndexUser, end);
		if (slice.length > 0) {
			renderUsers(false);
		} else {
			document.getElementById("loadMoreUsersBtn").style.display = "none";
		}
	} else {
		try {
			let response = await fetch("/admin/loadMoreUsers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ lastId: lastLoadedUserId }),
			});

			if (!response.ok) {
				console.log("Network response was not ok");
				return;
			}

			let data = await response.json();

			if (data.length > 0) {
				filteredUsers = filteredUsers.concat(data);
				lastLoadedUserId = data[data.length - 1].id;
				renderUsers(false);
			}

			if (data.length < batchSize) {
				document.getElementById("loadMoreUsersBtn").style.display =
					"none";
			}
		} catch (error) {
			console.error("Fetch error:", error);
		}
	}
}

async function searchTableUsers(event) {
	event.preventDefault();

	let input = document.getElementById("searchInputUsers").value.toLowerCase();
	const tableContentUsers = document.getElementById("tableContentUsers");
	const loadMoreButton = document.getElementById("loadMoreUsersBtn");

	if (input === "") {
		filteredUsers = users;
		currentIndexUser = 0;
		lastLoadedUserId = users[0].id;

		tableContentUsers.innerHTML = "";
		loadMoreButton.style.display = "block";

		renderUsers();
		searchUsers = false;
		return;
	}

	let searchTerms = input.split("+").map((term) => term.trim());

	try {
		let response = await fetch("/admin/searchUsers", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ searchTerms: searchTerms }),
		});

		if (!response.ok) {
			console.log("Network response was not ok");
			return;
		}

		let data = await response.json();

		tableContentUsers.innerHTML = "";
		if (data.length > 0) {
			filteredUsers = data;
			currentIndexUser = 0;
			searchUsers = true;
			renderUsers(false);
		} else {
			tableContentUsers.innerHTML =
				'<div class="table__no-data">Данные отсутствуют</div>';
		}

		if (data.length < batchSize) loadMoreButton.style.display = "none";
		else loadMoreButton.style.display = "block";
	} catch (error) {
		console.error("Fetch error:", error);
	}
}

function openBanUser(userId) {
	const user = users.find((user) => user.id === userId);
	document.getElementById("ban-user-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const popupHeader = document.getElementById("ban-user-popup").querySelector(".popup__header");
	const buttonBan = document.getElementById("ban-user-button");

	if (!user.banned) {
		popupHeader.textContent = popupHeader.textContent.replace("разблокировать", "заблокировать");
		buttonBan.textContent = "Заблокировать";
	} else {
		popupHeader.textContent = popupHeader.textContent.replace("заблокировать", "разблокировать");
		buttonBan.textContent = "Разблокировать";
	}
	buttonBan.setAttribute("data-userId", userId);
}

async function banUser(element) {
	try {
		let response = await fetch(
			"/admin/banUser/" + element.getAttribute("data-userId"),
			{
				method: "POST",
			}
		);

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				if (data.user.banned) {
					sendNotification("Блокировка пользователя", "Пользователь был успешно заблокирован.", "success");

					users = users.map((user) => user.id === data.user.id ? data.user : user);
					editTableRowUser(data.user);
				} else {
					sendNotification("Разблокировка пользователя", "Пользователь был успешно разблокирован.", "success");

					users = users.map((user) => user.id === data.user.id ? data.user : user);
					editTableRowUser(data.user);
				}
			} else {
				sendNotification("Статус блокировки пользователя", "Не удалось изменить статус блокировки пользователя.\nError: " + data.message, "error");
			}
		} else {
			sendNotification("Статус блокировки пользователя", "Не удалось изменить статус блокировки пользователя.\nResponse status: " + response.status, "error");
		}
	} catch (e) {
		console.log(e);
		sendNotification("Статус блокировки пользователя", "Не удалось изменить статус блокировки пользователя.\nError: " + e.toString(), "error");
		closePopup();
	}
	closePopup();
}

function openAddWindow() {
	document.getElementById("add-user-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	document.getElementById("secret-key-user").value = generateRandomKey();
}

function generateRandomKey() {
	const digits = "0123456789";
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	function getRandomDigit() {
		return digits.charAt(Math.floor(Math.random() * digits.length));
	}

	function getRandomLetter() {
		return letters.charAt(Math.floor(Math.random() * letters.length));
	}

	return `${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}-${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}-${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}-${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}`;
}

function openEditWindow(element) {
	document.getElementById("edit-user-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const buttonEdit = document.getElementById("edit-user-button");
	buttonEdit.setAttribute("data-userId", element.getAttribute("data-userId"));
	document.getElementById("edit-user-application").value =
		element.getAttribute("data-application");
	document.getElementById("secret-key-edit-user").value =
		element.getAttribute("data-secret-key");
	document.getElementById("description-edit-user").value =
		element.getAttribute("data-description");
	document.getElementById("telegram-id-user-edit").value =
		element.getAttribute("data-telegram-id") === "null"
			? ""
			: element.getAttribute("data-telegram-id");
	document.getElementById("edit-max-connections").value =
		element.getAttribute("data-max-connections");
	document.getElementById("edit-freezes").value =
		element.getAttribute("data-countFreezes");
}

function openAddLicenseWindow(userId) {
	document.getElementById("date-shift-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const buttonAddLicense = document.getElementById("date-shift-button");
	buttonAddLicense.setAttribute("data-userId", userId);
}

function openDeleteWindow(userId) {
	document.getElementById("delete-user-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const buttonDelete = document.getElementById("delete-user-button");
	buttonDelete.setAttribute("data-userId", userId);
}

async function addUser() {
	try {
		let body = {
			application: document.getElementById("application-name").value,
			secretKey: document.getElementById("secret-key-user").value,
			period: document.getElementById("period-addUser").textContent,
			count: document.getElementById("count-period-addUser").value,
			telegramId: document.getElementById("telegram-id-user").value.replaceAll(/\D/g, ""),
			description: document.getElementById("description-user").value,
			maxConnections: document.getElementById("max-connections").value,
			freezes: document.getElementById("add-freezes").value,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/admin/addUser", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();

			if (data.success) {
				sendNotification("Добавление пользователя", "Пользователь был добавлен.", "success");

				addUserToTable(document.getElementById("tableContentUsers"), data.user, true);
				users.push(data.user);
				closePopup();
				resetModalProperties("add-user-popup");
			} else
				sendNotification("Добавление пользователя", "Не удалось добавить пользователя. \nError: " + data.message, "error");
		} else {
			sendNotification("Добавление пользователя", "Не удалось добавить пользователя.\nResponse status: " + response.status, "error");
		}
	} catch (e) {
		console.log(e);
		sendNotification("Добавление пользователя", "Не удалось добавить пользователя.\nError: " + e.toString(), "error");
	}
}

async function editUser(element) {
	try {
		let body = {
			userId: element.getAttribute("data-userId"),
			application: document.getElementById("edit-user-application").value,
			secretKey: document.getElementById("secret-key-edit-user").value,
			telegramId: document.getElementById("telegram-id-user-edit").value.replaceAll(/\D/g, ""),
			description: document.getElementById("description-edit-user").value,
			maxConnections: document.getElementById("edit-max-connections").value,
			freezes: document.getElementById("edit-freezes").value,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/admin/editUser", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification("Редактирование пользователя", "Пользователь был изменен.", "success");

				closePopup();
				users = users.map((user) => user.id === data.user.id ? data.user : user);
				editTableRowUser(data.user);
			} else {
				sendNotification("Редактирование пользователя", "Не удалось изменить пользователя.\nError: " + data.message, "error");
			}
		} else {
			sendNotification("Редактирование пользователя", "Не удалось изменить пользователя.\nResponse status: " + response.status, "error");
		}
	} catch (e) {
		console.log(e);
		sendNotification("Редактирование пользователя", "Не удалось изменить пользователя.\nError: " + e.toString(), "error");
	}
}

async function editEndLicenseUser(element) {
	try {
		let body = {
			userId: element.getAttribute("data-userId"),
			period: document.getElementById("period-editLicense").textContent,
			count: document.getElementById("license-period").value,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/admin/addLicense", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Продление подписки",
					"Подписка была продлена.",
					"success"
				);

				users = users.map((user) =>
					user.id === data.user.id ? data.user : user
				);
				editTableRowUser(data.user);
				closePopup();
				resetModalProperties("date-shift-popup");
			} else {
				sendNotification(
					"Продление подписки",
					"Не удалось продлить подписку.\nError: " + data.message,
					"error"
				);
			}
		} else {
			sendNotification(
				"Продление подписки",
				"Не удалось продлить подписку.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Продление подписки",
			"Не удалось продлить подписку.\nError: " + e.toString(),
			"error"
		);
	}
}

async function deleteUser(element) {
	try {
		let response = await fetch("/admin/deleteUser/" + element.getAttribute("data-userId"), {
				method: "POST",
			}
		);

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification("Удаление пользователя", "Пользователь был успешно удален.", "success");

				document.querySelector('.table_content_users .table__row[data-userid="' + element.getAttribute("data-userId") + '"]').remove();
				users = users.filter((user) => user.id !== data.userId);
				closePopup();
			} else
				sendNotification("Удаление пользователя", "Не удалось удалить пользователя.\nError: " + data.message, "error");
		} else {
			sendNotification("Удаление пользователя", "Не удалось удалить пользователя.\nResponse status: " + response.status, "error");
		}
	} catch (e) {
		console.log(e);
		sendNotification("Удаление пользователя", "Не удалось удалить пользователя.\nError: " + e.toString(), "error");
	}
}
