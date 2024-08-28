let currentIndexUsers = 0;
let lastLoadedUserId = users.length > 0 ? users[users.length - 1].id : null;
let filteredUsers = users;
let searchUsers = false;

$(document).ready(function () {
    renderUsers();
    const containerTable = $('#user-table');
    const button = `<button class="table__load-more-btn" id="loadMoreUsers">Load More</button>`;
    containerTable.append(button);

    $('#loadMoreUsers').click(async function () {
        await loadMoreUsers();
    });

    if (users.length < batchSize){
        $('#loadMoreUsers').hide();
    }
});

function renderUsers() {
    const container = $('#user-table-content');
    const end = currentIndexUsers + batchSize;
    const slice = filteredUsers.slice(currentIndexUsers, end);

    slice.forEach(user => {
        const currentTime = Math.floor(Date.now() / 1000);
        let rowClass = "";

        if (user.banned) {
            rowClass = "table__row_banned-user";
        } else if (user.expirationDate < currentTime) {
            rowClass = "table__row_expired-license";
        }

        const userHtml = `
            <div class="table__row ${rowClass}">
                <div class="table__cell table__cell_content_id">
                    <p class="table__cell-text">${user.id}</p>
                </div>
                <div class="table__cell table__cell_content_application">
                    <p class="table__cell-text">${user.app}</p>
                </div>
                <div class="table__cell table__cell_content_token">
                    <p class="table__cell-text">${user.token}</p>
                </div>
                <div class="table__cell table__cell_content_description">
                    <p class="table__cell-text">${user.description}</p>
                </div>
                <div class="table__cell table__cell_content_last-use">
                    <p class="table__cell-text">${user.lastUseDateConverted}</p>
                </div>
                <div class="table__cell table__cell_content_creation-date">
                    <p class="table__cell-text">${user.createDateConverted}</p>
                </div>
                <div class="table__cell table__cell_content_expiration-date">
                    <p class="table__cell-text">${user.expirationDateConverted}</p>
                </div>
                <div class="table__cell table__cell_content_creator">
                    <p class="table__cell-text">${user.creator}</p>
                </div>
                <div class="table__cell table__cell_content_banned">
                    <p class="table__cell-text">${user.banned}</p>
                </div>
                <div class="table__action-block">
					<button class="table__action-btn table__action-btn_action_edit" 
					data-userId="${user.id}" data-app="${user.app}" data-token="${user.token}"
					data-description="${user.description}" data-expirationDate="${user.expirationDate}"
					onclick="openEditUser(this)"></button>
					<button class="table__action-btn table__action-btn_action_ban" onclick="openBanUser(${user.id})"></button>
					<button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteUser(${user.id})"></button>
                </div>
            </div>`;
        container.append(userHtml);
    });

    currentIndexUsers = end;
}

async function loadMoreUsers() {
    if (lastLoadedUserId === null) return;

    if (searchUsers) {
        const end = currentIndexUsers + batchSize;
        const slice = filteredUsers.slice(currentIndexUsers, end);
        if (slice.length > 0) {
            renderUsers()
        } else {
            $('#loadMoreUsers').hide();
        }
    } else {
        try {
            let response = await fetch('/pg_ru/loadMoreUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastId: lastLoadedUserId })
            });

            if (!response.ok) {
                console.log('Network response was not ok')
                return
            }

            let data = await response.json();

            if (data.length > 0) {
                filteredUsers = filteredUsers.concat(data);
                lastLoadedUserId = data[data.length - 1].id;
                renderUsers();
            }

            if (data.length < batchSize){
                $('#loadMoreUsers').hide();
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

async function searchTableUsers(event) {
    if (event) event.preventDefault();

    let input = document.getElementById('searchInputUsers').value.toLowerCase();
    if (input === '') {
        filteredUsers = users;
        currentIndexUsers = 0;
        lastLoadedUserId = 0;
        $('#user-table-content').empty();
        $('#loadMoreUsers').show();
        renderUsers();
        searchUsers = false;
        return;
    }

    let searchTerms = input.split('+').map(term => term.trim());

    try {
        let response = await fetch('/pg_ru/searchUsers', {
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
            filteredUsers = data;
            currentIndexUsers = 0;
            searchUsers = true;
            $('#user-table-content').empty();
            renderUsers();
        }

        if (data.length < batchSize){
            $('#loadMoreUsers').hide();
        } else $('#loadMoreUsers').show();
    } catch (error) {
        console.error('Fetch error:', error);
    }
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

function openAddUser() {
    document.getElementById('add-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('token-user-add').value = generateRandomKey();
}

function openEditUser(element) {
    document.getElementById('edit-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('edit-user-button').setAttribute('data-userId', element.getAttribute('data-userId'));

    document.getElementById('application-name-user-edit').value = element.getAttribute('data-app')
    document.getElementById('token-user-edit').value = element.getAttribute('data-token')
    document.getElementById('description-user-edit').value = element.getAttribute('data-description')

    const timestampInMilliseconds = element.getAttribute('data-expirationDate') * 1000;
    const date = new Date(timestampInMilliseconds);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const dateString = `${year}-${month}-${day}`;
    const timeString = `${hours}:${minutes}`;

    document.getElementById('expiration-date-user-edit').value = dateString;
    document.getElementById('expiration-time-user-edit').value = timeString;
}

function openBanUser(userId) {
    document.getElementById('ban-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('ban-user-button').setAttribute('data-userId', userId);
}

function openDeleteUser(userId) {
    document.getElementById('delete-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('delete-user-button').setAttribute('data-userId', userId);
}

async function addUser() {
    const dateInput = document.getElementById('expiration-date-user-add').value;
    const timeInput = document.getElementById('expiration-time-user-add').value;

    const dateParts = dateInput.split('-');
    const timeParts = timeInput.split(':');

    const date = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2],
        timeParts[0],
        timeParts[1]
    );

    const timestamp = Math.floor(date.getTime() / 1000);
    let body = {
        "app": document.getElementById('application-name-user-add').value,
        "token": document.getElementById('token-user-add').value,
        "endLicense": timestamp,
        "description": document.getElementById('description-user-add').value
    }

    let headers = {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
    }

    let response = await fetch('/pg_ru/addUser', {
        headers: headers,
        body: JSON.stringify(body),
        method: 'POST',
        priority: 'high'
    })

    if (response.ok) {
        location.reload();
    }
}

async function editUser(element) {
    const dateInput = document.getElementById('expiration-date-user-edit').value;
    const timeInput = document.getElementById('expiration-time-user-edit').value;

    const dateParts = dateInput.split('-');
    const timeParts = timeInput.split(':');

    const date = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2],
        timeParts[0],
        timeParts[1]
    );

    const timestamp = Math.floor(date.getTime() / 1000);
    let body = {
        "id": element.getAttribute('data-userId'),
        "app": document.getElementById('application-name-user-edit').value,
        "token": document.getElementById('token-user-edit').value,
        "endLicense": timestamp,
        "description": document.getElementById('description-user-edit').value
    }

    let headers = {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
    }

    let response = await fetch('/pg_ru/editUser', {
        headers: headers,
        body: JSON.stringify(body),
        method: 'POST',
        priority: 'high'
    })

    if (response.ok) {
        location.reload();
    }
}

async function banUser(element) {
    try {
        let response = await fetch('/pg_ru/banUser/' + element.getAttribute("data-userId"), {
            method: 'POST',
            priority: 'high'
        });

        if (response.ok) {
            location.reload();
        } else {
            console.error('Error banning user:', response.statusText);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function deleteUser(element) {
    try {
        let response = await fetch('/pg_ru/deleteUser/' + element.getAttribute("data-userId"), {
            method: 'POST',
            priority: 'high'
        })

        if (response.ok) {
            location.reload()
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}