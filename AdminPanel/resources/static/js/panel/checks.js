let currentIndexChecks = 0;
let lastLoadedCheckId = checks.length;
let filteredChecks = checks;
let searchChecks = false;
let batchSizeChecks = 50;

document.addEventListener("DOMContentLoaded", () => {
	renderChecks();

	const containerTable = document.getElementById("check-table");
	const button = document.createElement("button");
	button.className = "table__load-more-btn";
	button.id = "loadMoreChecksBtn";
	button.textContent = "Load More";
	containerTable.appendChild(button);

	button.addEventListener("click", async () => {
		await loadMoreChecks();
	});

	if (checks.length < batchSizeChecks) {
		button.style.display = "none";
	}

	document
		.querySelectorAll(".expandable-text-block__expanding-text")
		.forEach((textarea) => {
			if (textarea.scrollHeight > textarea.clientHeight) {
				const resizeBtn = document.createElement("button");
				resizeBtn.classList.add(
					"expandable-text-block__resize-btn",
					"expandable-text-block__resize-btn_expand"
				);
				resizeBtn.addEventListener("click", resizeTextBlock(this));

				textarea.parentNode.appendChild(resizeBtn);
			}
		});
});

function editTableRowCheck(check) {
	const checkRow = document.querySelector(
		`div.table__row[data-checkId="${check.id}"]`
	);
	checkRow.innerHTML = getTableRowContentCheck(check);
}

function addCheckToTable(check, insertToBegin) {
	const container = document.getElementById("tableContentChecks");

	const checkHtml = `
    <div class="table__row" data-checkId="${check.id}">
        ${getTableRowContentCheck(check)}
    </div>
`;
	if (insertToBegin) container.insertAdjacentHTML("afterbegin", checkHtml);
	else container.insertAdjacentHTML("beforeend", checkHtml);
}

function getTableRowContentCheck(check) {
	let el_class = "";
	if (check.status === "Завершено" || check.status === "Готово")
		el_class = "is-done";
	else if (check.status === "В работе") el_class = "in-work";
	else if (check.status === "Выплата") el_class = "in-payment";
	else if (check.status === "Реализуемо") el_class = "is-realizable";
	else if (check.status === "Нереализуемо") el_class = "is-unrealizable";
	else if (check.status === "Ожидание") el_class = "in-waiting";

	// let lust_update = (check.lastStatusUpdate && check.lastStatusUpdate !== 'null')
	//     ? ' ➔ ' + formatDate(check.lastStatusUpdate)
	//     : '';

	return `
        <div class="table__cell table__cell_content_name" data-label="Name">
            <p class="table__cell-text">${check.name}</p>
        </div>
        <div class="table__cell table__cell_content_domain" data-label="Domain">
            <a href="https://${check.domain}" class="table__cell-text">${check.domain}</a>
        </div>
        <div class="table__cell table__cell_content_login" data-label="Login">
            <p class="table__cell-text">${check.login}</p>
        </div>
        <div class="table__cell table__cell_content_password" data-label="Password">
            <p class="table__cell-text">${check.password}</p>
        </div>
        <div class="table__cell table__cell_content_customer" data-label="Customer">
            <p class="table__cell-text">${check.customer}</p>
        </div>
        <div class="table__cell table__cell_content_country" data-label="Country">
            <p class="table__cell-text">${check.country}</p>
        </div>
        <div class="table__cell table__cell_content_executor" data-label="Executor">
            <p class="table__cell-text">${check.executor}</p>
        </div>
        <div class="table__cell table__cell_content_crypto" data-label="Crypto">
            <p class="table__cell-text">${check.crypt}</p>
        </div>
        <div class="table__cell table__cell_content_creation-date" data-label="Creation date">
            <p class="table__cell-text">${formatDate(check.createdDate)}</p>
        </div>
        <div class="table__cell table__cell_content_change-date" data-label="Change date">
            <p class="table__cell-text">${formatDate(check.lastStatusUpdate)}</p>
        </div>
        <div class="table__action-block">
            <button class="table__action-btn table__action-btn_action_detail-info" data-conclusion="${check.conclusion}" onclick="openDetailCheckWindow(this)"></button>
            <button class="table__action-btn table__action-btn_action_edit"
            data-checkId="${check.id}" data-name="${check.name}"
            data-domain="${check.domain}" data-login="${check.login}"
            data-password="${check.password}" data-customer="${check.customer}"
            data-country="${check.country}" data-executor="${check.executor}"
            data-crypt="${check.crypt}" data-conclusion="${check.conclusion}"
            onclick="openEditCheckWindow(this)"></button>
            <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteCheckWindow(${check.id})"></button>
            ${getActionButtons(check)}
            <div class="popup__select">
                <div class="popup__select-input ${el_class}" onclick="openSelector(this)">
                    <p class="popup__select-input-value">${check.status}</p>
                </div>
                <ul class="popup__select-option-list">
                    <li class="popup__select-option" onclick="editCheckStatus(this, ${check.id})">
                        <p class="popup__select-option-value">Рассмотрение</p>
                    </li>
                    <li class="popup__select-option" onclick="editCheckStatus(this, ${check.id})">
                        <p class="popup__select-option-value">Ожидание</p>
                    </li>
                    <li class="popup__select-option" onclick="editCheckStatus(this, ${check.id})">
                        <p class="popup__select-option-value">Реализуемо</p>
                    </li>
                    <li class="popup__select-option" onclick="editCheckStatus(this, ${check.id})">
                        <p class="popup__select-option-value">Нереализуемо</p>
                    </li>
                    <li class="popup__select-option" onclick="editCheckStatus(this, ${check.id})">
                        <p class="popup__select-option-value">В работе</p>
                    </li>
                    <li class="popup__select-option" onclick="editCheckStatus(this, ${check.id})">
                        <p class="popup__select-option-value">Готово</p>
                    </li>
                </ul>
            </div>
        </div>
`;
}

function getActionButtons(check) {
	if (check.paidOut)
		return `<button class="table__payment-btn table__payment-btn_paid" onclick="paidOutCheck(${check.id})"></button>`;
	else
		return `<button class="table__payment-btn" onclick="paidOutCheck(${check.id})"></button>`;
}

function renderChecks(insertToBegin = true) {
	const end = currentIndexChecks + batchSizeChecks;
	const slice = filteredChecks.slice(currentIndexChecks, end);

	slice.forEach((check) => addCheckToTable(check, insertToBegin));

	currentIndexChecks = end;
}

async function loadMoreChecks() {
	if (lastLoadedCheckId === null) return;

	if (searchChecks) {
		const end = currentIndexChecks + batchSizeChecks;
		const slice = filteredChecks.slice(currentIndexChecks, end);
		if (slice.length > 0) {
			renderChecks(false);
		} else {
			document.getElementById("loadMoreChecksBtn").style.display = "none";
		}
	} else {
		try {
			let response = await fetch("/admin/loadMoreChecks", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ lastId: filteredChecks.length }),
			});

			if (!response.ok) {
				console.log("Network response was not ok");
				return;
			}

			let data = await response.json();

			if (data.length > 0) {
				filteredChecks = filteredChecks.concat(data);
				renderChecks(false);
			}

			if (data.length < batchSizeChecks) {
				document.getElementById("loadMoreChecksBtn").style.display =
					"none";
			}
		} catch (error) {
			console.error("Fetch error:", error);
		}
	}
}

async function searchTableChecks(event) {
	event.preventDefault();

	let input = document
		.getElementById("searchInputChecks")
		.value.toLowerCase();
	const tableContentChecks = document.getElementById("tableContentChecks");
	const loadMoreButton = document.getElementById("loadMoreChecksBtn");

	if (input === "") {
		filteredChecks = checks;
		currentIndexChecks = 0;
		lastLoadedCheckId = 50;
		tableContentChecks.innerHTML = "";

		loadMoreButton.style.display = "block";

		renderChecks();
		searchChecks = false;
		return;
	}

	let searchTerms = input.split("+").map((term) => {
		term = term.trim();
		try {
			let url = new URL(term);
			return url.hostname;
		} catch (e) {
			return term;
		}
	});

	try {
		let response = await fetch("/admin/searchChecks", {
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

		tableContentChecks.innerHTML = "";
		if (data.length > 0) {
			filteredChecks = data;
			currentIndexChecks = 0;
			searchChecks = true;
			renderChecks(false);
		} else {
			tableContentChecks.innerHTML =
				'<div class="table__no-data">Данные отсутствуют</div>';
		}

		if (data.length < batchSizeChecks)
			loadMoreButton.style.display = "none";
		else loadMoreButton.style.display = "block";
	} catch (error) {
		console.error("Fetch error:", error);
	}
}

function changeLanguage() {
	const languageElement = document.getElementsByClassName(
		"detailing-popup__language-btn"
	)[0];

	if (languageElement.innerText === "English")
		languageElement.innerText = "Русский";
	else languageElement.innerText = "English";
}

function openAddCheckWindow() {
	document.getElementById("add-check-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";
}

function openDetailExcelCheckWindow() {
	document.getElementById("detailing-popup-excel").style.display = "block";
	document.querySelector(".overlay").style.display = "block";
}

function openDetailCheckWindow(element) {
	document.getElementById("detail-check-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const textArea = document.getElementById("detail-bookmaker-conclusion");
	textArea.textContent = element.getAttribute("data-conclusion");
	resizeTextarea(textArea);
}

function openEditCheckWindow(element) {
	document.getElementById("edit-check-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	document
		.getElementById("edit-check-button")
		.setAttribute("data-checkId", element.getAttribute("data-checkId"));
	document.getElementById("edit-bookmaker-name").value =
		element.getAttribute("data-name");
	document.getElementById("edit-bookmaker-domain").value =
		element.getAttribute("data-domain");
	document.getElementById("edit-bookmaker-login").value =
		element.getAttribute("data-login");
	document.getElementById("edit-bookmaker-password").value =
		element.getAttribute("data-password");
	document.getElementById("edit-bookmaker-customer").value =
		element.getAttribute("data-customer");
	document.getElementById("edit-bookmaker-country").value =
		element.getAttribute("data-country");
	const textArea = document.getElementById("edit-bookmaker-conclusion");
	textArea.value =
		element.getAttribute("data-conclusion") === "null"
			? ""
			: element.getAttribute("data-conclusion");
	resizeTextarea(textArea);
	document.getElementById("edit-bookmaker-executor").textContent =
		element.getAttribute("data-executor") === "null"
			? "Выберите"
			: element.getAttribute("data-executor");
	if (element.getAttribute("data-crypt") === "true")
		document
			.getElementById("edit-bookmaker-crypt")
			.classList.add("popup__toggle-btn_toggled");
	else
		document
			.getElementById("edit-bookmaker-crypt")
			.classList.remove("popup__toggle-btn_toggled");
}

function openDeleteCheckWindow(checkId) {
	document.getElementById("delete-check-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	document
		.getElementById("delete-check-button")
		.setAttribute("data-checkId", checkId);
}

async function addCheck() {
	try {
		let inputValue = document.getElementById("add-bookmaker-domain").value;
		let domain;

		try {
			let url = new URL(inputValue);
			domain = url.hostname;
		} catch (e) {
			domain = inputValue;
		}

		let body = {
			name: document.getElementById("add-bookmaker-name").value,
			domain: domain,
			login: document.getElementById("add-bookmaker-login").value,
			password: document.getElementById("add-bookmaker-password").value,
			customer: document.getElementById("add-bookmaker-customer").value,
			country: document.getElementById("add-bookmaker-country").value,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/admin/addCheck", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Добавление нового букмекера",
					"Букмекер был добавлен.",
					"success"
				);

				checks.push(data.check);
				addCheckToTable(data.check, true);

				resetModalProperties("add-check-popup");
				closePopup();
			} else
				sendNotification(
					"Добавление нового букмекера",
					"Не удалось добавить нового букмекера.\nError: " +
					data.message,
					"error"
				);
		} else {
			sendNotification(
				"Добавление нового букмекера",
				"Не удалось добавить нового букмекера.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Добавление нового букмекера",
			"Не удалось добавить нового букмекера.\nError: " + e.toString(),
			"error"
		);
	}
}

async function editCheckStatus(element, check_id) {
	try {
		let body = {
			checkId: check_id,
			status: element.querySelector(".popup__select-option-value")
				.textContent,
		};

		let response = await fetch("/admin/editCheckStatus", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				console.log(check_id);
				sendNotification(
					"Изменение статуса проверки",
					"Изменения сохранены.",
					"success"
				);
				// let old_date = document.querySelector('.list-item.list__list-item[data-checkId="'+check_id+'"] .list-item__content .list-item__main-block .list-item__date-block').textContent
				// let creation_date = old_date.split(' ➔ ')[0]
				// let new_date = formatDate(new Date().getTime()/1000)
				// element.parentNode.parentNode.querySelector(".popup__select-input-value").textContent = creation_date+' ➔ '+new_date
				selectCurrentValue(element);

				checks = checks.map((check) =>
					check.id === data.check.id ? data.check : check
				);
			} else
				sendNotification(
					"Изменение статуса проверки",
					"Не удалось применить изменение.\nError: " + data.message,
					"error"
				);
		} else {
			sendNotification(
				"Изменение статуса проверки",
				"Не удалось применить изменение.\nResponse status: " +
				response.status,
				"error"
			);
			closeSelector(element);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Изменение статуса проверки",
			"Не удалось применить изменение.\nError: " + e.toString(),
			"error"
		);
		closeSelector(element);
	}
}

async function paidOutCheck(checkId) {
	try {
		let response = await fetch("/admin/editPaidOutStatus/" + checkId, {
			method: "POST",
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Статус выплаты",
					"Статус выплаты успешно изменен",
					"success"
				);

				checks = checks.map((check) =>
					check.id === data.check.id ? data.check : check
				);
				editTableRowCheck(data.check);
				closePopup();
			} else
				sendNotification(
					"Статус выплаты",
					"Не удалось изменить статус выплаты.\nError: " +
					data.message,
					"error"
				);
		} else {
			sendNotification(
				"Статус выплаты",
				"Не удалось изменить статус выплаты.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Статус выплаты",
			"Не удалось изменить статус выплаты.\nError: " + e.toString(),
			"error"
		);
	}
}

async function deleteCheck(element) {
	try {
		let response = await fetch(
			"/admin/deleteCheck/" + element.getAttribute("data-checkId"),
			{
				method: "POST",
			}
		);

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Удаление записи",
					"Запись была успешно удалена.",
					"success"
				);

				document
					.querySelector(
						'.table__content .table__row[data-checkId="' +
						element.getAttribute("data-checkId") +
						'"]'
					)
					.remove();

				checks = checks.filter((check) => check.id !== data.checkId);

				closePopup();
			} else
				sendNotification(
					"Удаление записи",
					"Не удалось удалить запись.\nError: " + data.message,
					"error"
				);
		} else {
			sendNotification(
				"Удаление записи",
				"Не удалось удалить запись.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Удаление записи",
			"Не удалось удалить запись.\nError: " + e.toString(),
			"error"
		);
	}
}

async function editCheck(element) {
	try {
		let inputValue = document.getElementById("edit-bookmaker-domain").value;
		let domain;

		try {
			let url = new URL(inputValue);
			domain = url.hostname;
		} catch (e) {
			domain = inputValue;
		}

		let body = {
			checkId: element.getAttribute("data-checkId"),
			name: document.getElementById("edit-bookmaker-name").value,
			domain: domain,
			login: document.getElementById("edit-bookmaker-login").value,
			password: document.getElementById("edit-bookmaker-password").value,
			executor: document.getElementById("edit-bookmaker-executor")
				.textContent,
			customer: document.getElementById("edit-bookmaker-customer").value,
			country: document.getElementById("edit-bookmaker-country").value,
			description: document.getElementById("edit-bookmaker-executor")
				.value,
			conclusion: document.getElementById("edit-bookmaker-conclusion")
				.value,
			crypt:
				document.getElementById("edit-bookmaker-crypt").classList
					.length === 2,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/admin/editCheck", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Редактирование записи",
					"Запись была изменена.",
					"success"
				);

				checks = checks.map((check) =>
					check.id === data.check.id ? data.check : check
				);
				editTableRowCheck(data.check);
				closePopup();
			} else
				sendNotification(
					"Редактирование записи",
					"Не удалось изменить запись.\nError: " + data.message,
					"error"
				);
		} else {
			sendNotification(
				"Редактирование записи",
				"Не удалось изменить запись.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Редактирование записи",
			"Не удалось изменить запись.\nError: " + e.toString(),
			"error"
		);
	}
}

async function exportToExcel() {
	try {
		const startDate = new Date(
			document.getElementById("start-date-excel").value
		);
		const startTimestamp = startDate.setHours(0, 0, 0, 0) / 1000;

		const endDate = new Date(
			document.getElementById("end-date-excel").value
		);
		const endTimestamp = endDate.setHours(23, 59, 59, 999) / 1000;

		const body = {
			startDate: startTimestamp,
			endDate: endTimestamp,
			language: document.getElementsByClassName(
				"detailing-popup__language-btn"
			)[0].innerText,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/admin/exportToExcel", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let blob = await response.blob();

			let url = window.URL.createObjectURL(blob);
			let a = document.createElement("a");
			a.href = url;
			a.download = "checks.xlsx";
			document.body.appendChild(a);
			a.click();
			a.remove();

			sendNotification(
				"Экспорт данных",
				"Экспорт данных успешен.",
				"success"
			);
			closePopup();
		} else {
			sendNotification(
				"Экспорт данных",
				"Экспорт данных неудачный.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Экспорт данных",
			"Экспорт данных неудачный.\nError: " + e.toString(),
			"error"
		);
	}
}
