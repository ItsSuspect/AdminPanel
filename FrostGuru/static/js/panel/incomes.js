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

function renderIncomes() {
    const container = document.querySelector('#tableContentIncomes');
    const end = currentIndexIncome + batchSize;
    const slice = filteredIncomes.slice(currentIndexIncome, end);

    slice.forEach(income => {
        const incomeHtml = `
            <div class="table__row">
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
                    <p class="table__cell-text">${income.convertedDate}</p>
                </div>
                <div class="table__cell table__cell_content_description" data-label="Description">
                    <p class="table__cell-text">${income.description}</p>
                </div>
                <div class="table__action-block">
                    <button class="table__action-btn table__action-btn_action_edit" data-incomeId="${income.id}" data-application="${income.application}"
                            data-secretKey="${income.secretKey}" data-price="${income.price}"
                            data-discount="${income.discount}" data-partner="${income.partner}"
                            data-partnerPercentage="${income.partnerPercentage}" data-description="${income.description}"
                            onclick="openEditIncomeWindow(this)"></button>
                    <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteIncomeWindow(${income.id})"></button>
                    ${getActionButtons(income)}
                </div>
			</div>
        `;
        container.append(incomeHtml);
    });
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
        $('#tableContentIncomes').empty();
        $('#loadMoreIncomesBtn').show();
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
            $('#tableContentIncomes').empty();
            renderIncomes();
        }

        if (data.length < batchSize){
            $('#loadMoreIncomesBtn').hide();
        } else $('#loadMoreIncomesBtn').show();
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function getActionButtons(income) {
    if (income.buttonActive) {
        if (income.paidOut) {
            return `<button class="table__payment-btn table__payment-btn_paid"></button>`;
        } else {
            return `<button class="table__payment-btn" onclick="openConfirmPaidOut(${income.id})"></button>`;
        }
    } else {
        return `<button class="table__payment-btn" disabled></button>`;
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

function addIncome() {
    const application = document.getElementById('income-name-application').value;
    const secretKey = document.getElementById('income-secretKey').value;
    const price = document.getElementById('income-price').value;
    const discount = document.getElementById('income-discount').value;
    const partner = document.getElementById('income-partner').value;
    const partnerPercentage = document.getElementById('income-percentagePartner').value;
    const description = document.getElementById('income-description').value;

    const addIncomeRequest = {
        "application": application,
        "secretKey": secretKey,
        "price": price,
        "discount": discount,
        "partner": partner,
        "partnerPercentage": partnerPercentage,
        "description": description
    };

    fetch('/admin/addIncome', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(addIncomeRequest)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text)
                });
            }
        })
        .then(() => {
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            closePopup();
        });
}

function editIncome(element) {
    const incomeId = element.getAttribute("data-incomeId");
    const application = document.getElementById('edit-application-income').value;
    const secretKey = document.getElementById('edit-income-secretKey').value;
    const price = document.getElementById('price').value;
    const discount = document.getElementById('discount').value;
    const partner = document.getElementById('partner').value;
    const partnerPercentage = document.getElementById('partner-percentage').value;
    const description = document.getElementById('description-sale-record').value;

    const editIncomeRequest = {
        "incomeId": incomeId,
        "application": application,
        "secretKey": secretKey,
        "price": price,
        "discount": discount,
        "partner": partner,
        "partnerPercentage": partnerPercentage,
        "description": description
    };

    fetch('/admin/editIncome', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(editIncomeRequest)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        })
        .then(() => {
            location.reload();
        })
        .catch(() => {
            closePopup();
        });
}

function deleteIncome(element) {
    fetch('/admin/deleteIncome/' + element.getAttribute("data-incomeId"), {
        method: 'POST',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        })
        .then(() => {
            location.reload();
        })
        .catch(() => {
            closePopup();
        });
}

function paidOut(element) {
    fetch('/admin/paidOutIncome/' + element.getAttribute("data-incomeId"), {
        method: 'POST',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        })
        .then(() => {
            location.reload();
        })
        .catch(() => {
            closePopup();
        });
}