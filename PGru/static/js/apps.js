let currentIndexApp = 0;
let lastLoadedAppId = apps.length > 0 ? apps[apps.length - 1].id : null;
let filteredApps = apps;

document.addEventListener('DOMContentLoaded', ()=> {
    renderApps()
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
    <div class="table__cell table__cell_content_version" data-label="Version">
        <p class="table__cell-text">${app.version}</p>
    </div>
    <div class="table__cell table__cell_content_min-version" data-label="Min version">
        <p class="table__cell-text">${app.minVersion}</p>
    </div>
    <div class="table__cell table__cell_content_description" data-label="Description">
        <p class="table__cell-text">${app.description}</p>
    </div>
    <div class="table__cell table__cell_content_active-keys" data-label="Active keys">
      <p class="table__cell-text">${app.activeKeys}</p>
    </div>
    <div class="table__action-block">
        <button class="table__action-btn table__action-btn_action_edit"
        data-appId="${app.id}" data-name="${app.name}"
        data-version="${app.version}" data-minVersion="${app.minVersion}"
        data-description="${app.description}" onclick="openEditAppWindow(this)"></button>
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

async function searchTableApps(event) {
    event.preventDefault();

    let input = document.getElementById('searchInputApps').value.toLowerCase();
    const tableContentApps = document.getElementById('tableContentApps');

    if (input === '') {
        filteredApps = apps;
        currentIndexApp = 0;
        lastLoadedAppId = 0;
        tableContentApps.innerHTML = ''
        renderApps();
        return;
    }

    let searchTerms = input.split('+').map(term => term.trim());

    try {
        let response = await fetch('/pg_ru/searchApplications', {
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

        tableContentApps.innerHTML = ''
        if (data.length > 0) {
            filteredApps = data;
            currentIndexApp = 0;
            renderApps();
        } else {
            tableContentApps.innerHTML = '<div class="table__no-data">Данные отсутствуют</div>';
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
    document.getElementById('min-version-edit-app').value = element.getAttribute("data-minVersion");
    document.getElementById('description-edit-app').value = element.getAttribute("data-description");
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
            description: document.getElementById('description-app').value
        }

        let headers = {
            "Content-Type": "application/json"
        }

        let response = await fetch('/pg_ru/addApplication', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {

            addAppToTable(document.querySelector('#tableContentApps'), data.app)
            apps.push(data.app)

            closePopup()
            }
        } else {
            console.log(response.status)
        }
    } catch (e) {
        console.log(e)
    }
}

async function editApp(element) {
    try {
        let body = {
            appId: element.getAttribute("data-appId"),
            name: document.getElementById('name-edit-app').value,
            version: document.getElementById('version-edit-app').value,
            minVersion: document.getElementById('min-version-edit-app').value,
            description: document.getElementById('description-edit-app').value,
        }

        let headers = {
            "Content-Type": "application/json"
        }

        let response = await fetch('/pg_ru/editApplication', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {

                apps = apps.map(app => app.id === data.app.id ? data.app : app);
                editTableRowApp(data.app)
                closePopup()
            }
        }
    } catch (e) {
        console.log(e)
    }
}

async function deleteApp(element) {
    try {
        let response = await fetch('/pg_ru/deleteApp/'+element.getAttribute("data-appId"), {
            method: 'POST'
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {

                apps = apps.filter(app => app.id !== data.appId);
                document.querySelector('.table_content_applications .table__row[data-appid="' + element.getAttribute("data-appId") + '"]').remove()
                closePopup()
            }
        }
    } catch (e) {
        console.log(e)
    }
}