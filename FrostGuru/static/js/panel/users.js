let currentIndexUser = 0;
let lastLoadedUserId = users.length > 0 ? users[users.length - 1].id : null;
let filteredUsers = users;
let searchUsers = false;

document.addEventListener('DOMContentLoaded', ()=> {
    renderUsers();

    const containerTable = document.getElementById('user-table');
    const button = document.createElement('button');
    button.className = 'table__load-more-btn';
    button.id = 'loadMoreUsersBtn';
    button.textContent = 'Load More';
    containerTable.appendChild(button);

    button.addEventListener('click', async ()=> {
        await loadMoreUsers();
    });

    if (users.length < batchSize) {
        button.style.display = 'none';
    }
});

function renderUsers() {
    const container = document.getElementById('tableContentUsers');
    const end = currentIndexUser + batchSize;
    const slice = filteredUsers.slice(currentIndexUser, end);

    slice.forEach((user)=> {
        const currentTime = Math.floor(Date.now() / 1000);
        let rowClass = '';

        if (user.banned) {
            rowClass = 'table__row_banned-user';
        } else if (user.endLicense < currentTime) {
            rowClass = 'table__row_expired-license';
        }

        const userHtml = `
            <div class="table__row ${rowClass}">
                <div class="table__cell table__cell_content_id">
                    <p class="table__cell-text">${user.id}</p>
                </div>
                <div class="table__cell table__cell_content_application">
                    <p class="table__cell-text">${user.application}</p>
                </div>
                <div class="table__cell table__cell_content_secret-key">
                    <p class="table__cell-text">${user.secretKey}</p>
                </div>
                <div class="table__cell table__cell_content_description">
                    <p class="table__cell-text">${user.description}</p>
                </div>
                <div class="table__cell table__cell_content_version">
                    <p class="table__cell-text">${user.version}</p>
                </div>
                <div class="table__cell table__cell_content_last-use">
                    <p class="table__cell-text">${user.convertedLastUse}</p>
                </div>
                <div class="table__cell table__cell_content_end-license">
                    <p class="table__cell-text">${user.convertedEndLicense}</p>
                </div>
                <div class="table__cell table__cell_content_connections">
                    <p class="table__cell-text">${user.currentConnections}/${user.maxConnections}</p>
                </div>
                <div class="table__cell table__cell_content_tg-id">
                    <p class="table__cell-text">${user.telegramId}</p>
                </div>
                <div class="table__cell table__cell_content_creator">
                  <p class="table__cell-text">${user.creator}</p>
                </div>
                <div class="table__cell table__cell_content_creation-date">
                  <p class="table__cell-text">${user.convertedCreationDate}</p>
                </div>
                <div class="table__cell table__cell_content_banned">
                    <p class="table__cell-text">${user.banned}</p>
                </div>
                <div class="table__action-block">
                    <button class="table__action-btn table__action-btn_action_edit"
                            data-user-id="${user.id}" data-application="${user.application}"
                            data-secret-key="${user.secretKey}" data-description="${user.description}"
                            data-max-connections="${user.maxConnections}"
                            data-telegram-id="${user.telegramId}" data-readed="${user.readed}"
                            onclick="openEditWindow(this)"></button>
                    <button class="table__action-btn table__action-btn_action_license-renewal" onclick="openAddLicenseWindow(${user.id})"></button>
                    <button class="table__action-btn table__action-btn_action_ban" onclick="openBanUser(${user.id})"></button>
                    <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteWindow(${user.id})"></button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', userHtml);
    });

    currentIndexUser = end;
}

async function loadMoreUsers() {
    if (lastLoadedUserId === null) return;

    if (searchUsers) {
        const end = currentIndexUser + batchSize;
        const slice = filteredUsers.slice(currentIndexUser, end);
        if (slice.length > 0) {
            renderUsers();
        } else {
            document.getElementById('loadMoreUsersBtn').style.display = 'none';
        }
    } else {
        try {
            let response = await fetch('/admin/loadMoreUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastId: lastLoadedUserId })
            });

            if (!response.ok) {
                console.log('Network response was not ok');
                return;
            }

            let data = await response.json();

            if (data.length > 0) {
                filteredUsers = filteredUsers.concat(data);
                lastLoadedUserId = data[data.length - 1].id;
                renderUsers();
            }

            if (data.length < batchSize) {
                document.getElementById('loadMoreUsersBtn').style.display = 'none';
            }

        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

async function searchTableUsers(event) {
    event.preventDefault();

    let input = document.getElementById('searchInputUsers').value.toLowerCase();
    const tableContentUsers = document.getElementById('tableContentUsers');
    const loadMoreButton = document.getElementById('loadMoreUsersBtn');

    if (input === '') {
        filteredUsers = users;
        currentIndexUser = 0;
        lastLoadedUserId = 0;
        tableContentUsers.innerHTML = '';

        if (users.length > batchSize) loadMoreButton.style.display = 'block';

        renderUsers();
        searchUsers = true;
        return;
    }

    let searchTerms = input.split('+').map(term => term.trim());

    try {
        let response = await fetch('/admin/searchUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchTerms: searchTerms })
        });

        if (!response.ok) {
            console.log('Network response was not ok');
            return;
        }

        let data = await response.json();

        if (data.length > 0) {
            filteredUsers = data;
            currentIndexUser = 0;
            searchUsers = true;
            tableContentUsers.innerHTML = '';
            renderUsers();
        }

        if (data.length < batchSize) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function openBanUser(userId) {
    document.getElementById('ban-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('ban-user-button').setAttribute('data-userId', userId);
}

async function banUser(element) {
    let response = await fetch('/admin/banUser/' + element.getAttribute("data-userId"), {
        method: 'POST'
    })

    if (!response.ok) throw new Error('Network response was not ok')
    else location.reload()
}

function openAddWindow() {
    document.getElementById('add-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('secret-key-user').value = generateRandomKey();
}

function generateRandomKey() {
    const digits = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function getRandomDigit() {
        return digits.charAt(Math.floor(Math.random() * digits.length));
    }

    function getRandomLetter() {
        return letters.charAt(Math.floor(Math.random() * letters.length));
    }

    return `${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}-${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}-${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}-${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}`;
}

function openEditWindow(element) {
    document.getElementById('edit-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonEdit = document.getElementById('edit-user-button');
    buttonEdit.setAttribute("data-userId", element.getAttribute("data-userId"));
    document.getElementById('edit-user-application').value = element.getAttribute("data-application");
    document.getElementById('secret-key-edit-user').value = element.getAttribute("data-secretKey");
    document.getElementById('description-edit-user').value = element.getAttribute("data-description");
    document.getElementById('telegram-id-user-edit').value = element.getAttribute("data-telegramId");
    document.getElementById('edit-max-connections').value = element.getAttribute("data-maxConnections");

    const readed = element.getAttribute("data-readed") === "1";
    const readedToggle = document.getElementById('readed-user-edit');
    if (readed) {
        readedToggle.textContent = 'Readed';
        readedToggle.classList.add('popup__toggle-switch_readed');
    } else {
        readedToggle.textContent = 'Unread';
        readedToggle.classList.remove('popup__toggle-switch_readed');
    }
}

function openAddLicenseWindow(userId) {
    document.getElementById('date-shift-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonAddLicense = document.getElementById('date-shift-button');
    buttonAddLicense.setAttribute("data-userId", userId);
}

function openDeleteWindow(userId) {
    document.getElementById('delete-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonDelete = document.getElementById('delete-user-button');
    buttonDelete.setAttribute("data-userId", userId);
}

async function addUser() {
    const application = document.getElementById('application-name').value;
    const secretKey = document.getElementById('secret-key-user').value;
    const telegramId = document.getElementById('telegram-id-user').value;
    const description = document.getElementById('description-user').value;
    const maxConnections = document.getElementById('max-connections').value;

    const period = document.getElementById('period-addUser').textContent;
    const count = document.getElementById('count-period-addUser').value;

    let body = {
        "application": application,
        "secretKey": secretKey,
        "period": period,
        "count": count,
        "telegramId": telegramId,
        "description": description,
        "maxConnections": maxConnections
    }

    let headers = {
        "Content-Type": "application/json"
    }

    let response = await fetch('/admin/addUser', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error('Network response was not ok')
    else location.reload()
}

async function editUser(element) {
    const userId = element.getAttribute("data-userId");
    const application = document.getElementById('edit-user-application').value;
    const secretKey = document.getElementById('secret-key-edit-user').value;
    const telegramId = document.getElementById('telegram-id-user-edit').value;
    const description = document.getElementById('description-edit-user').value;
    const maxConnections = document.getElementById('edit-max-connections').value;

    let body = {
        "userId": userId,
        "application": application,
        "secretKey": secretKey,
        "telegramId": telegramId,
        "description": description,
        "maxConnections": maxConnections
    }

    let headers = {
        "Content-Type": "application/json"
    }

    let response = await fetch('/admin/editUser', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error('Network response was not ok')
    else location.reload()
}

async function editEndLicenseUser(element) {
    const period = document.getElementById('period-editLicense').textContent;
    const count = document.getElementById('license-period').value;
    const userId = element.getAttribute("data-userId");

    let body = {
        "userId": userId,
        "period": period,
        "count": count
    }

    let headers = {
        "Content-Type": "application/json"
    }

    let response = await fetch('/admin/addLicense', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error('Network response was not ok')
    else location.reload()
}

async function deleteUser(element) {
    let response = await fetch('/admin/deleteUser/' + element.getAttribute("data-userId"), {
        method: 'POST'
    })

    if (!response.ok) throw new Error('Network response was not ok')
    else location.reload()
}