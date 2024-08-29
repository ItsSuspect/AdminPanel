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

function renderApps() {
    const container = document.querySelector('#tableContentApps');
    const end = currentIndexApp + batchSize;
    const slice = filteredApps.slice(currentIndexApp, end);

    slice.forEach(app => {
        const appHtml = `
            <div class="table__row">
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
                <div class="table__action-block">
                    <button class="table__action-btn table__action-btn_action_edit"
                    data-appId="${app.id}" data-name="${app.name}"
                    data-version="${app.version}" data-description="${app.description}"
                    data-channelId="${app.channelId}" onclick="openEditAppWindow(this)"></button>
                    <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteAppWindow(${app.id})"></button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', appHtml);
    });

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
    const name = document.getElementById('name-app').value;
    const version = document.getElementById('version-app').value;
    const channelId = document.getElementById('telegram-channel-id').value;
    const description = document.getElementById('description-app').value;

    let body = {
        "name": name,
        "version": version,
        "channelId": channelId,
        "description": description
    }

    let headers = {
        "Content-Type": "application/json"
    }

    let response = await fetch('/admin/addApplication', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error('Network response was not ok')
    else location.reload()
}

async function editApp(element) {
    const appId = element.getAttribute("data-appId");
    const name = document.getElementById('name-edit-app').value;
    const version = document.getElementById('version-edit-app').value;
    const description = document.getElementById('description-edit-app').value;
    const channelId = document.getElementById('telegram-channel-app').value;

    let body = {
        "appId": appId,
        "name": name,
        "version": version,
        "description": description,
        "channelId": channelId
    }

    let headers = {
        "Content-Type": "application/json"
    }

    let response = await fetch('/admin/editApplication', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error('Network response was not ok')
    else location.reload()
}

async function deleteApp(element) {
    let response = await fetch('/admin/deleteApp/' + element.getAttribute("data-appId"), {
        method: 'POST'
    })

    if (!response.ok) throw new Error('Network response was not ok')
    else location.reload()
}