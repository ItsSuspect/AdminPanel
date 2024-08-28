let currentIndexSocket = 0;
let lastLoadedSocketId = sockets.length > 0 ? sockets[sockets.length - 1].id : null;
let filteredSockets = sockets;
let searchSockets = false;

$(document).ready(function () {
    renderSockets();
    const containerTable = $('#socket-data-table');
    const button = `<button class="table__load-more-btn" id="loadMoreSocketBtn">Load More</button>`;
    containerTable.append(button);

    $('#loadMoreSocketBtn').click(async function () {
        await loadMoreSockets();
    });

    if (sockets.length < batchSize){
        $('#loadMoreSocketBtn').hide();
    }
});

function renderSockets() {
    const container = $('#SocketContainer');
    const end = currentIndexSocket + batchSize;
    const slice = filteredSockets.slice(currentIndexSocket, end);

    slice.forEach(socket => {
        const socketsHtml = `
        <div class="table__row">
            <div class="table__cell table__cell_content_id">
                <p class="table__cell-text">${socket.id}</p>
            </div>
            <div class="table__cell table__cell_content_application">
                <p class="table__cell-text">${socket.application}</p>
            </div>
            <div class="table__cell table__cell_content_secret-key">
                <p class="table__cell-text">${socket.secretKey}</p>
            </div>
            <div class="table__cell table__cell_content_hash">
                <p class="table__cell-text">${socket.hash}</p>
            </div>
            <div class="table__cell table__cell_content_betten">
                <p class="table__cell-text">${socket.betten}</p>
            </div>
            <div class="table__cell table__cell_content_date">
                <p class="table__cell-text">${socket.convertedTimestamp}</p>
            </div>
            <div class="table__action-block">
                <button class="table__action-btn table__action-btn_action_detail-info" onclick="openDetailInfo(${socket.id})"></button>
            </div>
        </div>`;
        container.append(socketsHtml);
    });

    currentIndexSocket = end;
}

async function loadMoreSockets() {
    if (lastLoadedSocketId === null) return;

    if (searchSockets) {
        const end = currentIndexSocket + batchSize;
        const slice = filteredSockets.slice(currentIndexSocket, end);
        if (slice.length > 0) {
            renderSockets()
        } else {
            $('#loadMoreSocketBtn').hide();
        }
    } else {
        try {
            let response = await fetch('/admin/loadMoreSockets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastId: lastLoadedSocketId })
            });

            if (!response.ok) {
                console.log('Network response was not ok')
                return
            }

            let data = await response.json();

            if (data.length > 0) {
                filteredSockets = filteredSockets.concat(data);
                lastLoadedSocketId = data[data.length - 1].id;
                renderSockets();
            }

            if (data.length < batchSize){
                $('#loadMoreSocketBtn').hide();
            }

        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

async function searchTableSockets(event) {
    event.preventDefault();

    let input = document.getElementById('searchInputSockets').value.toLowerCase();
    if (input === '') {
        filteredSockets = sockets;
        currentIndexSocket = 0;
        lastLoadedSocketId = 0;
        $('#SocketContainer').empty();
        $('#loadMoreSocketBtn').show();
        renderSockets();
        searchSockets = false;
        return;
    }

    let searchTerms = input.split('+').map(term => term.trim());

    try {
        let response = await fetch('/admin/searchSockets', {
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
            filteredSockets = data;
            currentIndexSocket = 0;
            searchSockets = true;
            $('#SocketContainer').empty();
            renderSockets();
        }

        if (data.length < batchSize){
            $('#loadMoreSocketBtn').hide();
        } else $('#loadMoreSocketBtn').show();
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function openDetailInfo(socketId) {
    const socket = filteredSockets.find(s => s.id === socketId);
    document.getElementById('detail-info').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    document.getElementById('hash').textContent = 'Детализация: ' + socket.hash;
    document.getElementById('date').textContent = formatDate(socket.timestamp);

    const jsonObjects = JSON.parse(socket.actions);
    const actionContainer = document.querySelector('.detail-info-popup__action-container');
    actionContainer.innerHTML = '';

    if (jsonObjects) {
        jsonObjects.reverse();
        jsonObjects.forEach(obj => {
            try {
                if (obj.action !== 'coupon') {
                    const actionElement = document.createElement('div');
                    actionElement.classList.add('detail-info-popup__action');

                    let actionInfoHtml = `
                        <div class="detail-info-popup__action-info">
                            <p class="detail-info-popup__action-name">${obj.action}</p>
                    `;

                    if (obj.action === 'bet_error') {
                        actionInfoHtml += `<p class="detail-info-popup__subaction">${obj.errors}</p>`;
                    } else if (obj.action === 'bet_success') {
                        actionInfoHtml += `<p class="detail-info-popup__subaction">Задержка до приема: ${obj.bet_time_out} секунд</p>`;
                    }

                    actionInfoHtml += `</div>`;

                    const actionDateHtml = `
                        <p class="detail-info-popup__action-date">${formatDate(obj.timestamp)}</p>
                    `;

                    actionElement.innerHTML = actionInfoHtml + actionDateHtml;
                    actionContainer.appendChild(actionElement);
                } else if (obj.action === 'coupon') {
                    const coupons = obj.coupons;
                    const container = document.querySelector('.detail-info-popup__coupon-list');
                    container.innerHTML = '';

                    coupons.forEach(coupon => {
                        const couponHtml = `
                            <div class="detail-info-popup__coupon">
                                <p class="detail-info-popup__team detail-info-popup__team_blue">${coupon.team1}</p>
                                <p class="detail-info-popup__team-separator">VS</p>
                                <p class="detail-info-popup__team detail-info-popup__team_red">${coupon.team2}</p>
                                <hr class="detail-info-popup__coupon-separator">
                                <p class="detail-info-popup__name">${coupon.name}</p>
                                <p class="detail-info-popup__coefficient">Коэффициент: <span class="detail-info-popup__coefficient-value">${coupon.odd}</span></p>
                            </div>`;

                        container.innerHTML += couponHtml;
                    });
                    document.getElementById('amount').textContent = obj.amount;
                    document.getElementById('host').textContent = obj.host;
                }
            } catch (error) {
                console.error('Ошибка при парсинге JSON:', error);
            }
        })
    } else {
        const container = document.querySelector('.detail-info-popup__coupon-list');
        container.innerHTML = '';

        document.getElementById('amount').textContent = '...';
        document.getElementById('host').textContent = '...';
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };

    return new Intl.DateTimeFormat('ru-RU', options).format(date).replace(',', '');
}