function openAddTaskWindow() {
    document.getElementById('add-task-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', renderTasks)

function openEditTaskWindow(element) {
    document.getElementById('edit-task-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonEdit = document.getElementById('edit-task-button');
    buttonEdit.setAttribute("data-taskId", element.getAttribute("data-taskId"));
    document.getElementById('edit-task-text').value = element.getAttribute("data-task-text");
}

function renderTasks() {
    const container = document.querySelector('#TasksContainer');

    tasks.forEach((task)=> {
        if (!document.querySelector('#executor-container-'+task.executor)) {
            const executorHtml = `
            <div class="tasks-container" id="executor-container-${task.executor}">
                <div class="tasks-user-name">Задачи: ${task.executor}</div>
                <div class="tasks-content"></div>
            </div>
            `
            container.insertAdjacentHTML('beforeend', executorHtml);
        }

        let el_class = ''
        if (task.status === 'Завершено') el_class = 'is-done'
        else if (task.status === 'В работе') el_class = 'in-work'
        else if (task.status === 'Выплата') el_class = 'in-payment'

        let lust_update = (task.convertedLastStatusUpdate !== '') ? ' ➔ '+task.convertedLastStatusUpdate : ''

        const taskContainer = document.querySelector('#executor-container-'+task.executor+' .tasks-content')
        const taskHtml = `
            <div class="task-element" data-taskId="${task.id}">
				<div class="task-text">${task.text}</div>
				<div class="task-actions">
					<div class="task__select">
						<div class="popup__select-input ${el_class}" onclick="openSelector(this)">
							<p class="popup__select-input-value">${task.status}</p>
						</div>
						<ul class="popup__select-option-list">
							<li class="popup__select-option" onclick="editTaskStatus(this, ${task.id})">
								<p class="popup__select-option-value">Рассмотрение</p>
							</li>
							<li class="popup__select-option" onclick="editTaskStatus(this, ${task.id})">
								<p class="popup__select-option-value">В работе</p>
							</li>
							<li class="popup__select-option" onclick="editTaskStatus(this, ${task.id})">
								<p class="popup__select-option-value">Выплата</p>
							</li>
							<li class="popup__select-option" onclick="editTaskStatus(this, ${task.id})">
								<p class="popup__select-option-value">Завершено</p>
							</li>
						</ul>
					</div>
					<div class="buttons">
						<button class="table__action-btn table__action-btn_action_edit" data-taskId="${task.id}" data-task-text="${task.text}" onclick="openEditTaskWindow(this)"></button>
						<button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteTaskWindow(${task.id})"></button>
					</div>
				</div>
				<div class="task-date">${task.convertedCreationDate}${lust_update}</div>
			</div>
        `;
        taskContainer.insertAdjacentHTML('beforeend', taskHtml);
    });

    document.querySelectorAll('.tasks-content').forEach((content)=> {
        let z_index = 1
        let selectors = content.querySelectorAll('.task__select')
        for (let i = selectors.length-1; i !== -1; i--) {
            selectors[i].style.zIndex = z_index++
        }
    })

    document.querySelectorAll('.task-element').forEach((task)=> {
        task.addEventListener('click', (event)=> {
            if (event.target.classList.contains('popup__select-input-value')) return
            if (event.target.classList.contains('table__action-btn')) return

            if (task.querySelector('.task-text').hasAttribute('style')) {
                task.querySelector('.task-text').removeAttribute('style')
            } else {
                task.querySelector('.task-text').style.display = 'block'
            }
        })
    })
}

function openDeleteTaskWindow(taskId) {
    document.getElementById('delete-task-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    const buttonDelete = document.getElementById('delete-task-button');
    buttonDelete.setAttribute("data-taskId", taskId);
}

async function editTaskStatus(element, task_id) {
    try {
        let body = {
            taskId: task_id,
            taskStatus: element.querySelector('.popup__select-option-value').textContent
        }

        let response = await fetch('/admin/editTaskStatus', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })

        if (response.ok) {
            sendNotification('Изменение статуса задачи', 'Изменения сохранены.', 'success')
            let old_date = document.querySelector('.task-element[data-taskId="'+task_id+'"] .task-date').textContent
            let creation_date = old_date.split(' ➔ ')[0]
            let new_date = formatDate(new Date().getTime()/1000).slice(0, -3)
            document.querySelector('.task-element[data-taskId="'+task_id+'"] .task-date').textContent = creation_date+' ➔ '+new_date
            selectCurrentValue(element)
        } else {
            sendNotification('Изменение статуса задачи', 'Не удалось применить изменение.\nResponse status: '+response.status, 'error')
            closeSelector(element)
        }
    } catch (e) {
        console.log(e)
        sendNotification('Изменение статуса задачи', 'Не удалось применить изменение.\nError: '+e.toString(), 'error')
        closeSelector(element)
    }
}

async function editTask(element) {
    const taskId = element.getAttribute("data-taskid");
    const taskText = document.getElementById('edit-task-text').value;

    try {
        let body = {
            taskId: taskId,
            taskText: taskText
        }

        let response = await fetch('/admin/editTask', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })

        if (response.ok) {
            sendNotification('Редактирование задачи', 'Изменения сохранены.', 'success')
            document.querySelector('.task-element[data-taskId="'+taskId+'"] .task-text').textContent = taskText
        } else {
            sendNotification('Редактирование задачи', 'Не удалось выполнить редактирование.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Редактирование задачи', 'Не удалось выполнить редактирование.\nError: '+e.toString(), 'error')
    }
}

async function deleteTask(element) {
    try {
        let response = await fetch('/admin/deleteTask/'+element.getAttribute("data-taskId"), {
            method: 'POST'
        })

        if (response.ok) {
            sendNotification('Удаление задачи', 'Задача была успешно удалена.', 'success')
            document.querySelector('.task-element[data-taskId="'+element.getAttribute("data-taskId")+'"]').remove()
        } else {
            sendNotification('Удаление задачи', 'Не удалось удалить задачу.\nResponse status: '+response.status, 'error')
        }
    } catch (e) {
        console.log(e)
        sendNotification('Удаление задачи', 'Не удалось удалить задачу.\nError: '+e.toString(), 'error')
    }
}