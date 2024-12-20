let currentIndexAccounts = 0;
let lastLoadedAccountId = accounts.length > 0 ? accounts[accounts.length - 1].id : null;
let filteredAccounts = accounts;
let searchAccounts = false;

$(document).ready(function () {
	renderAccounts();
	const containerTable = $('#account-table');
	const button = `<button class="table__load-more-btn" id="loadMoreAccounts">Load More</button>`;
	containerTable.append(button);

	$('#loadMoreAccounts').click(async function () {
		await loadMoreAccounts();
	});

	if (accounts.length < batchSize) {
		$('#loadMoreAccounts').hide();
	}
});

function renderAccounts() {
	const container = $('#account-table-content');
	const end = currentIndexAccounts + batchSize;
	const slice = filteredAccounts.slice(currentIndexAccounts, end);

	slice.forEach(account => {
		const accountHtml = `
            <div class="table__row">
                <div class="table__cell table__cell_content_id" data-label="ID">
                    <p class="table__cell-text">${account.id}</p>
                </div>
                <div class="table__cell table__cell_content_account" data-label="Account">
                    <p class="table__cell-text">${account.account}</p>
                </div>
                <div class="table__cell table__cell_content_application" data-label="Application">
                    <p class="table__cell-text">${account.app || 'null'}</p>
                </div>
                <div class="table__cell table__cell_content_deposits" data-label="Deposits">
                    <p class="table__cell-text">${Number(account.sumDeposits).toFixed(2)}</p>
                    <button class="table__detail-btn" onclick="openDetailInfoDeposits(${account.id})"></button>
                </div>
                <div class="table__cell table__cell_content_withdraws" data-label="Withdraws">
                    <p class="table__cell-text">${Number(account.sumWithdraws).toFixed(2)}</p>
                    <button class="table__detail-btn" onclick="openDetailInfoWithdraws(${account.id})"></button>
                </div>
                <div class="table__cell table__cell_content_balances" data-label="Balances">
                    <p class="table__cell-text">${account.lastBalance || "?"}</p>
                    <button class="table__detail-btn" onclick="openDetailInfoBalance(${account.id})"></button>
                </div>
                <div class="table__cell table__cell_content_bets" data-label="Bets">
                    <p class="table__cell-text">${account.countBets}</p>
                    <button class="table__detail-btn" onclick="openDetailInfoBetsAccount(${account.id})"></button>
                </div>
                <div class="table__cell table__cell_content_session" data-label="Session">
                    <p class="table__cell-text">${account.countSessions}</p>
                    <button class="table__detail-btn" onclick="openDetailInfoSession(${account.id})"></button>
                </div>
                <div class="table__cell table__cell_content_last-use" data-label="Last use">
                    <p class="table__cell-text">${account.lastUseDateConverted}</p>
                </div>
                <div class="table__cell table__cell_content_creation-date" data-label="Creation date">
                    <p class="table__cell-text">${account.createDateConverted}</p>
                </div>
                <div class="table__cell table__cell_content_status" data-label="Status">
                    <div class="table__select select">
                        <div class="select__input" data-value="${account.status || "Выберите"}" onclick="openSelector(this)">${account.status || "Выберите"}</div>
                        <ul class="select__option-list">
                            <li class="select__option" onclick="editCheckStatus(this, ${account.id})">
                                <p class="select__option-value">В работе</p>
                            </li>
                            <li class="select__option" onclick="editCheckStatus(this, ${account.id})">
                                <p class="select__option-value">Вериф</p>
                            </li>
                            <li class="select__option" onclick="editCheckStatus(this, ${account.id})">
                                <p class="select__option-value">На выводе</p>
                            </li>
                            <li class="select__option" onclick="editCheckStatus(this, ${account.id})">
                                <p class="select__option-value">Возврат</p>
                            </li>
                            <li class="select__option" onclick="editCheckStatus(this, ${account.id})">
                                <p class="select__option-value">Слит</p>
                            </li>
                            <li class="select__option" onclick="editCheckStatus(this, ${account.id})">
                                <p class="select__option-value">Отработан</p>
                            </li>
                        </ul>
                    </div>
                    <button class="table__detail-btn" onclick="openDetailInfoStatus(${account.id})"></button>
                </div>
            </div>`;
		container.append(accountHtml);
	});

	currentIndexAccounts = end;
}

async function loadMoreAccounts() {
	if (lastLoadedAccountId === null) return;

	if (searchAccounts) {
		const end = currentIndexAccounts + batchSize;
		const slice = filteredAccounts.slice(currentIndexAccounts, end);
		if (slice.length > 0) {
			renderAccounts()
		} else {
			$('#loadMoreAccounts').hide();
		}
	} else {
		try {
			let response = await fetch('/office/loadMoreAccounts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ lastId: lastLoadedAccountId })
			});

			if (!response.ok) {
				console.log('Network response was not ok')
				return
			}

			let data = await response.json();

			if (data.length > 0) {
				filteredAccounts = filteredAccounts.concat(data);
				lastLoadedAccountId = data[data.length - 1].id;
				renderAccounts();
			}

			if (data.length < batchSize) {
				$('#loadMoreAccounts').hide();
			}

		} catch (error) {
			console.error('Fetch error:', error);
		}
	}
}

async function searchTableAccounts(event) {
	event.preventDefault();

	let input = document.getElementById('searchInputAccounts').value.toLowerCase();
	if (input === '') {
		filteredAccounts = accounts;
		currentIndexAccounts = 0;
		lastLoadedAccountId = 0;
		$('#account-table-content').empty();
		$('#loadMoreAccounts').show();
		renderAccounts();
		searchAccounts = false;
		return;
	}

	let searchTerms = input.split('+').map(term => term.trim());

	try {
		let response = await fetch('/office/searchAccounts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ searchTerms: searchTerms })
		});

		if (!response.ok) {
			console.log('Network response was not ok')
			return
		}

		let data = await response.json();

		if (data.length > 0) {
			filteredAccounts = data;
			currentIndexAccounts = 0;
			searchAccounts = true;
			$('#account-table-content').empty();
			renderAccounts();
		}

		if (data.length < batchSize) {
			$('#loadMoreAccounts').hide();
		} else $('#loadMoreAccounts').show();
	} catch (error) {
		console.error('Fetch error:', error);
	}
}

function redirectionToToken(element) {
	closePopup()
	openUsers()
	document.getElementById('searchInputUsers').value = element.textContent
	searchTableUsers();
}

function redirectionToHash(element) {
	closePopup()
	openSessions()
	document.getElementById('searchInputSessions').value = element.textContent
	searchTableSessions();
}

function openDetailInfoDeposits(accountId) {
	const account = filteredAccounts.find(s => s.id === accountId);
	document.getElementById('deposit-detail-popup').style.display = 'block';
	document.querySelector('.overlay').style.display = 'block';

	const jsonObjects = JSON.parse(account.deposits);
	const actionContainer = document.getElementById('detail-deposits');
	actionContainer.innerHTML = '';

	if (jsonObjects && jsonObjects.length > 0) {
		jsonObjects.reverse()
		jsonObjects.forEach(obj => {
			try {
				const accountHtml = `
                <div class="popup__transaction-block">
                    <div class="popup__transaction-size">
                        <p class="popup__transaction-currency">${obj.currency}</p>
                        <p class="popup__transaction-amount">${obj.amount || 'N/A'}</p>
                    </div>
                    <p class="popup__transaction-date">${formatDate(obj.timestamp)}</p>
                </div>
                `;
				actionContainer.innerHTML += accountHtml;
			} catch (error) {
				console.error('Ошибка при парсинге JSON:', error);
			}
		})
	} else {
		actionContainer.innerHTML += `<p class="popup__no-data">Данные отсутствуют</p>`
	}
	console.log(account)
}

function openDetailInfoWithdraws(accountId) {
	const account = filteredAccounts.find(s => s.id === accountId);
	document.getElementById('withdraw-detail-popup').style.display = 'block';
	document.querySelector('.overlay').style.display = 'block';

	const jsonObjects = JSON.parse(account.withdraws);
	const actionContainer = document.getElementById('detail-withdraws');
	actionContainer.innerHTML = '';

	if (jsonObjects && jsonObjects.length > 0) {
		jsonObjects.reverse()
		jsonObjects.forEach(obj => {
			try {
				const accountHtml = `
                <div class="popup__transaction-block">
                    <div class="popup__transaction-size">
                        <p class="popup__transaction-currency">${obj.currency}</p>
                        <p class="popup__transaction-amount">${obj.amount || 'N/A'}</p>
                    </div>
                    <p class="popup__transaction-date">${formatDate(obj.timestamp)}</p>
                </div>
                `;
				actionContainer.innerHTML += accountHtml;
			} catch (error) {
				console.error('Ошибка при парсинге JSON:', error);
			}
		})
	} else {
		actionContainer.innerHTML += `<p class="popup__no-data">Данные отсутствуют</p>`
	}
	console.log(account)
}

function openDetailInfoBetsAccount(accountId) {
	const account = filteredAccounts.find(s => s.id === accountId);
	document.getElementById('account-bet-detail-popup').style.display = 'block';
	document.querySelector('.overlay').style.display = 'block';

	const jsonObjects = JSON.parse(account.bets);
	const actionContainer = document.getElementById('detail-bets');
	actionContainer.innerHTML = '';

	if (jsonObjects && jsonObjects.length > 0) {
		jsonObjects.reverse()
		jsonObjects.forEach(obj => {
			try {
				const couponsHtml = obj.bets.map(bet => `
                    <div class="popup__bet-coupon">
                        <p class="popup__bet-game">${bet.game || 'N/A'}</p>
                        <p class="popup__bet-market">${bet.market || 'N/A'}</p>
                        <p class="popup__bet-odd">Коэффициент: <span class="popup__bet-odd-amount">${bet.odd || 'N/A'}</span></p>
                    </div>
                `).join('');

				const accountHtml = `
                    <div class="popup__bet-block">
                        ${couponsHtml}
                        <div class="popup__bet-info">
                            <div class="popup__bet-detail">
                                <p class="popup__bet-date">${formatDate(obj.timestamp)}</p>
                                <p class="popup__bet-status">${obj.status || 'N/A'}</p>
                            </div>
                            <div class="popup__bet-size">
                                <p class="popup__bet-currency">${obj.currency || 'N/A'}</p>
                                <p class="popup__bet-amount">${obj.amount || 'N/A'}</p>
                                <p class="popup__payout-separator">➔</p>
                                <p class="popup__payout-currency">${obj.currency || 'N/A'}</p>
                                <p class="popup__payout-amount">${obj.payout || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                `;
				actionContainer.innerHTML += accountHtml;
			} catch (error) {
				console.error('Ошибка при парсинге JSON:', error);
			}
		})
	} else {
		actionContainer.innerHTML += `<p class="popup__no-data">Данные отсутствуют</p>`
	}
	console.log(account)
}

function openDetailInfoSession(accountId) {
	const account = filteredAccounts.find(s => s.id === accountId);
	document.getElementById('session-detail-popup').style.display = 'block';
	document.querySelector('.overlay').style.display = 'block';

	const jsonObjects = JSON.parse(account.sessions);
	const actionContainer = document.getElementById('detail-session');
	actionContainer.innerHTML = '';

	if (jsonObjects && jsonObjects.length > 0) {
		jsonObjects.reverse()
		jsonObjects.forEach(obj => {
			try {
				const accountHtml = `
                <div class="popup__session-block">
                    <div class="popup__session-info">
                        <p class="popup__session-token" onclick="redirectionToToken(this)">${obj.token}</p>
                        <p class="popup__session-hash" onclick="redirectionToHash(this)">${obj.hash}</p>
                    </div>
                    <p class="popup__session-date">${formatDate(obj.timestamp)}</p>
                </div>
                `;
				actionContainer.innerHTML += accountHtml;
			} catch (error) {
				console.error('Ошибка при парсинге JSON:', error);
			}
		})
	} else {
		actionContainer.innerHTML += `<p class="popup__no-data">Данные отсутствуют</p>`
	}
	console.log(account)
}

function openDetailInfoBalance(accountId) {
	const account = filteredAccounts.find((s) => s.id === accountId);
	document.getElementById("balance-detail-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const jsonObjects = JSON.parse(account.historyBalance);
	const actionContainer = document.getElementById("detail-balances");
	actionContainer.innerHTML = "";

	if (jsonObjects && jsonObjects.length > 0) {
		jsonObjects.reverse();
		jsonObjects.forEach((obj) => {
			try {
				const accountHtml = `
                <div class="popup__transaction-block">
                    <div class="popup__transaction-size">
                        <p class="popup__transaction-amount">${obj.amount}</p>
                    </div>
                    <p class="popup__transaction-date">${formatDate(obj.timestamp)}</p>
                </div>
                `;
				actionContainer.innerHTML += accountHtml;
			} catch (error) {
				console.error("Ошибка при парсинге JSON:", error);
			}
		});
	} else {
		actionContainer.innerHTML += `<p class="popup__no-data">Данные отсутствуют</p>`;
	}
	console.log(account);
}

function openDetailInfoStatus(accountId) {
	const account = filteredAccounts.find((s) => s.id === accountId);
	document.getElementById("status-change-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const jsonObjects = JSON.parse(account.historyStatus);
	const actionContainer = document.getElementById("detail-status-history");
	actionContainer.innerHTML = "";

	if (jsonObjects && jsonObjects.length > 0) {
		jsonObjects.reverse();
		jsonObjects.forEach((obj) => {
			try {
				const accountHtml = `
                    <div class="status-change-popup__status-change-block">
                        <div class="status-change-popup__status-info">
                            <p class="status-change-popup__status-value">${obj.oldStatus}</p>
                            <p class="status-change-popup__status-separator">➔</p>
                            <p class="status-change-popup__status-value">${obj.newStatus}</p>
                        </div>
                        <div class="status-change-popup__additional-info">
                            <p class="status-change-popup__changer">${obj.editor}</p>
                            <p class="status-change-popup__date">${formatDate(obj.timestamp)}</p>
                        </div>
                    </div>
                `;
				actionContainer.innerHTML += accountHtml;
			} catch (error) {
				console.error("Ошибка при парсинге JSON:", error);
			}
		});
	} else {
		actionContainer.innerHTML += `<p class="popup__no-data">Данные отсутствуют</p>`;
	}
	console.log(account);
}

async function editCheckStatus(element, account_id) {
	try {
		let body = {
			accountId: account_id,
			status: element.querySelector(".select__option-value").textContent,
		};

		let response = await fetch("/office/editCheckStatus", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();

			if (data.success) {
				selectCurrentValue(element);
			}
		}
	} catch (e) {
		console.log(e);
	}
}

function formatDate(timestamp) {
	const date = new Date(timestamp * 1000);
	const options = {
		timeZone: 'Europe/Moscow',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	};

	return new Intl.DateTimeFormat('ru-RU', options).format(date).replace(',', '');
}