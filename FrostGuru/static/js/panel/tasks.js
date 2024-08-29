function openAddTaskWindow() {
    document.getElementById('add-task-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

document.querySelectorAll('.tasks-content').forEach((content)=> {
    let z_index = 1
    let selectors = content.querySelectorAll('.task__select')
    for (let i = selectors.length-1; i !== -1; i--) {
        selectors[i].style.zIndex = z_index++
    }
})