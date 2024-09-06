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

// Преобразует строку стиля ('10px') в число (10)
function styleToValue(style) {
    return Number(style.replace(/[a-zA-Z]/g, ''));
}

// Изменяет высоту блока текста в зависимости от состояния кнопки изменения размера
function resizeTextBlock(element) {
    // Находим текстовую область, которая будет изменяться
    const textarea = element.parentNode.querySelector('.expandable-text-block__expanding-text');
    const textareaStyle = getComputedStyle(textarea); // Получаем стили для вычислений

    // Если кнопка в состоянии "развернуть", устанавливаем высоту по высоте содержимого
    if (element.classList.contains('expandable-text-block__resize-btn_expand')) {
        textarea.style.height = textarea.scrollHeight + styleToValue(textareaStyle.paddingTop) + 'px';
    } else { // Иначе устанавливаем высоту по количеству строк
        textarea.style.height = styleToValue(textareaStyle.lineHeight) * textarea.rows + styleToValue(textareaStyle.paddingTop) + 'px';
    }

    // Переключаем классы кнопки для изменения состояния
    element.classList.toggle('expandable-text-block__resize-btn_expand');
    element.classList.toggle('expandable-text-block__resize-btn_collapse');
}

// Обработчик кликов вне элемента, чтобы закрыть селектор
function handleOutsideClick(event, select) {
    // Если клик был вне элемента селектора, закрываем его
    if (!select.contains(event.target)) {
        closeSelector(select);
    }
}

// Функция для открытия/закрытия селектора и добавления/удаления обработчика кликов вне элемента
function changeSelectorState(input) {
    const select = input.parentNode;
    const optionList = select.querySelector('.select__option-list');
    const optionListStyle = getComputedStyle(optionList);

    // Если селектор не открыт, открываем его
    if (!select.classList.contains('select_opened')) {
        optionList.style.height = Math.ceil(optionList.scrollHeight + styleToValue(optionListStyle.borderWidth) * 2) + 'px';
        select.classList.add('select_opened');

        // Добавляем обработчик кликов вне селектора
        document.addEventListener('click', event => handleOutsideClick(event, select));
    } else {
        // Если селектор уже открыт, закрываем его
        closeSelector(select);
    }
}

// Устанавливает выбранное значение и закрывает селектор
function selectValue(option) {
    const selectedValue = option.querySelector('.select__option-value').textContent;
    const select = option.parentNode.parentNode;
    const input = select.querySelector('.select__input');

    // Устанавливаем выбранное значение
    input.setAttribute('data-value', selectedValue);
    input.textContent = selectedValue;

    // Закрываем селектор после выбора
    closeSelector(select);
}

// Аналогично `selectValue`, но устанавливает значение в input type="text"
function assignValue(option) {
    const selectedValue = option.querySelector('.select__option-value').textContent;
    const select = option.parentNode.parentNode;
    const input = select.querySelector('.select__input');

    // Устанавливаем значение в input
    input.value = selectedValue;

    // Закрываем селектор после выбора
    closeSelector(select);
}

// Закрывает селектор и удаляет обработчик кликов вне элемента
function closeSelector(select) {
    const input = select.querySelector('.select__input');
    const optionList = select.querySelector('.select__option-list');

    const inputStyle = getComputedStyle(input);

    // Устанавливаем высоту списка опций как у input, чтобы скрыть его
    optionList.style.height = styleToValue(inputStyle.height) + 'px';

    // Удаляем класс, чтобы закрыть селектор
    select.classList.remove('select_opened');

    // Удаляем обработчик кликов вне селектора
    document.removeEventListener('click', event => handleOutsideClick(event, select));
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