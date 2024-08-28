const batchSize = 100;

document.addEventListener('keydown', function(event) {
    if ((event.keyCode === 114) || (event.ctrlKey && event.keyCode === 70)) {
        event.preventDefault();

        let activeTable = localStorage.getItem('lastVisibleTableFG');
        let idSearch;
        switch (activeTable) {
            case 'main-content_table_user-table':
                idSearch = 'Users';
                break;
            case 'main-content_table_authentication-table':
                idSearch = 'UserAuths';
                break;
            case 'main-content_table_application-table':
                idSearch = 'Apps';
                break;
            case 'main-content_table_income-table':
                idSearch = 'Incomes';
                break;
            case 'main-content_table_socket-data':
                idSearch = 'Sockets';
                break;
        }
        let searchInput = document.getElementById(`searchInput${idSearch}`);
        if (searchInput) {
            searchInput.focus();
        }
    }
});

document.addEventListener('DOMContentLoaded', (event) => {
    const lastVisibleTable = localStorage.getItem('lastVisibleTableFG');
    if (lastVisibleTable) {
        showTable(lastVisibleTable);
    } else {
        openUsers();
    }
});

function showTable(className) {
    const mainContents = document.getElementsByClassName('main-content');
    for (let i = 0; i < mainContents.length; i++) {
        mainContents[i].style.display = 'none';
    }

    const tables = document.getElementsByClassName(className);
    for (let i = 0; i < tables.length; i++) {
        tables[i].style.display = 'block';
    }

    updateNavigation(className);
    localStorage.setItem('lastVisibleTableFG', className);
}

/*iQworte*/
function openSelector(element) {
    element = element.parentNode
    if (element.classList.contains('popup__select_opened')) {
        element.classList.remove('popup__select_opened');
    } else {
        element.classList.add('popup__select_opened');
    }
}

function selectCurrentValue(element) {
    const selectedValue = element.querySelector('p').textContent;
    const inputElement = element.parentNode.parentNode.querySelector('.popup__select-input .popup__select-input-value')
    inputElement.textContent = selectedValue;

    if (selectedValue === 'Завершено') {
        element.parentNode.parentNode.querySelector('.popup__select-input').classList.remove('in-work')
        element.parentNode.parentNode.querySelector('.popup__select-input').classList.add('is-done')
    } else if (selectedValue === 'В работе') {
        element.parentNode.parentNode.querySelector('.popup__select-input').classList.remove('is-done')
        element.parentNode.parentNode.querySelector('.popup__select-input').classList.add('in-work')
    } else {
        element.parentNode.parentNode.querySelector('.popup__select-input').classList.remove('in-work')
        element.parentNode.parentNode.querySelector('.popup__select-input').classList.remove('is-done')
    }

    element.parentNode.parentNode.classList.remove('popup__select_opened');
}

/*ЭТА ХУЕТА НУЖНА ЧТО БЫ НОРМАЛЬНО РАСПРЕДЕЛЯТЬ Z-INDEX НА ТАБЛИЦЕ ЗАДАЧ*/
document.querySelectorAll('.tasks-content').forEach((content)=> {
    let zIndex = 1
    let selectors = content.querySelectorAll('.task__select')
    for (let i = selectors.length-1; i !== -1; i--) {
        selectors[i].style.zIndex = zIndex++
    }
})
/*ЭТА ХУЕТА НУЖНА ЧТО БЫ НОРМАЛЬНО РАСПРЕДЕЛЯТЬ Z-INDEX НА ТАБЛИЦЕ ЗАДАЧ*/

function updateNavigation(activeClass) {
    const navButtons = document.querySelectorAll('.header__navigation-item');
    navButtons.forEach(button => {
        button.classList.remove('header__navigation-item_selected');
    });

    switch (activeClass) {
        case 'main-content_table_user-table':
            document.querySelector('.header__navigation-item[onclick="openUsers()"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_authentication-table':
            document.querySelector('.header__navigation-item[onclick="openAuths()"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_application-table':
            document.querySelector('.header__navigation-item[onclick="openApps()"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_income-table':
            document.querySelector('.header__navigation-item[onclick="openIncomes()"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_socket-data':
            document.querySelector('.header__navigation-item[onclick="openData()"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_tasks':
            document.querySelector('.header__navigation-item[onclick="openTasks()"]').classList.add('header__navigation-item_selected');
            break;
    }
}


function openUsers() {
    showTable('main-content_table_user-table');
}

function openAuths() {
    showTable('main-content_table_authentication-table');
}

function openApps() {
    showTable('main-content_table_application-table');
}

function openIncomes() {
    showTable('main-content_table_income-table');
}

function openData() {
    showTable('main-content_table_socket-data');
}

function openTasks() {
    showTable('main-content_table_tasks');
}

function closePopup() {
    document.querySelectorAll('.popup').forEach(popup => {
        popup.style.display = 'none';
    });
    document.querySelector('.overlay').style.display = 'none';
}

document.querySelector('.overlay').addEventListener('click', function(event) {
    if (event.target === this) {
        closePopup();
    }
});