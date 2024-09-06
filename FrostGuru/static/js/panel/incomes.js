let currentIndexIncome = 0;
let lastLoadedIncomeId = incomes.length > 0 ? incomes[incomes.length - 1].id : null;
let filteredIncomes = incomes;
let searchIncomes = false;

document.addEventListener('DOMContentLoaded', ()=> {
    renderIncomes()
    const containerTable = document.querySelector('#income-table')
    let button = document.createElement('button')
    button.classList.add('table__load-more-btn')
    button.id = 'loadMoreIncomesBtn'
    button.textContent = 'Load More'
    containerTable.append(button)

    button.addEventListener('click', loadMoreIncomes)

    if (apps.length < batchSize){
        button.style.display = 'none'
    }
})

function editTableRowIncome(income) {
    const incomeRow = document.querySelector(`div.table__row[data-incomeId="${income.id}"]`);
    incomeRow.innerHTML = getTableRowContentIncome(income)
}

function addIncomeToTable(container, income) {
    const incomeHtml = `
            <div class="table__row" data-incomeId="${income.id}">
                ${getTableRowContentIncome(income)}
			</div>
        `;
    container.insertAdjacentHTML('afterbegin', incomeHtml);
}

function getTableRowContentIncome(income) {
    return `
        <div class="table__cell table__cell_content_application" data-label="Application">
            <p class="table__cell-text">${income.application}</p>
        </div>
        <div class="table__cell table__cell_content_secret-key" data-label="Secret key">
            <p class="table__cell-text">${income.secretKey}</p>
        </div>
        <div class="table__cell table__cell_content_price" data-label="Price">
            <p class="table__cell-text">${income.price.toFixed(2)}$</p>
        </div>
        <div class="table__cell table__cell_content_discount" data-label="Discount">
            <p class="table__cell-text">${income.discount.toFixed(2)}%</p>
        </div>
        <div class="table__cell table__cell_content_discounted-price" data-label="Discounted price">
            <p class="table__cell-text">${income.discountedPrice.toFixed(2)}$</p>
        </div>
        <div class="table__cell table__cell_content_partner" data-label="Partner">
            <p class="table__cell-text">${income.partner}</p>
        </div>
        <div class="table__cell table__cell_content_partner-percentage" data-label="Partner percentage">
            <p class="table__cell-text">${income.partnerPercentage.toFixed(2)}%</p>
        </div>
        <div class="table__cell table__cell_content_date" data-label="Date">
            <p class="table__cell-text">${formatDate(income.date)}</p>
        </div>
        <div class="table__cell table__cell_content_description" data-label="Description">
            <p class="table__cell-text">${income.description}</p>
        </div>
        <div class="action-block table__action-block">
            <button class="action-btn action-btn_action_edit action-block__action-btn" data-incomeId="${income.id}" data-application="${income.application}"
                    data-secretKey="${income.secretKey}" data-price="${income.price}"
                    data-discount="${income.discount}" data-partner="${income.partner}"
                    data-partnerPercentage="${income.partnerPercentage}" data-description="${income.description}"
                    onclick="openEditIncomeWindow(this)"></button>
            <button class="action-btn action-btn_action_delete action-block__action-btn" onclick="openDeleteIncomeWindow(${income.id})"></button>
            ${getActionButtons(income)}
        </div>`
}

function renderIncomes() {
    const container = document.querySelector('#tableContentIncomes');
    const end = currentIndexIncome + batchSize;
    const slice = filteredIncomes.slice(currentIndexIncome, end);

    slice.forEach((income)=> addIncomeToTable(container, income))
    currentIndexIncome = end;
}

async function loadMoreIncomes() {
    if (lastLoadedIncomeId === null) return;

    if (searchIncomes) {
        const end = currentIndexIncome + batchSize;
        const slice = filteredIncomes.slice(currentIndexIncome, end);
        if (slice.length > 0) {
            renderIncomes()
        } else {
            document.querySelector('#loadMoreIncomesBtn').style.display = 'none'
        }
    } else {
        try {
            let response = await fetch('/admin/loadMoreIncomes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({lastId: lastLoadedIncomeId})
            });

            if (!response.ok) {
                console.log('Network response was not ok')
                return
            }

            let data = await response.json();

            if (data.length > 0) {
                filteredIncomes = filteredIncomes.concat(data);
                lastLoadedIncomeId = data[data.length - 1].id;
                renderIncomes();
            }

            if (data.length < batchSize) {
                document.querySelector('#loadMoreIncomesBtn').style.display = 'none'
            }

        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

async function searchTableIncomes(event) {
    event.preventDefault();

    let input = document.getElementById('searchInputIncomes').value.toLowerCase();
    if (input === '') {
        filteredIncomes = incomes;
        currentIndexIncome = 0;
        lastLoadedIncomeId = 0;
        document.querySelector('#tableContentIncomes').textContent = ''
        document.querySelector('#loadMoreIncomesBtn').style.display = 'block'
        renderIncomes();
        searchIncomes = false;
        return;
    }

    let searchTerms = input.split('+').map(term => term.trim());

    try {
        let response = await fetch('/admin/searchIncomes', {
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
            filteredIncomes = data;
            currentIndexIncome = 0;
            searchIncomes = true;
            document.querySelector('#tableContentIncomes').textContent = ''
            renderIncomes();
        }

        if (data.length < batchSize){
            document.querySelector('#loadMoreIncomesBtn').style.display = 'none'
        } else {
            document.querySelector('#loadMoreIncomesBtn').style.display = 'block'
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function getActionButtons(income) {
    if (income.buttonActive) {
        if (income.paidOut) {
            return `<button class="action-btn action-btn_action_payment action-btn_payment-state_paid"></button>`;
        } else {
            return `<button class="action-btn action-btn_action_payment action-btn_payment-state_payable" onclick="openConfirmPaidOut(${income.id})"></button>`;
        }
    } else {
        if (income.partner === '') {
            return `<button class="action-btn action-btn_action_payment action-btn_payment-state_unpayable" disabled></button>`;
        } else {
            return `<button class="action-btn action-btn_action_payment action-btn_payment-state_payable" disabled></button>`;
        }
    }
}

function openEditIncomeWindow(element) {
    document.getElementById('edit-income-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonEdit = document.getElementById('edit-income-button');
    buttonEdit.setAttribute("data-incomeId", element.getAttribute("data-incomeId"));
    document.getElementById('edit-application-income').value = element.getAttribute("data-application");
    document.getElementById('edit-income-secretKey').value = element.getAttribute("data-secretKey");
    document.getElementById('price').value = element.getAttribute("data-price");
    document.getElementById('discount').value = element.getAttribute("data-discount");
    document.getElementById('partner').value = element.getAttribute("data-partner");
    document.getElementById('partner-percentage').value = element.getAttribute("data-partnerPercentage");
    document.getElementById('description-sale-record').value = element.getAttribute("data-description");
}

function openDeleteIncomeWindow(incomeId) {
    document.getElementById('delete-income-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonDelete = document.getElementById('delete-income-button');
    buttonDelete.setAttribute("data-incomeId", incomeId);
}

function openConfirmPaidOut(incomeId) {
    document.getElementById('confirm-payment-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonAccept = document.getElementById('accept-payment-button');
    buttonAccept.setAttribute("data-incomeId", incomeId);
}

function openDetailingWindow() {
    document.getElementById('detailing-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

function openAddIncomeWindow() {
    document.getElementById('add-income-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

function getIncomesInfo() {
    const startDate = new Date(document.getElementById('date-start').value).getTime() / 1000;
    const endDate = new Date(document.getElementById('date-end').value).getTime() / 1000;

    const infoIncomesRequest = {
        "startDate": startDate,
        "endDate": endDate
    };

    fetch('/admin/infoIncomes', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(infoIncomesRequest)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.querySelector('.detailing-popup__income-detail').style.display = 'flex';
            document.getElementById('totalIncome').textContent = data.totalIncome.toFixed(2) + " $";
            document.getElementById('totalPartnerIncome').textContent = data.totalPartnerIncome.toFixed(2) + " $";
            document.getElementById('serviceIncome').textContent = data.serviceIncome.toFixed(2) + " $";
            document.getElementById('qworteIncome').textContent = data.qworteIncome.toFixed(2) + " $";
            document.getElementById('vincentIncome').textContent = data.vincentIncome.toFixed(2) + " $";
        })
        .catch(() => {
            closePopup();
        });
}

async function addIncome() {
    try {
        let body = {
            application: document.getElementById('income-name-application').value,
            secretKey: document.getElementById('income-secretKey').value,
            price: document.getElementById('income-price').value,
            discount: document.getElementById('income-discount').value,
            partner: document.getElementById('income-partner').value,
            partnerPercentage: document.getElementById('income-percentagePartner').value,
            description: document.getElementById('income-description').value
        }

        let headers = {
            "Content-Type": "application/json"
        }

        let response = await fetch('/admin/addIncome', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {
                sendNotification('Добавление записи', 'Запись была добавлена.', 'success')

                addIncomeToTable(document.querySelector('#tableContentIncomes'), data.income)
                incomes.push(data.income)
                closePopup()
                resetModalProperties('add-income-popup')
            } else sendNotification('Добавление записи', 'Не удалось добавить записи.\nError: '+data.message, 'error')
        } else {
            sendNotification('Добавление записи', 'Не удалось добавить записи.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Добавление записи', 'Не удалось добавить записи.\nError: '+e.toString(), 'error')
    }
}

async function editIncome(element) {
    try {
        let body = {
            incomeId: element.getAttribute("data-incomeId"),
            application: document.getElementById('edit-application-income').value,
            secretKey: document.getElementById('edit-income-secretKey').value,
            price: document.getElementById('price').value,
            discount: document.getElementById('discount').value,
            partner: document.getElementById('partner').value,
            partnerPercentage: document.getElementById('partner-percentage').value,
            description: document.getElementById('description-sale-record').value
        }

        let headers = {
            "Content-Type": "application/json"
        }

        let response = await fetch('/admin/editIncome', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {
                sendNotification('Редактирование записи', 'Запись была изменена.', 'success')

                incomes = incomes.map(income => income.id === data.income.id ? data.income : income);
                editTableRowIncome(data.income)
                closePopup()
            } else sendNotification('Редактирование записи', 'Не удалось изменить запись.\nError: '+data.message, 'error')
        } else {
            sendNotification('Редактирование записи', 'Не удалось изменить запись.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Редактирование записи', 'Не удалось изменить запись.\nError: '+e.toString(), 'error')
    }
}

async function deleteIncome(element) {
    try {
        let response = await fetch('/admin/deleteIncome/'+element.getAttribute("data-incomeId"), {
            method: 'POST'
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {
                sendNotification('Удаление записи', 'Запись была успешно удалена.', 'success')

                document.querySelector('.table_content_income .table__row[data-incomeId="'+element.getAttribute("data-incomeId")+'"]').remove()
                incomes = incomes.filter(income => income.id !== data.incomeId);

                closePopup()
            } else sendNotification('Удаление записи', 'Не удалось удалить запись.\nError: '+data.message, 'error')
        } else {
            sendNotification('Удаление записи', 'Не удалось удалить запись.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Удаление записи', 'Не удалось удалить запись.\nError: '+e.toString(), 'error')
    }
}

async function paidOut(element) {
    try {
        let response = await fetch('/admin/paidOutIncome/'+element.getAttribute("data-incomeId"), {
            method: 'POST'
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {
                sendNotification('Выплата партнеру', 'Выплата партнеру успешно зарегистрирована.', 'success')

                let income_row = document.querySelector('.table_content_income .table__row[data-incomeId="'+element.getAttribute("data-incomeId")+'"]')
                income_row.querySelector('.action-btn_action_payment').remove()
                income_row.querySelector('.action-block.table__action-block').innerHTML += getActionButtons(data.income)
                incomes = incomes.map(income => income.id === data.income.id ? data.income : income);

                editTableRowIncome(data.income)
                closePopup()
            } else sendNotification('Выплата партнеру', 'Не удалось изменить статус выплаты.\nError: '+data.message, 'error')
        } else {
            sendNotification('Выплата партнеру', 'Не удалось изменить статус выплаты.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Выплата партнеру', 'Не удалось изменить статус выплаты.\nError: '+e.toString(), 'error')
    }
}