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
    else if (user.endLicense < currentTime) return " table__row_expired-license";
    return "";
}

function getTableRowContentUser(user) {
    return `
    <div class="table__cell table__cell_content_id" data-label="ID">
        <p class="table__cell-text">${user.id}</p>
    </div>
    <div class="table__cell table__cell_content_application" data-label="Application">
        <p class="table__cell-text">${user.app}</p>
    </div>
    <div class="table__cell table__cell_content_token" data-label="Token">
        <p class="table__cell-text">${user.token}</p>
    </div>
    <div class="table__cell table__cell_content_description" data-label="Description">
        <p class="table__cell-text">${user.description}</p>
    </div>
    <div class="table__cell table__cell_content_last-use" data-label="Last use">
        <p class="table__cell-text">${user.lastUseDateConverted}</p>
    </div>
    <div class="table__cell table__cell_content_creation-date" data-label=Creation date"">
        <p class="table__cell-text">${user.createDateConverted}</p>
    </div>
    <div class="table__cell table__cell_content_expiration-date" data-label="Expiration date">
        <p class="table__cell-text">${user.expirationDateConverted}</p>
    </div>
    <div class="table__cell table__cell_content_creator" data-label="Creator">
        <p class="table__cell-text">${user.creator}</p>
    </div>
    <div class="table__cell table__cell_content_banned" data-label="Banned">
        <p class="table__cell-text">${user.banned}</p>
    </div>
    <div class="table__action-block">
        <button class="table__action-btn table__action-btn_action_edit" 
        data-userId="${user.id}" data-app="${user.app}" data-token="${user.token}"
        data-description="${user.description}" data-expirationDate="${user.expirationDate}"
        onclick="openEditUser(this)"></button>
        <button class="table__action-btn table__action-btn_action_ban" onclick="openBanUser(${user.id})"></button>
        <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteUser(${user.id})"></button>
    </div>`;
}

function renderUsers(insertToBegin = false) {
    const container = document.getElementById("user-table-content");
    const end = currentIndexUsers + batchSize;
    const slice = filteredUsers.slice(currentIndexUsers, end);

    slice.forEach((user) => addUserToTable(container, user, insertToBegin));

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
            let response = await fetch('/office/loadMoreUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastId: lastLoadedUserId })
            });

            if (!response.ok) {
                sendNotification("Загрузка пользователей", "Не удалось произвести загрузку пользователей.\nResponse status: " + response.status, "error")
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
            sendNotification("Загрузка пользователей", "Не удалось произвести загрузку пользователей.\nError: " + error.toString(), "error")
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
        let response = await fetch('/office/searchUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchTerms: searchTerms })
        });

        if (!response.ok) {
            console.log('Network response was not ok')
            sendNotification("Поиск пользователей", "Не удалось произвести поиск пользователей.\nResponse status: " + response.status, "error")
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
        sendNotification("Поиск пользователей", "Не удалось произвести поиск пользователей.\nError: " + error.toString(), "error")
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

function openDeleteUser(userId) {
    document.getElementById('delete-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('delete-user-button').setAttribute('data-userId', userId);
}

async function addUser() {
    try {
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

        let response = await fetch('/office/addUser', {
            headers: headers,
            body: JSON.stringify(body),
            method: 'POST',
            priority: 'high'
        })

        if (response.ok) {
            let data = await response.json();

            if (data.success) {
                sendNotification("Добавление пользователя", "Пользователь был добавлен.", "success");

                addUserToTable(document.getElementById("user-table-content"), data.user, true);
                users.push(data.user);
                closePopup();
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

        let response = await fetch('/office/editUser', {
            headers: headers,
            body: JSON.stringify(body),
            method: 'POST',
            priority: 'high'
        })

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

async function banUser(element) {
    try {
        let response = await fetch('/office/banUser/' + element.getAttribute("data-userId"), {
            method: 'POST',
            priority: 'high'
        });

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
                closePopup();
            } else {
                sendNotification("Статус блокировки пользователя", "Не удалось изменить статус блокировки пользователя.\nError: " + data.message, "error");
            }
        } else {
            sendNotification("Статус блокировки пользователя", "Не удалось изменить статус блокировки пользователя.\nResponse status: " + response.status, "error");
        }
    } catch (error) {
        console.error('Fetch error:', error);
        sendNotification("Статус блокировки пользователя", "Не удалось изменить статус блокировки пользователя.\nError: " + error.toString(), "error");
    }
}

async function deleteUser(element) {
    try {
        let response = await fetch('/office/deleteUser/' + element.getAttribute("data-userId"), {
            method: 'POST',
            priority: 'high'
        })

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
    } catch (error) {
        console.error('Fetch error:', error);
        sendNotification("Удаление пользователя", "Не удалось удалить пользователя.\nError: " + error.toString(), "error");
    }
}