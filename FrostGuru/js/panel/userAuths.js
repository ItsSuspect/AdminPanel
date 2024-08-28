let currentIndexAuths = 0;
let lastLoadedUsersAuthsId = usersAuths.length > 0 ? usersAuths[usersAuths.length - 1].id : null;
let filteredUsersAuths = usersAuths;
let searchUsersAuth = false;

$(document).ready(function() {
    renderUserAuths();
    const containerTable = $('#authentication-table');
    const button = `<button class="table__load-more-btn" id="loadMoreBtnUsersAuths">Load More</button>`
    containerTable.append(button);

    $('#loadMoreBtnUsersAuths').click(async function() {
        await loadMoreUsersAuths();
    });

    if (usersAuths.length < batchSize){
        $('#loadMoreBtnUsersAuths').hide();
    }
});

function renderUserAuths() {
    const container = $('#usersAuthsContainer');
    const end = currentIndexAuths + batchSize;
    const slice = filteredUsersAuths.slice(currentIndexAuths, end);

    slice.forEach(userAuth => {
        const userAuthHtml = `
            <div class="table__row">
                <div class="table__cell table__cell_content_id">
                    <p class="table__cell-text">${userAuth.id}</p>
                </div>
                <div class="table__cell table__cell_content_application">
                    <p class="table__cell-text">${userAuth.application}</p>
                </div>
                <div class="table__cell table__cell_content_secret-key">
                    <p class="table__cell-text">${userAuth.secretKey}</p>
                </div>
                <div class="table__cell table__cell_content_version">
                    <p class="table__cell-text">${userAuth.version}</p>
                </div>
                <div class="table__cell table__cell_content_ip">
                    <p class="table__cell-text">${userAuth.ip}</p>
                </div>
                <div class="table__cell table__cell_content_timestamp">
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
            $('#loadMoreBtnUsersAuths').hide();
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
                $('#loadMoreBtnUsersAuths').hide();
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
        $('#usersAuthsContainer').empty();
        $('#loadMoreBtnUsersAuths').show();
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
            $('#usersAuthsContainer').empty();
            renderUserAuths();
        }

        if (data.length < batchSize){
            $('#loadMoreBtnUsersAuths').hide();
        } else $('#loadMoreBtnUsersAuths').show();
    } catch (error) {
        console.error('Fetch error:', error);
    }
}