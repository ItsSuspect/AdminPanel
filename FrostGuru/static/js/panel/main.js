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
        showTable('main-content_table_user-table');
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

function updateNavigation(activeClass) {
    const navButtons = document.querySelectorAll('.header__navigation-item');
    navButtons.forEach(button => {
        button.classList.remove('header__navigation-item_selected');
    });

    switch (activeClass) {
        case 'main-content_table_user-table':
            document.querySelector('.header__navigation-item[onclick="showTable(\'main-content_table_user-table\')"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_authentication-table':
            document.querySelector('.header__navigation-item[onclick="showTable(\'main-content_table_authentication-table\')"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_application-table':
            document.querySelector('.header__navigation-item[onclick="showTable(\'main-content_table_application-table\')"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_income-table':
            document.querySelector('.header__navigation-item[onclick="showTable(\'main-content_table_income-table\')"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_socket-data':
            document.querySelector('.header__navigation-item[onclick="showTable(\'main-content_table_socket-data\')"]').classList.add('header__navigation-item_selected');
            break;
        case 'main-content_table_tasks':
            document.querySelector('.header__navigation-item[onclick="showTable(\'main-content_table_tasks\')"]').classList.add('header__navigation-item_selected');
            break;
    }
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