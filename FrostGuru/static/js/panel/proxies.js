let filteredProxies = proxies

document.addEventListener('DOMContentLoaded', renderProxies)

function renderProxies() {
    const container = document.getElementById('tableContentProxy');

    container.innerHTML = ''
    filteredProxies.forEach((proxy)=> addProxyToTable(container, proxy));
}

function addProxyToTable(container, proxy) {
    const proxyHtml = `
        <div class="table__row">
            <div class="table__cell table__cell_content_id" data-label="ID">
                <p class="table__cell-text">${proxy.proxyId}</p>
            </div>
            <div class="table__cell table__cell_content_proxy" data-label="Proxy">
                <p class="table__cell-text">${proxy.proxyValue}</p>
            </div>
            <div class="table__cell table__cell_content_country" data-label="Country">
                <p class="table__cell-text">${proxy.country}</p>
            </div>
            <div class="table__cell table__cell_content_expiration-date" data-label="Expiration-data">
                <p class="table__cell-text">${formatDate(proxy.expirationDate)} \nДней осталось: ${getDaysRemaining(proxy.expirationDate)}</p>
            </div>
        </div>
    `

    container.insertAdjacentHTML('afterbegin', proxyHtml);
}

function getDaysRemaining(timestamp) {
    const remainingSeconds = timestamp - Math.floor(Date.now() / 1000);
    const remainingDays = remainingSeconds / (24 * 60 * 60);

    return remainingDays > 0 ? remainingDays.toFixed(2) : "0.00";
}

async function refreshProxies() {
    try {
        let response = await fetch('/admin/refreshProxies', {
            method: 'GET'
        })

        if (response.ok) {
            let data = await response.json()
            if (data.success) {
                proxies.length = 0;
                if (Array.isArray(data.proxies)) proxies.push(...data.proxies);
                filteredProxies = proxies
                renderProxies()
                sendNotification('Обновление прокси', 'Прокси успешно обновлены.', 'success')
            } else sendNotification('Обновление прокси', 'Не удалось обновить прокси.\nError: '+data.message, 'error')
        } else {
            sendNotification('Обновление прокси', 'Не удалось обновить прокси.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Обновление прокси', 'Не удалось обновить прокси.\nError: '+e.toString(), 'error')
    }
}

async function searchTableProxy(event) {
    event.preventDefault();

    let input = document.getElementById('searchInputProxy').value.toLowerCase();
    const tableContentProxy = document.getElementById('tableContentProxy');

    if (input === '') {
        filteredProxies = proxies
        tableContentProxy.innerHTML = ''
        renderProxies();
        return;
    }

    let searchTerms = input.split('+').map(term => term.trim());

    try {
        let response = await fetch('/admin/searchProxies', {
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

        tableContentProxy.innerHTML = ''
        if (data.length > 0) {
            filteredProxies = data;
            renderProxies();
        } else {
            tableContentProxy.innerHTML = '<div class="table__no-data">Данные отсутствуют</div>';
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}