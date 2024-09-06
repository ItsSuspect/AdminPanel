const batchSize = 100;
const sortedApps = [...apps].sort((a, b) => b.activeKeys - a.activeKeys);

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

        document.querySelectorAll('.popup__predictive-input').forEach((selector)=> {
            if (!selector.contains(event.target)) {
                selector.classList.remove('popup__predictive-input_opened')
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

    document.querySelectorAll('.popup__predictive-input .popup__input').forEach((input)=> {
        input.addEventListener('input', () => openDynamicSelector(input));
        input.addEventListener('click', () => openDynamicSelector(input));
    })

    document.querySelectorAll('.popup__predictive-input_partner .popup__input').forEach((input)=> {
        input.addEventListener('input', () => openDynamicSelectorForPartner(input));
        input.addEventListener('click', () => openDynamicSelectorForPartner(input));
    })
})

function openDynamicSelectorForPartner(input) {
    const filter = input.value.toLowerCase();
    const predictionListContainer = input.closest('.popup__predictive-input_partner').querySelector('.popup__prediction-list');

    predictionListContainer.innerHTML = '';

    const filteredPartners = partners.filter(partner => partner.toLowerCase().includes(filter));
    filteredPartners.forEach(partner => {
        const listItem = document.createElement('li');
        listItem.classList.add('popup__prediction');
        listItem.onclick = function() { selectCurrentValueDynamic(this); };

        const paragraph = document.createElement('p');
        paragraph.classList.add('popup__prediction-value');
        paragraph.textContent = partner;

        listItem.appendChild(paragraph);
        predictionListContainer.appendChild(listItem);
    });
}

function openDynamicSelector(input) {
    const filter = input.value.toLowerCase();
    const predictionListContainer = input.closest('.popup__predictive-input').querySelector('.popup__prediction-list');

    predictionListContainer.innerHTML = '';

    const filteredApps = sortedApps.filter(app => app.name.toLowerCase().includes(filter));
    filteredApps.forEach(app => {
        const listItem = document.createElement('li');
        listItem.classList.add('popup__prediction');
        listItem.onclick = function() { selectCurrentValueDynamic(this); };

        const paragraph = document.createElement('p');
        paragraph.classList.add('popup__prediction-value');
        paragraph.textContent = app.name;

        listItem.appendChild(paragraph);
        predictionListContainer.appendChild(listItem);
    });
}

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

function openSelectorDynamic(element) {
    element = element.parentNode
    if (element.classList.contains('popup__predictive-input_opened')) {
        element.classList.remove('popup__predictive-input_opened');
    } else {
        element.classList.add('popup__predictive-input_opened');
    }
}

function openSelector(element) {
    element = element.parentNode
    if (element.classList.contains('popup__select_opened')) {
        element.classList.remove('popup__select_opened');
        element.parentNode.style.zIndex = 1
    } else {
        element.classList.add('popup__select_opened');
        element.parentNode.style.zIndex = 2
    }
}

function selectCurrentValueDynamic(element) {
    const selectedValue = element.querySelector('p').textContent;
    const inputElement = element.parentNode.parentNode.querySelector('.popup__input')
    inputElement.value = selectedValue

    element.parentNode.parentNode.classList.remove('popup__predictive-input_opened');
}

function selectCurrentValue(element) {
    const selectedValue = element.querySelector('p').textContent;
    const inputElement = element.parentNode.parentNode.querySelector('.popup__select-input .popup__select-input-value')
    inputElement.textContent = selectedValue;

    element.parentNode.parentNode.classList.remove('popup__select_opened');

    element = element.parentNode.parentNode.querySelector('.popup__select-input')
    element.classList.remove(element.classList[1])

    if (selectedValue === 'Завершено') element.classList.add('is-done')
    else if (selectedValue === 'В работе') element.classList.add('in-work')
    else if (selectedValue === 'Выплата') element.classList.add('in-payment')
}

function closeSelector(element) {
    element.parentNode.parentNode.classList.remove('popup__select_opened')
}

function resetModalProperties(popupId) {
    const elements = document.getElementById(popupId).querySelectorAll('input, textarea');
    elements.forEach(element => {
        element.value = '';
    });

    const popupSelectValues = document.getElementById(popupId).querySelectorAll('.popup__select-input-value');
    popupSelectValues.forEach(selectValue => {
        const nextElement = selectValue.parentElement.nextElementSibling;

        if (nextElement && nextElement.classList.contains('popup__select-option-list')) {
            const optionValueP = nextElement.querySelector('li .popup__select-option-value');
            if (optionValueP) {
                selectValue.textContent = optionValueP.textContent;
                if (selectValue.textContent === 'Рассмотрение') {
                    selectValue.parentElement.classList.remove(selectValue.parentElement.classList[1])
                }
            }
        }
    });
}

function formatDate(timestamp) {
    if (timestamp == null) return "null";

    const date = new Date(timestamp * 1000);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Moscow'
    };

    return date.toLocaleString('ru-RU', options).replace(',', '');
}