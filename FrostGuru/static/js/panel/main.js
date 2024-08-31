const batchSize = 100;

document.addEventListener('keydown', (event)=> {
    if ((event.keyCode === 114) || (event.ctrlKey && event.keyCode === 70)) {
        event.preventDefault()

        document.querySelectorAll('.main-content').forEach((content)=> {
            if (!content.hasAttribute('style')) return
            content.querySelector('.table__search input').focus()
        })
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const lastVisibleTable = localStorage.getItem('lastVisibleTableFG')
    if (lastVisibleTable) {
        navigateChange(document.querySelector('[data-table="'+lastVisibleTable+'"]'), '.'+lastVisibleTable)
    }

    document.querySelectorAll('.header__navigation button').forEach((button)=> {
        button.addEventListener('click', ()=> {
            navigateChange(button, '.'+button.getAttribute('data-table'))
            localStorage.setItem('lastVisibleTableFG', button.getAttribute('data-table'))
        })
    })

    document.addEventListener('click', (event)=> {
        document.querySelectorAll('.popup__select').forEach((selector)=> {
            if (!selector.contains(event.target)) {
                selector.classList.remove('popup__select_opened')
            }
        })

        document.querySelectorAll('.task__select').forEach((selector)=> {
            if (!selector.contains(event.target)) {
                selector.classList.remove('popup__select_opened')
            }
        })
    })

    document.querySelector('.overlay').addEventListener('click', ()=> {
        closePopup()
    })
})

function navigateChange(element, className) {
    document.querySelector('#burger-checkbox').checked = false

    document.querySelectorAll('.header__navigation button').forEach((btn)=> {
        btn.classList.remove('header__navigation-item_selected')
    })

    element.classList.add('header__navigation-item_selected')

    document.querySelectorAll('.main-content').forEach((content)=> {
        content.removeAttribute('style')
    })

    document.querySelector(className).style.display = 'block'
}

function closePopup() {
    document.querySelectorAll('.popup').forEach(popup => {
        popup.style.display = 'none';
    });
    document.querySelector('.overlay').style.display = 'none';
}

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

function closeSelector(element) {
    element.parentNode.parentNode.classList.remove('popup__select_opened')
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