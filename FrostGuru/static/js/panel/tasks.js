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

function openAddTaskWindow() {
    document.getElementById('add-task-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

document.querySelectorAll('.tasks-content').forEach((content)=> {
    let zIndex = 1
    let selectors = content.querySelectorAll('.task__select')
    for (let i = selectors.length-1; i !== -1; i--) {
        selectors[i].style.zIndex = zIndex++
    }
})