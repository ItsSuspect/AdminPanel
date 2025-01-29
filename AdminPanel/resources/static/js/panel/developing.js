let developings,
    currentIndexDevelopings = 0,
    lastLoadedDevelopingId,
    filteredDevelopings,
    searchDevelopings = false,
    batchSizeDevelopings = 50;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        let response = await fetch("/admin/getFirstDevelopings", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.log("Network response was not ok");
            return;
        }

        let data = await response.json();

        if (data.length >= 0) {
            developings = data
            filteredDevelopings = data
            lastLoadedDevelopingId = data.length;
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }

    renderDeveloping()

    const containerTable = document.getElementById("development-table");
    const button = document.createElement("button");
    button.className = "table__load-more-btn";
    button.id = "loadMoreDevelopmentBtn";
    button.textContent = "Load More";
    containerTable.appendChild(button);

    button.addEventListener("click", async () => {
        await loadMoreDeveloping();
    });

    if (developings.length < batchSizeDevelopings) {
        button.style.display = "none";
    }
});

function editTableRowDeveloping(developing) {
    const developingRow = document.querySelector(
        `div.table__row[data-developingId="${developing.id}"]`
    );
    developingRow.innerHTML = getTableRowContentDeveloping(developing);
}

function addDevelopingToTable(developing, insertToBegin) {
    const container = document.getElementById("tableContentDevelopments");

    const developingHtml = `
    <div class="table__row" data-developingId="${developing.id}">
        ${getTableRowContentDeveloping(developing)}
    </div>
`;
    if (insertToBegin) container.insertAdjacentHTML("afterbegin", developingHtml);
    else container.insertAdjacentHTML("beforeend", developingHtml);
}

function getTableRowContentDeveloping(developing) {
    let el_class = "";
    if (developing.status === "Завершено" || developing.status === "Готово") el_class = "is-done";
    else if (developing.status === "В работе") el_class = "in-work";
    else if (developing.status === "Выплата") el_class = "in-payment";
    else if (developing.status === "Реализуемо") el_class = "is-realizable";
    else if (developing.status === "Нереализуемо") el_class = "is-unrealizable";
    else if (developing.status === "Ожидание") el_class = "in-waiting";

    const adminOptions = admins.map(
        admin => `
            <li class="popup__select-option" onclick="editDevelopingDeveloper(this, ${developing.id})"">
                <p class="popup__select-option-value">${admin}</p>
            </li>`
    ).join("");

    return `
    <div class="table__cell table__cell_content_id" data-label="ID">
        <p class="table__cell-text">${developing.id}</p>
    </div>
    <div class="table__cell table__cell_content_domain" data-label="Domain">
        <p class="table__cell-text table__cell-text_clickable" onclick="redirectionToCheck(this)">${developing.domain}</p>
    </div>
    <div class="table__cell table__cell_content_developer" data-label="Developer">
        <div class="popup__select">
            <div class="popup__select-input" onClick="openSelector(this)">
                <p class="popup__select-input-value popup__select-input-value_unselected" id="developer-working">${developing.developer}</p>
            </div>
            <ul class="popup__select-option-list">
                ${adminOptions}
            </ul>
        </div>
    </div>
    <div class="table__cell table__cell_content_creation-date" data-label="Creation date">
        <p class="table__cell-text">${formatDate(developing.creationDate)}</p>
    </div>
    <div class="table__cell table__cell_content_deadline" data-label="Deadline">
        <p class="table__cell-text">${formatDate(developing.deadlineDate)}</p>
    </div>
    <div class="table__cell table__cell_content_customer" data-label="Customer">
        <p class="table__cell-text"></p>
    </div>
    <div class="table__cell table__cell_content_manager" data-label="Manager">
        <p class="table__cell-text">${developing.manager}</p>
    </div>
    <div class="table__cell table__cell_content_status" data-label="Status">
        <div class="popup__select">
            <div class="popup__select-input ${el_class}" onClick="openSelector(this)">
                <p class="popup__select-input-value">${developing.status}</p>
            </div>
            <ul class="popup__select-option-list">
                <li class="popup__select-option" onclick="editCheckStatusDeveloping(this, ${developing.id})">
                    <p class="popup__select-option-value">Рассмотрение</p>
                </li>
                <li class="popup__select-option" onclick="editCheckStatusDeveloping(this, ${developing.id})">
                    <p class="popup__select-option-value">Ожидание</p>
                </li>
                <li class="popup__select-option" onclick="editCheckStatusDeveloping(this, ${developing.id})">
                    <p class="popup__select-option-value">Реализуемо</p>
                </li>
                <li class="popup__select-option" onclick="editCheckStatusDeveloping(this, ${developing.id})">
                    <p class="popup__select-option-value">Нереализуемо</p>
                </li>
                <li class="popup__select-option" onclick="editCheckStatusDeveloping(this, ${developing.id})">
                    <p class="popup__select-option-value">В работе</p>
                </li>
                <li class="popup__select-option" onclick="editCheckStatusDeveloping(this, ${developing.id})">
                    <p class="popup__select-option-value">Готово</p>
                </li>
            </ul>
        </div>
    </div>
    <div class="table__action-block">
        <button class="table__action-btn table__action-btn_action_edit"
        data-developingId="${developing.id}" data-domain="${developing.domain}"
        data-developer="${developing.developer}" data-manager="${developing.manager}"
        data-customer="${developing.customer}"
        onclick="openEditDevelopingWindow(this)"></button>
        <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteDevelopingWindow(${developing.id})"></button>
    </div>
`;
}

function renderDeveloping(insertToBegin = true) {
    const end = currentIndexDevelopings + batchSizeDevelopings;
    const slice = filteredDevelopings.slice(currentIndexDevelopings, end);

    slice.forEach((developing) => addDevelopingToTable(developing, insertToBegin));

    currentIndexDevelopings = end;
}

async function loadMoreDeveloping() {
    if (lastLoadedDevelopingId === null) return;

    if (searchDevelopings) {
        const end = currentIndexDevelopings + batchSizeDevelopings;
        const slice = filteredDevelopings.slice(currentIndexDevelopings, end);
        if (slice.length > 0) {
            renderDeveloping();
        } else {
            document.getElementById("loadMoreDevelopmentBtn").style.display = "none";
        }
    } else {
        try {
            let response = await fetch("/admin/loadMoreDevelopings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ lastId: filteredDevelopings.length }),
            });

            if (!response.ok) {
                console.log("Network response was not ok");
                return;
            }

            let data = await response.json();

            if (data.length > 0) {
                filteredDevelopings = filteredDevelopings.concat(data);
                renderDeveloping(false);
            }

            if (data.length < batchSizeDevelopings) {
                document.getElementById("loadMoreDevelopmentBtn").style.display = "none";
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }
}

async function searchTableDeveloping(event) {
    event.preventDefault();

    let input = document.getElementById("searchInputDevelopments").value.toLowerCase();
    const tableContentDevelopments = document.getElementById("tableContentDevelopments");
    const loadMoreButton = document.getElementById("loadMoreDevelopmentBtn");

    if (input === "") {
        filteredDevelopings = developings;
        currentIndexDevelopings = 0;
        lastLoadedDevelopingId = 50;
        tableContentDevelopments.innerHTML = "";

        if (developings.length < 50) loadMoreButton.style.display = "none";
        else loadMoreButton.style.display = "block";

        renderDeveloping();
        searchDevelopings = false;
        return;
    }

    let searchTerms = input.split("+").map((term) => {
        term = term.trim();
        try {
            let url = new URL(term);
            return url.hostname;
        } catch (e) {
            return term;
        }
    });

    try {
        let response = await fetch("/admin/searchDevelopings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ searchTerms: searchTerms }),
        });

        if (!response.ok) {
            console.log("Network response was not ok");
            return;
        }

        let data = await response.json();

        tableContentDevelopments.innerHTML = "";
        if (data.length > 0) {
            filteredDevelopings = data;
            currentIndexDevelopings = 0;
            searchDevelopings = true;
            renderDeveloping();
        } else {
            tableContentDevelopments.innerHTML = '<div class="table__no-data">Данные отсутствуют</div>';
        }

        if (data.length < batchSizeDevelopings) loadMoreButton.style.display = "none";
        else loadMoreButton.style.display = "block";
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function openAddDevelopingWindow() {
    document.getElementById("add-development-popup").style.display = "block";
    document.querySelector(".overlay").style.display = "block";
}

function openEditDevelopingWindow(element) {
    document.getElementById("edit-development-popup").style.display = "block";
    document.querySelector(".overlay").style.display = "block";

    console.log(element)

    document.getElementById("edit-developing-button").setAttribute("data-developingId", element.getAttribute("data-developingId"));
    document.getElementById("edit-development-domain").value = element.getAttribute("data-domain");
    document.getElementById("edit-development-duration").value = 0
    document.getElementById("edit-development-customer").value = element.getAttribute("data-customer");
    document.getElementById("edit-development-manager").textContent = element.getAttribute("data-manager");
}

function openDeleteDevelopingWindow(developingId) {
    document.getElementById("delete-development-popup").style.display = "block";
    document.querySelector(".overlay").style.display = "block";

    document.getElementById("delete-development-button").setAttribute("data-developingId", developingId);
}

async function addDeveloping() {
    try {
        let inputValue = document.getElementById("add-development-domain").value;
        let domain;

        try {
            let url = new URL(inputValue);
            domain = url.hostname;
        } catch (e) {
            domain = inputValue;
        }

        let body = {
            domain: domain,
            duration: document.getElementById("add-development-duration").value,
            customer: document.getElementById("add-development-customer").value,
            manager: document.getElementById("add-development-manager").textContent
        };

        let headers = {
            "Content-Type": "application/json",
        };

        let response = await fetch("/admin/addDeveloping", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        if (response.ok) {
            let data = await response.json();
            if (data.success) {
                sendNotification("Добавление новой разработки", "Разработка добавлена.", "success");

                developings.push(data.developing);
                addDevelopingToTable(data.developing, true);

                resetModalProperties("add-development-popup");
                closePopup();
            } else
                sendNotification("Добавление новой разработки", "Не удалось добавить новую разработку.\nError: " + data.message, "error");
        } else {
            sendNotification("Добавление новой разработки", "Не удалось добавить новую разработку.\nResponse status: " + response.status, "error");
        }
    } catch (e) {
        console.log(e);
        sendNotification("Добавление новой разработки", "Не удалось добавить новую разработку.\nError: " + e.toString(), "error");
    }
}

async function editCheckStatusDeveloping(element, developing_id) {
    try {
        let body = {
            developingId: developing_id,
            status: element.querySelector(".popup__select-option-value").textContent,
        };

        let response = await fetch("/admin/editDevelopingStatus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            let data = await response.json();
            if (data.success) {
                console.log(developing_id);
                sendNotification("Изменение статуса разработки", "Изменения сохранены.", "success");
                selectCurrentValue(element);

                developings = developings.map((developing) => developing.id === data.developing.id ? data.developing : developing);
            } else
                sendNotification("Изменение статуса разработки", "Не удалось применить изменение.\nError: " + data.message, "error");
        } else {
            sendNotification("Изменение статуса разработки", response.status, "error");
            closeSelector(element);
        }
    } catch (e) {
        console.log(e);
        sendNotification("Изменение статуса разработки", "Не удалось применить изменение.\nError: " + e.toString(), "error");
        closeSelector(element);
    }
}

async function editDevelopingDeveloper(element, developing_id) {
    try {
        let body = {
            developingId: developing_id,
            developer: element.querySelector(".popup__select-option-value").textContent,
        };

        let response = await fetch("/admin/editDevelopingDeveloper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            let data = await response.json();
            if (data.success) {
                console.log(developing_id);
                sendNotification("Изменение статуса разработки", "Изменения сохранены.", "success");
                selectCurrentValue(element);

                developings = developings.map((developing) => developing.id === data.developing.id ? data.developing : developing);
            } else
                sendNotification("Изменение статуса разработки", "Не удалось применить изменение.\nError: " + data.message, "error");
        } else {
            sendNotification("Изменение статуса разработки", response.status, "error");
            closeSelector(element);
        }
    } catch (e) {
        console.log(e);
        sendNotification("Изменение статуса разработки", "Не удалось применить изменение.\nError: " + e.toString(), "error");
        closeSelector(element);
    }
}

async function deleteDeveloping(element) {
    try {
        let response = await fetch("/admin/deleteDeveloping/" + element.getAttribute("data-developingId"), {
            method: "POST",
        }
        );

        if (response.ok) {
            let data = await response.json();
            if (data.success) {
                sendNotification("Удаление записи", "Запись была успешно удалена.", "success");

                document.querySelector('.table__content .table__row[data-developingId="' + element.getAttribute("data-developingId") + '"]').remove();

                developings = developings.filter((developing) => developing.id !== data.developingId);

                closePopup();
            } else
                sendNotification("Удаление записи", "Не удалось удалить запись.\nError: " + data.message, "error");
        } else {
            sendNotification("Удаление записи", "Не удалось удалить запись.\nResponse status: " + response.status, "error");
        }
    } catch (e) {
        console.log(e);
        sendNotification("Удаление записи", "Не удалось удалить запись.\nError: " + e.toString(), "error");
    }
}

async function editDeveloping(element) {
    try {
        let inputValue = document.getElementById("edit-development-domain").value;
        let domain;

        try {
            let url = new URL(inputValue);
            domain = url.hostname;
        } catch (e) {
            domain = inputValue;
        }

        let body = {
            developingId: element.getAttribute("data-developingId"),
            duration: document.getElementById("edit-development-duration").value,
            domain: domain,
            customer: document.getElementById("edit-development-customer").value,
            manager: document.getElementById("edit-development-manager").textContent
        };

        let headers = {
            "Content-Type": "application/json",
        };

        let response = await fetch("/admin/editDeveloping", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        if (response.ok) {
            let data = await response.json();
            if (data.success) {
                sendNotification("Редактирование записи", "Запись была изменена.", "success");

                developings = developings.map((developing) => developing.id === data.developing.id ? data.developing : developing);
                editTableRowDeveloping(data.developing);
                closePopup();
            } else
                sendNotification("Редактирование записи", "Не удалось изменить запись.\nError: " + data.message, "error");
        } else {
            sendNotification("Редактирование записи", "Не удалось изменить запись.\nResponse status: " + response.status, "error");
        }
    } catch (e) {
        console.log(e);
        sendNotification("Редактирование записи", "Не удалось изменить запись.\nError: " + e.toString(), "error");
    }
}

function redirectionToCheck(element) {
    localStorage.setItem("lastVisibleTableFG", "main-content_table_check-table");
    navigateChange(document.querySelector('[data-table="main-content_table_check-table"]'), ".main-content_table_check-table")
    document.getElementById("searchInputChecks").value = element.textContent
    searchTableChecks()
}