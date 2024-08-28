let currentIndexUser = 0;
let lastLoadedUserId = users.length > 0 ? users[users.length - 1].id : null;
let filteredUsers = users;
let searchUsers = false;

$(document).ready(function () {
    renderUsers();
    const containerTable = $('#user-table');
    const button = `<button class="table__load-more-btn" id="loadMoreUsersBtn">Load More</button>`;
    containerTable.append(button);

    $('#loadMoreUsersBtn').click(async function () {
        await loadMoreUsers();
    });

    if (users.length < batchSize){
        $('#loadMoreUsersBtn').hide();
    }
});

function renderUsers() {
    const container = $('#tableContentUsers');
    const end = currentIndexUser + batchSize;
    const slice = filteredUsers.slice(currentIndexUser, end);

    slice.forEach(user => {
        const currentTime = Math.floor(Date.now() / 1000);
        let rowClass = "";

        if (user.banned) {
            rowClass = "table__row_banned-user";
        } else if (user.endLicense < currentTime) {
            rowClass = "table__row_expired-license";
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
                            data-userId="${user.id}" data-application="${user.application}"
                            data-secretKey="${user.secretKey}" data-description="${user.description}"
                            data-maxConnections="${user.maxConnections}"
                            data-telegramId="${user.telegramId}" data-readed="${user.readed}"
                            onclick="openEditWindow(this)"></button>
                    <button class="table__action-btn table__action-btn_action_license-renewal" onclick="openAddLicenseWindow(${user.id})"></button>
                    <button class="table__action-btn table__action-btn_action_ban" onclick="openBanUser(${user.id})"></button>
                    <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteWindow(${user.id})"></button>
                </div>
            </div>
        `;
        container.append(userHtml);
    });

    currentIndexUser = end;
}

async function loadMoreUsers() {
    if (lastLoadedUserId === null) return;

    if (searchUsers) {
        const end = currentIndexUser + batchSize;
        const slice = filteredUsers.slice(currentIndexUser, end);
        if (slice.length > 0) {
            renderUsers()
        } else {
            $('#loadMoreUsersBtn').hide();
        }
    } else {
        try {
            let response = await fetch('/admin/loadMoreUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({lastId: lastLoadedUserId})
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

            if (data.length < batchSize) {
                $('#loadMoreUsersBtn').hide();
            }

        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

function openBanUser(userId) {
    document.getElementById('ban-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('ban-user-button').setAttribute('data-userId', userId);
}

async function banUser(element) {
    try {
        let response = await fetch('/admin/banUser/' + element.getAttribute("data-userId"), {
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

function openAddWindow() {
    document.getElementById('add-user-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('secret-key-user').value = generateRandomKey();
}

function openAddTaskWindow() {
    document.getElementById('add-task-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
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

async function searchTableUsers(event) {
    event.preventDefault();

    let input = document.getElementById('searchInputUsers').value.toLowerCase();
    if (input === '') {
        filteredUsers = users;
        currentIndexUser = 0;
        lastLoadedUserId = 0;
        $('#tableContentUsers').empty();
        $('#loadMoreUsersBtn').show();
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
            console.log('Network response was not ok')
            return
        }

        let data = await response.json();

        if (data.length > 0) {
            filteredUsers = data;
            currentIndexUser = 0;
            searchUsers = true;
            $('#tableContentUsers').empty();
            renderUsers();
        }

        if (data.length < batchSize){
            $('#loadMoreUsersBtn').hide();
        } else $('#loadMoreUsersBtn').show();
    } catch (error) {
        console.error('Fetch error:', error);
    }
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

function closeSelectPeriodAddUser(event) {
    const selector = document.getElementById('selector-period-addUser');
    if (!selector.contains(event.target)) {
        selector.classList.remove('popup__select_opened');
    }
}


function openSelectPeriodAddUser(event) {
    event.stopPropagation();
    const element = document.getElementById('selector-period-addUser');
    if (element.classList.contains('popup__select_opened')) {
        element.classList.remove('popup__select_opened');
    } else {
        element.classList.add('popup__select_opened');
    }
}

function selectPeriod(liElement) {
    const selectedValue = liElement.querySelector('p').textContent;
    const inputElement = document.querySelector('#selector-period-addUser .popup__select-input-value');
    inputElement.textContent = selectedValue;

    document.getElementById('selector-period-addUser').classList.remove('popup__select_opened');
}

function closeSelectPeriodEditLicense(event) {
    const selector = document.getElementById('selector-period-editLicense');
    if (!selector.contains(event.target)) {
        selector.classList.remove('popup__select_opened');
    }
}

function openSelectPeriodEditLicense(event) {
    event.stopPropagation();
    const element = document.getElementById('selector-period-editLicense');
    if (element.classList.contains('popup__select_opened')) {
        element.classList.remove('popup__select_opened');
    } else {
        element.classList.add('popup__select_opened');
    }
}

function selectPeriodLicense(liElement) {
    const selectedValue = liElement.querySelector('p').textContent;
    const inputElement = document.querySelector('#selector-period-editLicense .popup__select-input-value');
    inputElement.textContent = selectedValue;

    document.getElementById('selector-period-editLicense').classList.remove('popup__select_opened');
}

function addUser() {
    const application = document.getElementById('application-name').value;
    const secretKey = document.getElementById('secret-key-user').value;
    const telegramId = document.getElementById('telegram-id-user').value;
    const description = document.getElementById('description-user').value;
    const maxConnections = document.getElementById('max-connections').value;

    const period = document.getElementById('period-addUser').textContent;
    const count = document.getElementById('count-period-addUser').value;

    const newUserRequest = {
        "application": application,
        "secretKey": secretKey,
        "period": period,
        "count": count,
        "telegramId": telegramId,
        "description": description,
        "maxConnections": maxConnections
    };

    fetch('/admin/addUser', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newUserRequest),
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

function editUser(element) {
    const userId = element.getAttribute("data-userId");
    const application = document.getElementById('edit-user-application').value;
    const secretKey = document.getElementById('secret-key-edit-user').value;
    const telegramId = document.getElementById('telegram-id-user-edit').value;
    const description = document.getElementById('description-edit-user').value;
    const maxConnections = document.getElementById('edit-max-connections').value;

    const editUserRequest = {
        "userId": userId,
        "application": application,
        "secretKey": secretKey,
        "telegramId": telegramId,
        "description": description,
        "maxConnections": maxConnections
    };

    fetch('/admin/editUser', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(editUserRequest)
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

function editEndLicenseUser(element) {
    const period = document.getElementById('period-editLicense').textContent;
    const count = document.getElementById('license-period').value;
    const userId = element.getAttribute("data-userId");

    const addLicenseRequest = {
        "userId": userId,
        "period": period,
        "count": count
    };

    fetch('/admin/addLicense', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(addLicenseRequest)
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

function deleteUser(element) {
    fetch('/admin/deleteUser/' + element.getAttribute("data-userId"), {
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