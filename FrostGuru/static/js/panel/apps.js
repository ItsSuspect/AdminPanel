let currentIndexApp = 0;
let lastLoadedAppId = apps.length > 0 ? apps[apps.length - 1].id : null;
let filteredApps = apps;
let searchApps = false;

document.addEventListener('DOMContentLoaded', ()=> {
    renderApps()
    const containerTable = document.querySelector('#application-table')
    let button = document.createElement('button')
    button.classList.add('table__load-more-btn')
    button.id = 'loadMoreAppsBtn'
    button.textContent = 'Load More'
    containerTable.append(button)

    button.addEventListener('click', loadMoreApps)

    if (apps.length < batchSize){
        button.style.display = 'none'
    }
})

function editTableRowApp(app) {
    const appRow = document.querySelector(`div.table__row[data-appId="${app.id}"]`);
    appRow.innerHTML = getTableRowContentApp(app)
}

function addAppToTable(container, app) {
    const appHtml = `
            <div class="table__row" data-appid="${app.id}">
                ${getTableRowContentApp(app)}
            </div>
        `;
    container.insertAdjacentHTML('afterbegin', appHtml);
}

function getTableRowContentApp(app) {
    return `
    <div class="table__cell table__cell_content_id" data-label="ID">
        <p class="table__cell-text">${app.id}</p>
    </div>
    <div class="table__cell table__cell_content_name" data-label="Name">
        <p class="table__cell-text">${app.name}</p>
    </div>
    <div class="table__cell table__cell_content_min-version" data-label="Min version">
        <p class="table__cell-text">1.12.123</p>
    </div>
    <div class="table__cell table__cell_content_version" data-label="Version">
        <p class="table__cell-text">${app.version}</p>
    </div>
    <div class="table__cell table__cell_content_description" data-label="Description">
        <p class="table__cell-text">${app.description}</p>
    </div>
    <div class="table__cell table__cell_content_tg-channel-id" data-label="Channel ID">
        <p class="table__cell-text">${app.channelId}</p>
    </div>
    <div class="table__cell table__cell_content_active-keys" data-label="Active keys">
      <p class="table__cell-text">${app.activeKeys}</p>
    </div>
    <div class="table__action-block">
        <button class="table__action-btn table__action-btn_action_edit"
        data-appId="${app.id}" data-name="${app.name}"
        data-version="${app.version}" data-description="${app.description}"
        data-channelId="${app.channelId}" onclick="openEditAppWindow(this)"></button>
        <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteAppWindow(${app.id})"></button>
    </div>`
}

function renderApps() {
    const container = document.querySelector('#tableContentApps');
    const end = currentIndexApp + batchSize;
    const slice = filteredApps.slice(currentIndexApp, end);

    slice.forEach((app)=> addAppToTable(container, app))

    currentIndexApp = end;
}

async function loadMoreApps() {
    if (lastLoadedAppId === null) return;

    if (searchApps) {
        const end = currentIndexApp + batchSize;
        const slice = filteredApps.slice(currentIndexApp, end);
        if (slice.length > 0) {
            renderApps()
        } else {
            document.querySelector('#loadMoreAppsBtn').style.display = 'none'
        }
    } else {
        try {
            let response = await fetch('/admin/loadMoreApps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastId: lastLoadedAppId })
            });

            if (!response.ok) {
                console.log('Network response was not ok')
                return
            }

            let data = await response.json();

            if (data.length > 0) {
                filteredApps = filteredApps.concat(data);
                lastLoadedAppId = data[data.length - 1].id;
                renderApps();
            }

            if (data.length < batchSize){
                document.querySelector('#loadMoreAppsBtn').style.display = 'none'
            }

        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

async function searchTableApps(event) {
    event.preventDefault();

    let input = document.getElementById('searchInputApps').value.toLowerCase();
    if (input === '') {
        filteredApps = apps;
        currentIndexApp = 0;
        lastLoadedAppId = 0;
        document.querySelector('#tableContentApps').textContent = ''
        document.querySelector('#loadMoreAppsBtn').style.display = 'block'
        renderApps();
        searchApps = false;
        return;
    }

    let searchTerms = input.split('+').map(term => term.trim());

    try {
        let response = await fetch('/admin/searchApplications', {
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

        document.querySelector('#tableContentApps').textContent = ''
        if (data.length > 0) {
            filteredApps = data;
            currentIndexApp = 0;
            searchApps = true;
            renderApps();
        }

        if (data.length < batchSize){
            document.querySelector('#loadMoreAppsBtn').style.display = 'none'
        } else {
            document.querySelector('#loadMoreAppsBtn').style.display = 'block'
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function openAddApplicationWindow() {
    document.getElementById('add-app-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

function openEditAppWindow(element) {
    document.getElementById('edit-app-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonEdit = document.getElementById('edit-app-button');
    buttonEdit.setAttribute("data-appId", element.getAttribute("data-appId"));
    document.getElementById('name-edit-app').value = element.getAttribute("data-name");
    document.getElementById('version-edit-app').value = element.getAttribute("data-version");
    document.getElementById('description-edit-app').value = element.getAttribute("data-description");
    document.getElementById('telegram-channel-app').value = (element.getAttribute("data-channelId") === 'null' ? '' : element.getAttribute("data-channelId"))
}

function openDeleteAppWindow(appId) {
    document.getElementById('delete-app-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonDelete = document.getElementById('delete-app-button');
    buttonDelete.setAttribute("data-appId", appId);
}

async function addApplication() {
    try {
        let body = {
            name: document.getElementById('name-app').value,
            version: document.getElementById('version-app').value,
            channelId: document.getElementById('telegram-channel-id').value,
            description: document.getElementById('description-app').value
        }

        let headers = {
            "Content-Type": "application/json"
        }

        let response = await fetch('/admin/addApplication', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {
            sendNotification('Добавление приложения', 'Приложение было добавлено.', 'success')

            addAppToTable(document.querySelector('#tableContentApps'), data.app)
            apps.push(data.app)

            closePopup()
            resetModalProperties('add-app-popup')
            } else sendNotification('Добавление приложения', 'Не удалось добавить приложение.\nError: '+data.message, 'error')
        } else {
            sendNotification('Добавление приложения', 'Не удалось добавить приложение.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Добавление приложения', 'Не удалось добавить приложение.\nError: '+e.toString(), 'error')
    }
}

async function editApp(element) {
    try {
        let body = {
            appId: element.getAttribute("data-appId"),
            name: document.getElementById('name-edit-app').value,
            version: document.getElementById('version-edit-app').value,
            description: document.getElementById('description-edit-app').value,
            channelId: document.getElementById('telegram-channel-app').value
        }

        let headers = {
            "Content-Type": "application/json"
        }

        let response = await fetch('/admin/editApplication', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {
                sendNotification('Редактирование приложения', 'Приложение было изменено.', 'success')

                apps = apps.map(app => app.id === data.app.id ? data.app : app);
                editTableRowApp(data.app)
                closePopup()
            } else sendNotification('Редактирование приложения', 'Не удалось изменить приложение.\nError: '+data.message, 'error')
        } else {
            sendNotification('Редактирование приложения', 'Не удалось изменить приложение.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Редактирование приложения', 'Не удалось изменить приложение.\nError: '+e.toString(), 'error')
    }
}

async function deleteApp(element) {
    try {
        let response = await fetch('/admin/deleteApp/'+element.getAttribute("data-appId"), {
            method: 'POST'
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {
            sendNotification('Удаление приложения', 'Приложение было успешно удалено.', 'success')

            apps = apps.filter(app => app.id !== data.appId);
            document.querySelector('.table_content_applications .table__row[data-appid="'+element.getAttribute("data-appId")+'"]').remove()
            closePopup()
            } else sendNotification('Удаление приложения', 'Не удалось удалить приложение.\nError: '+data.message, 'error')
        } else {
            sendNotification('Удаление приложения', 'Не удалось удалить приложение.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Удаление приложения', 'Не удалось удалить приложение.\nError: '+e.toString(), 'error')
    }
}