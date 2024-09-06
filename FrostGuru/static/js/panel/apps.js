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

function addAppToTable(container, app) {
    const appHtml = `
            <div class="table__row" data-appid="${app.id}">
                <div class="table__cell table__cell_content_id" data-label="ID">
                    <p class="table__cell-text">${app.id}</p>
                </div>
                <div class="table__cell table__cell_content_name" data-label="Name">
                    <p class="table__cell-text">${app.name}</p>
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
                <div class="action-block table__action-block">
                    <button class="action-btn action-btn_action_edit action-block__action-btn"
                    data-appId="${app.id}" data-name="${app.name}"
                    data-version="${app.version}" data-description="${app.description}"
                    data-channelId="${app.channelId}" onclick="openEditAppWindow(this)"></button>
                    <button class="action-btn action-btn_action_delete action-block__action-btn" onclick="openDeleteAppWindow(${app.id})"></button>
                </div>
            </div>
        `;
    container.insertAdjacentHTML('beforeend', appHtml);
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

        if (data.length > 0) {
            filteredApps = data;
            currentIndexApp = 0;
            searchApps = true;
            document.querySelector('#tableContentApps').textContent = ''
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
    document.getElementById('telegram-channel-app').value = element.getAttribute("data-channelId");
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
            sendNotification('Добавление приложения', 'Приложение было добавлено.', 'success')

            addAppToTable(document.querySelector('#tableContentApps'), data.app)
            closePopup()
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
            sendNotification('Редактирование приложения', 'Приложение было изменено.', 'success')

            let app_row = document.querySelector('.table_content_applications .table__row[data-appid="'+element.getAttribute("data-appId")+'"]')
            app_row.querySelector('.table__cell_content_name .table__cell-text').textContent = data.app.name
            app_row.querySelector('.table__cell_content_version .table__cell-text').textContent = data.app.version
            app_row.querySelector('.table__cell_content_description .table__cell-text').textContent = data.app.description
            app_row.querySelector('.table__cell_content_tg-channel-id .table__cell-text').textContent = data.app.channelId
            app_row.querySelector('.table__cell_content_active-keys .table__cell-text').textContent = data.app.activeKeys
            closePopup()
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
            sendNotification('Удаление приложения', 'Приложение было успешно удалено.', 'success')

            document.querySelector('.table_content_applications .table__row[data-appid="'+element.getAttribute("data-appId")+'"]').remove()
            closePopup()
        } else {
            sendNotification('Удаление приложения', 'Не удалось удалить приложение.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Удаление приложения', 'Не удалось удалить приложение.\nError: '+e.toString(), 'error')
    }
}