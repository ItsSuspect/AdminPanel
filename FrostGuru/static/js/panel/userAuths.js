let currentIndexAuths = 0;
let lastLoadedUsersAuthsId = usersAuths.length > 0 ? usersAuths[usersAuths.length - 1].id : null;
let filteredUsersAuths = usersAuths;
let searchUsersAuth = false;

document.addEventListener('DOMContentLoaded', ()=> {
    renderUserAuths()
    const containerTable = document.querySelector('#authentication-table')
    let button = document.createElement('button')
    button.classList.add('table__load-more-btn')
    button.id = 'loadMoreBtnUsersAuths'
    button.textContent = 'Load More'
    containerTable.append(button)

    button.addEventListener('click', loadMoreUsersAuths)

    if (usersAuths.length < batchSize){
        button.style.display = 'none'
    }
})

function renderUserAuths() {
    const container = document.querySelector('#usersAuthsContainer');
    const end = currentIndexAuths + batchSize;
    const slice = filteredUsersAuths.slice(currentIndexAuths, end);

    slice.forEach(userAuth => {
        const userAuthHtml = `
            <div class="table__row">
                <div class="table__cell table__cell_content_id" data-label="ID">
                    <p class="table__cell-text">${userAuth.id}</p>
                </div>
                <div class="table__cell table__cell_content_application" data-label="Application">
                    <p class="table__cell-text">${userAuth.application}</p>
                </div>
                <div class="table__cell table__cell_content_secret-key" data-label="Secret key">
                    <p class="table__cell-text">${userAuth.secretKey}</p>
                </div>
                <div class="table__cell table__cell_content_version" data-label="Version">
                    <p class="table__cell-text">${userAuth.version}</p>
                </div>
                <div class="table__cell table__cell_content_ip" data-label="IP">
                    <p class="table__cell-text">${userAuth.ip}</p>
                </div>
                <div class="table__cell table__cell_content_timestamp" data-label="Timestamp">
                    <p class="table__cell-text">${userAuth.convertedTimestamp}</p>
                </div>
            </div>
        `;
        container.append(userAuthHtml);
    });

    currentIndexAuths = end;
}

async function loadMoreUsersAuths() {
    if (lastLoadedUsersAuthsId === null) return;

    if (searchUsersAuth) {
        const end = currentIndexAuths + batchSize;
        const slice = filteredUsersAuths.slice(currentIndexAuths, end);
        if (slice.length > 0) {
            renderUserAuths()
        } else {
            document.querySelector('#loadMoreBtnUsersAuths').style.display = 'none'
        }
    } else {
        try {
            let response = await fetch('/admin/loadMoreUsersAuths', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastId: lastLoadedUsersAuthsId })
            });

            if (!response.ok) {
                console.log('Network response was not ok')
                return
            }

            let data = await response.json();

            if (data.length > 0) {
                filteredUsersAuths = filteredUsersAuths.concat(data);
                lastLoadedUsersAuthsId = data[data.length - 1].id;
                renderUserAuths();
            }

            if (data.length < batchSize){
                document.querySelector('#loadMoreBtnUsersAuths').style.display = 'none'
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

async function searchTableUserAuths(event) {
    event.preventDefault();

    let input = document.getElementById('searchInputUserAuths').value.toLowerCase();
    if (input === '') {
        filteredUsersAuths = usersAuths;
        currentIndexAuths = 0;
        lastLoadedUsersAuthsId = 0;
        document.querySelector('#usersAuthsContainer').textContent = ''
        document.querySelector('#loadMoreBtnUsersAuths').style.display = 'block'
        renderUserAuths();
        searchUsersAuth = true
        return;
    }

    let searchTerms = input.split('+').map(term => term.trim());

    try {
        let response = await fetch('/admin/searchUsersAuth', {
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
            filteredUsersAuths = data;
            currentIndexAuths = 0;
            searchUsersAuth = true;
            document.querySelector('#usersAuthsContainer').textContent = ''
            renderUserAuths();
        }

        if (data.length < batchSize){
            document.querySelector('#loadMoreBtnUsersAuths').style.display = 'none'
        } else {
            document.querySelector('#loadMoreBtnUsersAuths').style.display = 'block'
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}