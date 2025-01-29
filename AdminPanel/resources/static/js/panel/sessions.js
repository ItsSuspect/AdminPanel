let sessions,
	currentIndexSessions = 0,
	lastLoadedSessionId,
	filteredSessions,
	searchSessions = false;

document.addEventListener("DOMContentLoaded", async () => {
	try {
		let response = await fetch("/admin/getFirstSessions", {
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
			sessions = data
			filteredSessions = data;
			lastLoadedSessionId = data[0].id;
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}

	renderSessions();

	const containerTable = document.getElementById("session-table");
	let button = document.createElement("button");
	button.classList.add("table__load-more-btn");
	button.id = "loadMoreSessionsBtn";
	button.textContent = "Load More";
	containerTable.append(button);

	button.addEventListener("click", async () => {
		await loadMoreSessions();
	});

	if (sessions.length < batchSize) {
		button.style.display = "none";
	}
});

function renderSessions(insertToBegin = true) {
	const container = document.getElementById("tableContentSessions");
	const end = currentIndexSessions + batchSize;
	const slice = filteredSessions.slice(currentIndexSessions, end);

	slice.forEach((session) =>
		addSessionToTable(container, session, insertToBegin)
	);

	currentIndexSessions = end;
}

function addSessionToTable(container, session, insertToBegin) {
	const sessionHtml = `
        <div class="table__row">
            <div class="table__cell table__cell_content_id" data-label="ID">
                <p class="table__cell-text">${session.id}</p>
            </div>
            <div class="table__cell table__cell_content_application" data-label="Application">
                <p class="table__cell-text">${session.application}</p>
            </div>
            <div class="table__cell table__cell_content_secret-key" data-label="Secret key">
                <p class="table__cell-text">${session.secretKey}</p>
            </div>
            <div class="table__cell table__cell_content_hash" data-label="Hash">
                <p class="table__cell-text">${session.hash}</p>
            </div>
            <div class="table__cell table__cell_content_ip" data-label="IP">
                <p class="table__cell-text">${session.ip}</p>
            </div>
            <div class="table__cell table__cell_content_actions" data-label="Actions">
                <p class="table__cell-text">${session.countActions}</p>
                <button class="table__detail-btn" onclick="openDetailInfoActions(${session.id})"></button>
            </div>
            <div class="table__cell table__cell_content_bets" data-label="Bets">
                <p class="table__cell-text">${session.countBets}</p>
                <button class="table__detail-btn" onclick="openDetailInfoBets(${session.id})"></button>
            </div>
            <div class="table__cell table__cell_content_creation-date" data-label="Creation">
                <p class="table__cell-text">${formatDate(session.timestamp)}</p>
            </div>
        </div>`;

	if (insertToBegin) container.insertAdjacentHTML("afterbegin", sessionHtml);
	else container.insertAdjacentHTML("beforeend", sessionHtml);
}

async function loadMoreSessions() {
	if (lastLoadedSessionId === null) return;

	if (searchSessions) {
		const end = currentIndexSessions + batchSize;
		const slice = filteredSessions.slice(currentIndexSessions, end);
		if (slice.length > 0) {
			renderSessions(false);
		} else {
			document.getElementById("loadMoreSessionsBtn").style.display =
				"none";
		}
	} else {
		try {
			let response = await fetch("/admin/loadMoreSessions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ lastId: lastLoadedSessionId }),
			});

			if (!response.ok) {
				console.log("Network response was not ok");
				return;
			}

			let data = await response.json();

			if (data.length > 0) {
				filteredSessions = filteredSessions.concat(data);
				lastLoadedSessionId = data[data.length - 1].id;
				renderSessions(false);
			}

			if (data.length < batchSize) {
				document.getElementById("loadMoreSessionsBtn").style.display =
					"none";
			}
		} catch (error) {
			console.error("Fetch error:", error);
		}
	}
}

async function searchTableSessions(event) {
	event.preventDefault();

	let input = document
		.getElementById("searchInputSessions")
		.value.toLowerCase();
	const tableContentSessions = document.getElementById(
		"tableContentSessions"
	);
	const loadMoreButton = document.getElementById("loadMoreSessionsBtn");

	if (input === "") {
		filteredSessions = sessions;
		currentIndexSessions = 0;
		lastLoadedSessionId = sessions.length > 0 ? sessions[0].id : null;
		tableContentSessions.innerHTML = "";

		if (sessions.length > batchSize) loadMoreButton.style.display = "block";

		renderSessions();
		searchSessions = false;
		return;
	}

	let searchTerms = input.split("+").map((term) => term.trim());

	try {
		let response = await fetch("/admin/searchSessions", {
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

		tableContentSessions.innerHTML = "";
		if (data.length > 0) {
			filteredSessions = data;
			currentIndexSessions = 0;
			searchSessions = true;
			renderSessions(false);
		} else {
			tableContentSessions.innerHTML =
				'<div class="table__no-data">Данные отсутствуют</div>';
		}

		if (data.length < batchSize) {
			loadMoreButton.style.display = "none";
		} else {
			loadMoreButton.style.display = "block";
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}
}

function openDetailExcelBetsWindow() {
	document.getElementById("license-key-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";
}

function openDetailInfoActions(sessionId) {
	const session = filteredSessions.find((s) => s.id === sessionId);
	document.getElementById("action-detail-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const jsonObjects = JSON.parse(session.actions);
	const actionContainer = document.getElementById("detail-action");
	actionContainer.innerHTML = "";

	if (jsonObjects && jsonObjects.length > 0) {
		jsonObjects.forEach((obj) => {
			try {
				const sessionHtml = `
                    <div class="popup__action-block">
                        <div class="popup__action-info">
                            <p class="popup__action-title">${obj.title}</p>
                            <p class="popup__action-message">${obj.message}</p>
                        </div>
                        <p class="popup__action-date">${formatDate(obj.timestamp, true)}</p>
                    </div>
                `;
				actionContainer.innerHTML += sessionHtml;
			} catch (error) {
				console.error("Ошибка при парсинге JSON:", error);
			}
		});
	} else {
		const html = `<p class="popup__no-data">Данные отсутствуют</p>`;
		actionContainer.innerHTML += html;
	}
}

function openDetailInfoBets(sessionId) {
	const session = filteredSessions.find((s) => s.id === sessionId);
	document.getElementById("session-bet-detail-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const jsonObjects = JSON.parse(session.bets);
	const actionContainer = document.getElementById("detail-bet");
	actionContainer.innerHTML = "";

	if (jsonObjects && jsonObjects.length > 0) {
		jsonObjects.forEach((obj) => {
			try {
				const couponsHtml = obj.coupons
					.map(
						(coupon) => `
                    <div class="popup__bet-coupon">
                        <p class="popup__bet-game">${coupon.game || "N/A"}</p>
                        <p class="popup__bet-market">${coupon.market || "N/A"}</p>
                        <p class="popup__bet-odd">Коэффициент: <span class="popup__bet-odd-amount">${coupon.odd || "N/A"}</span></p>
                    </div>
                `
					)
					.join("");

				const sessionHtml = `
                    <div class="popup__bet-block">
                        ${couponsHtml}
                        <div class="popup__bet-info">
                            <div class="popup__bet-detail">
                                <p class="popup__bet-date">${formatDate(obj.timestamp, true)}</p>
                            </div>
                            <div class="popup__bet-size">
                                <p class="popup__bet-currency">${obj.currency || "N/A"}</p>
                                <p class="popup__bet-amount">${obj.amount || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                `;
				actionContainer.innerHTML += sessionHtml;
			} catch (error) {
				console.error("Ошибка при парсинге JSON:", error);
			}
		});
	} else {
		const html = `<p class="popup__no-data">Данные отсутствуют</p>`;
		actionContainer.innerHTML += html;
	}
}

async function exportToExcelBets() {
	try {
		const startDate = new Date(document.getElementById("start-date-bets").value);
		const startTimestamp = startDate.setHours(0, 0, 0, 0) / 1000;

		const endDate = new Date(document.getElementById("end-date-bets").value);
		const endTimestamp = endDate.setHours(23, 59, 59, 999) / 1000;

		const body = {
			startDate: startTimestamp,
			endDate: endTimestamp,
			licenseKey: document.getElementById("license-key").value,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/admin/exportToExcelBets", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let blob = await response.blob();

			let url = window.URL.createObjectURL(blob);
			let a = document.createElement("a");
			a.href = url;
			a.download = "bets.xlsx";
			document.body.appendChild(a);
			a.click();
			a.remove();

			sendNotification("Экспорт данных", "Экспорт данных успешен.", "success");
			closePopup();
		} else {
			sendNotification("Экспорт данных", "Экспорт данных неудачный.\nResponse status: " + response.status, "error");
		}
	} catch (e) {
		console.log(e);
		sendNotification("Экспорт данных", "Экспорт данных неудачный.\nError: " + e.toString(), "error");
	}
}