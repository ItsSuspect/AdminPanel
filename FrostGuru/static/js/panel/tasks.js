let tasks

document.addEventListener("DOMContentLoaded", async () => {
	try {
		let response = await fetch("/admin/getFirstTasks", {
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

		if (data.length > 0) {
			tasks = data;
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}

	renderTasks();
	addLoadMoreButtons();

	document
		.querySelectorAll(".expandable-text-block__expanding-text")
		.forEach((textarea) => {
			if (textarea.scrollHeight > textarea.clientHeight) {
				const resizeBtn = document.createElement("button");
				resizeBtn.classList.add(
					"expandable-text-block__resize-btn",
					"expandable-text-block__resize-btn_expand"
				);
				resizeBtn.addEventListener("click", resizeTextBlock(this));

				textarea.parentNode.appendChild(resizeBtn);
			}
		});

	document.querySelectorAll(".tasks-container").forEach((taskContainer) => {
		taskContainer.addEventListener("click", (event) => {
			const taskElement = event.target.closest(".task-element");
			if (!taskElement) return;

			const taskText = taskElement.querySelector(".task-text");
			if (taskText.hasAttribute("style"))
				taskText.removeAttribute("style");
			else taskText.style.display = "block";
		});
	});
});

function addLoadMoreButtons() {
	const containers = document.querySelectorAll(".tasks-container");

	containers.forEach((container) => {
		const tasksContent = container.querySelector(".tasks-content");
		const taskElements = tasksContent.querySelectorAll(".task-element");
		if (taskElements.length === 10) {
			if (!tasksContent.querySelector(".task__load-more-btn")) {
				const executor = container.id.split("-").pop();

				const loadMoreButton = document.createElement("button");
				loadMoreButton.className = "task__load-more-btn";
				loadMoreButton.textContent = "Load more";
				loadMoreButton.id = `LoadMoreButton-${executor}`;

				tasksContent.appendChild(loadMoreButton);

				loadMoreButton.addEventListener("click", async () => {
					await loadMoreTasks(executor);
				});
			}
		}
	});
}

async function loadMoreTasks(executor) {
	let lengthByExecutor = tasks.filter(
		(task) => task.executor === executor
	).length;

	try {
		let response = await fetch("/admin/loadMoreTasks", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				lastId: lengthByExecutor,
				executor: executor,
			}),
		});

		if (!response.ok) {
			console.log("Network response was not ok");
			return;
		}

		let data = await response.json();

		if (data.length > 0) {
			data.forEach((task) => {
				addTaskToTable(task, false);
				tasks.push(task);
			});

			if (data.length < 10)
				document.getElementById(
					`LoadMoreButton-${executor}`
				).style.display = "none";
		} else {
			document.getElementById(
				`LoadMoreButton-${executor}`
			).style.display = "none";
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}
}

function openAddTaskWindow() {
	document.getElementById("add-task-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";
}

function openEditTaskWindow(element) {
	document.getElementById("edit-task-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const buttonEdit = document.getElementById("edit-task-button");
	buttonEdit.setAttribute("data-taskId", element.getAttribute("data-taskId"));

	let textArea = document.getElementById("edit-task-text");
	textArea.value = element.getAttribute("data-task-text");
	resizeTextarea(textArea);
}

function renderTasks() {
	tasks.forEach((task) => addTaskToTable(task));
}

function editTableRowTask(task) {
	const taskRow = document.querySelector(
		`.task-element[data-taskId="${task.id}"]`
	);
	taskRow.innerHTML = getTableRowContentTask(task);
}

function addTaskToTable(task, insertToBegin = true) {
	const container = document.querySelector("#TasksContainer");

	if (!document.querySelector("#executor-container-" + task.executor)) {
		const executorHtml = `
        <div class="tasks-container" id="executor-container-${task.executor}">
            <div class="tasks-user-name">Задачи: ${task.executor}</div>
            <div class="tasks-content"></div>
        </div>
        `;
		container.insertAdjacentHTML("beforeend", executorHtml);
	}

	const taskContainer = document.querySelector(
		"#executor-container-" + task.executor + " .tasks-content"
	);
	const taskHtml = `
        <div class="task-element" data-taskId="${task.id}">
            ${getTableRowContentTask(task)}
        </div>
    `;

	const loadMoreButton = document.getElementById(
		`LoadMoreButton-${task.executor}`
	);

	if (loadMoreButton && !insertToBegin)
		loadMoreButton.insertAdjacentHTML("beforebegin", taskHtml);
	else if (insertToBegin)
		taskContainer.insertAdjacentHTML("afterbegin", taskHtml);
	else taskContainer.insertAdjacentHTML("beforeend", taskHtml);
	//
	// const newTaskElement = taskContainer.querySelector('.task-element');
	// newTaskElement.addEventListener('click', (event) => {
	//     if (event.target.classList.contains('popup__select-input-value')) return;
	//     if (event.target.classList.contains('table__action-btn')) return;
	//
	//     const taskText = newTaskElement.querySelector('.task-text');
	//     if (taskText.hasAttribute('style')) {
	//         taskText.removeAttribute('style');
	//     } else {
	//         taskText.style.display = 'block';
	//     }
	// });
}

function getTableRowContentTask(task) {
	let el_class = "";
	if (task.status === "Завершено") el_class = "is-done";
	else if (task.status === "В работе") el_class = "in-work";
	else if (task.status === "Выплата") el_class = "in-payment";

	let lust_update =
		task.lastStatusUpdate && task.lastStatusUpdate !== "null"
			? " ➔ " + formatDate(task.lastStatusUpdate)
			: "";

	return `
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
                <button class="table__action-btn table__action-btn_action_delete" onclick="openDeleteTaskWindow('${task.executor}', ${task.id})"></button>
            </div>
        </div>
        <div class="task-date">${formatDate(task.creationDate)}${lust_update}</div>
    `;
}

function openDeleteTaskWindow(executor, taskId) {
	document.getElementById("delete-task-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";

	const buttonDelete = document.getElementById("delete-task-button");
	buttonDelete.setAttribute("data-taskId", taskId);
	buttonDelete.setAttribute("data-taskExecutor", executor);
}

async function editTaskStatus(element, task_id) {
	try {
		let body = {
			taskId: task_id,
			taskStatus: element.querySelector(".popup__select-option-value")
				.textContent,
		};

		let response = await fetch("/admin/editTaskStatus", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Изменение статуса задачи",
					"Изменения сохранены.",
					"success"
				);
				let old_date = document.querySelector(
					'.task-element[data-taskId="' + task_id + '"] .task-date'
				).textContent;
				let creation_date = old_date.split(" ➔ ")[0];
				let new_date = formatDate(new Date().getTime() / 1000);
				document.querySelector(
					'.task-element[data-taskId="' + task_id + '"] .task-date'
				).textContent = creation_date + " ➔ " + new_date;
				selectCurrentValue(element);

				tasks = tasks.map((task) =>
					task.id === data.task.id ? data.task : task
				);
			} else
				sendNotification(
					"Изменение статуса задачи",
					"Не удалось применить изменение.\nError: " + data.message,
					"error"
				);
		} else {
			sendNotification(
				"Изменение статуса задачи",
				"Не удалось применить изменение.\nResponse status: " +
				response.status,
				"error"
			);
			closeSelector(element);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Изменение статуса задачи",
			"Не удалось применить изменение.\nError: " + e.toString(),
			"error"
		);
		closeSelector(element);
	}
}

async function editTask(element) {
	const taskId = element.getAttribute("data-taskid");
	const taskText = document.getElementById("edit-task-text").value;

	try {
		let body = {
			taskId: taskId,
			taskText: taskText,
		};

		let response = await fetch("/admin/editTask", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Редактирование задачи",
					"Изменения сохранены.",
					"success"
				);
				// document.querySelector('.task-element[data-taskId="'+taskId+'"] .task-text').textContent = data.task.text
				tasks = tasks.map((task) =>
					task.id === data.task.id ? data.task : task
				);
				editTableRowTask(data.task);
			} else
				sendNotification(
					"Редактирование задачи",
					"Не удалось выполнить редактирование.\nError: " +
					data.message,
					"error"
				);
			closePopup();
		} else {
			sendNotification(
				"Редактирование задачи",
				"Не удалось выполнить редактирование.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Редактирование задачи",
			"Не удалось выполнить редактирование.\nError: " + e.toString(),
			"error"
		);
	}
}

async function addTask() {
	try {
		let body = {
			executor: document.getElementById("executor-addTask").textContent,
			status: document.getElementById("status-addTask").textContent,
			text: document.getElementById("task-text").value,
		};

		let headers = {
			"Content-Type": "application/json",
		};

		let response = await fetch("/admin/addTask", {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body),
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Добавление новой задачи",
					"Задача была добавлена.",
					"success"
				);

				tasks.push(data.task);
				addTaskToTable(data.task);

				resetModalProperties("add-task-popup");
				closePopup();
			} else
				sendNotification(
					"Добавление новой задачи",
					"Не удалось добавить новую задачу.\nError: " + data.message,
					"error"
				);
		} else {
			sendNotification(
				"Добавление новой задачи",
				"Не удалось добавить новую задачу.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Добавление новой задачи",
			"Не удалось добавить новую задачу.\nError: " + e.toString(),
			"error"
		);
	}
}

async function deleteTask(element) {
	try {
		let taskId = element.getAttribute("data-taskId");
		let response = await fetch("/admin/deleteTask/" + taskId, {
			method: "POST",
		});

		if (response.ok) {
			let data = await response.json();
			if (data.success) {
				sendNotification(
					"Удаление задачи",
					"Задача была успешно удалена.",
					"success"
				);
				document
					.querySelector(
						'.task-element[data-taskId="' + taskId + '"]'
					)
					.remove();
				tasks = tasks.filter((task) => task.id !== taskId);

				const container = document.getElementById(
					`executor-container-${element.getAttribute(
						"data-taskExecutor"
					)}`
				);
				const taskElements = container.querySelectorAll(
					".tasks-content .task-element"
				);
				if (taskElements.length === 0) container.remove();
			} else
				sendNotification(
					"Удаление задачи",
					"Не удалось удалить задачу.\nError: " + data.message,
					"error"
				);
			closePopup();
		} else {
			sendNotification(
				"Удаление задачи",
				"Не удалось удалить задачу.\nResponse status: " +
				response.status,
				"error"
			);
		}
	} catch (e) {
		console.log(e);
		sendNotification(
			"Удаление задачи",
			"Не удалось удалить задачу.\nError: " + e.toString(),
			"error"
		);
	}
}
