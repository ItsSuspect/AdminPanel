const batchSize = 100;

document.addEventListener("keydown", function (event) {
    if (event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)) {
        event.preventDefault();

        let activeTable = localStorage.getItem("lastVisibleTablePG");
        let idSearch;
        switch (activeTable) {
            case "main-content_table_user-table":
                idSearch = "Users";
                break;
            case "main-content_table_applications-table":
                idSearch = "Applications";
                break;
            case "main-content_table_account-table":
                idSearch = "Accounts";
                break;
            case "main-content_table_session-table":
                idSearch = "Sessions";
                break;
        }
        let searchInput = document.getElementById(`searchInput${idSearch}`);
        if (searchInput) {
            searchInput.focus();
        }
    }
});

document.addEventListener("DOMContentLoaded", (event) => {
    const lastVisibleTable = localStorage.getItem("lastVisibleTablePG");
    if (lastVisibleTable) {
        showTable(lastVisibleTable);
    } else {
        openUsers();
    }

    document.querySelectorAll(".popup__file-input").forEach((input) => {
        input.addEventListener("dragenter", () => {
            input.classList.add("popup__file-input_drag");
        });

        input.addEventListener("dragleave", () => {
            input.classList.remove("popup__file-input_drag");
        });

        input.addEventListener("drop", () => {
            input.classList.remove("popup__file-input_drag");
        });
    });

    document.addEventListener("click", (event) => {
        document.querySelectorAll(".select").forEach((selector) => {
            if (!selector.contains(event.target)) {
                selector.classList.remove("select_opened");
            }
        });
    });
});

function showTable(className) {
    const mainContents = document.getElementsByClassName("main-content");
    for (let i = 0; i < mainContents.length; i++) {
        mainContents[i].style.display = "none";
    }

    const tables = document.getElementsByClassName(className);
    for (let i = 0; i < tables.length; i++) {
        tables[i].style.display = "block";
    }

    updateNavigation(className);
    localStorage.setItem("lastVisibleTablePG", className);
}

function updateNavigation(activeClass) {
    const navButtons = document.querySelectorAll(".header__navigation-item");
    navButtons.forEach((button) => {
        button.classList.remove("header__navigation-item_selected");
    });

    switch (activeClass) {
        case "main-content_table_user-table":
            document
                .querySelector(
                    '.header__navigation-item[onclick="openUsers()"]'
                )
                .classList.add("header__navigation-item_selected");
            break;
        case "main-content_table_application-table":
            document
                .querySelector(
                    '.header__navigation-item[onclick="openApplications()"]'
                )
                .classList.add("header__navigation-item_selected");
            break;
        case "main-content_table_account-table":
            document
                .querySelector(
                    '.header__navigation-item[onclick="openAccounts()"]'
                )
                .classList.add("header__navigation-item_selected");
            break;
        case "main-content_table_session-table":
            document
                .querySelector(
                    '.header__navigation-item[onclick="openSessions()"]'
                )
                .classList.add("header__navigation-item_selected");
            break;
    }
}

function openUsers() {
    showTable("main-content_table_user-table");
}

function openApplications() {
    showTable("main-content_table_application-table");
}

function openAccounts() {
    showTable("main-content_table_account-table");
}

function openSessions() {
    showTable("main-content_table_session-table");
}

function openSelector(input) {
    let selector = input.parentNode;
    selector.classList.toggle("select_opened");
}

function selectCurrentValue(option) {
    const selector = option.parentNode.parentNode;
    const selectedValue = option.querySelector(
        ".select__option-value"
    ).textContent;
    const input = selector.querySelector(".select__input");
    input.dataset.value = selectedValue;
    input.textContent = selectedValue;

    selector.classList.remove("select_opened");
}

function closePopup() {
    document.querySelectorAll(".popup").forEach((popup) => {
        popup.style.display = "none";
    });
    document.querySelector(".overlay").style.display = "none";
}

document.querySelector(".overlay").addEventListener("click", function (event) {
    if (event.target === this) {
        closePopup();
    }
});
