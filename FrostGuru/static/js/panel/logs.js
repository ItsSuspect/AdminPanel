let currentIndexLogs = 0;
let lastLoadedLogId = logs.length > 0 ? logs[0].id : null;
let filteredLogs = logs;
let searchLogs = false;

document.addEventListener("DOMContentLoaded", () => {
  renderLogs();

  const containerTable = document.getElementById("activity-table");
  let button = document.createElement("button");
  button.classList.add("table__load-more-btn");
  button.id = "loadMoreLogsBtn";
  button.textContent = "Load More";
  containerTable.append(button);

  button.addEventListener("click", async () => {
    await loadMoreLogs();
  });

  if (logs.length < batchSize) {
    button.style.display = "none";
  }
});

function renderLogs(insertToBegin = true) {
  const container = document.getElementById("tableContentActivity");
  const end = currentIndexLogs + batchSize;
  const slice = filteredLogs.slice(currentIndexLogs, end);

  slice.forEach((log) => addLogToTable(container, log, insertToBegin));

  currentIndexLogs = end;
}

function addLogToTable(container, log, insertToBegin) {
  const logHtml = `
        <div class="table__row">
            <div class="table__cell table__cell_content_id" data-label="ID">
                <p class="table__cell-text">${log.id}</p>
            </div>
            <div class="table__cell table__cell_content_table" data-label="Table">
                <p class="table__cell-text">${log.tablePanel}</p>
            </div>
            <div class="table__cell table__cell_content_editor" data-label="Editor">
                <p class="table__cell-text">${log.editor}</p>
            </div>
            <div class="table__cell table__cell_content_date" data-label="Date">
                <p class="table__cell-text">${formatDate(log.timestamp)}</p>
            </div>
            <div class="table__cell table__cell_content_type" data-label="Type">
                <p class="table__cell-text">${log.type}</p>
            </div>
            <div class="table__action-block">
                <button class="table__action-btn table__action-btn_action_detail-info" onclick="openDetailInfoLog(${
                  log.id
                })"></button>
            </div>
        </div>
    `;

  if (insertToBegin) container.insertAdjacentHTML("afterbegin", logHtml);
  else container.insertAdjacentHTML("beforeend", logHtml);
}

async function loadMoreLogs() {
  if (lastLoadedLogId === null) return;

  if (searchLogs) {
    const end = currentIndexLogs + batchSize;
    const slice = filteredLogs.slice(currentIndexLogs, end);
    if (slice.length > 0) {
      renderLogs(false);
    } else {
      document.getElementById("loadMoreLogsBtn").style.display = "none";
    }
  } else {
    try {
      let response = await fetch("/admin/loadMoreLogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lastId: lastLoadedLogId }),
      });

      if (!response.ok) {
        console.log("Network response was not ok");
        return;
      }

      let data = await response.json();

      if (data.length > 0) {
        filteredLogs = filteredLogs.concat(data);
        lastLoadedLogId = data[data.length - 1].id;
        renderLogs(false);
      }

      if (data.length < batchSize) {
        document.getElementById("loadMoreLogsBtn").style.display = "none";
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }
}

async function searchTableLog(event) {
  event.preventDefault();

  let input = document
    .getElementById("searchInputActivity")
    .value.toLowerCase();
  const tableContentLogs = document.getElementById("tableContentActivity");
  const loadMoreButton = document.getElementById("loadMoreLogsBtn");

  if (input === "") {
    filteredLogs = logs;
    currentIndexLogs = 0;
    lastLoadedLogId = logs[0].id;
    tableContentLogs.innerHTML = "";

    loadMoreButton.style.display = "block";

    renderLogs();
    searchLogs = false;
    return;
  }

  let searchTerms = input.split("+").map((term) => term.trim());

  try {
    let response = await fetch("/admin/searchLogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchTerms: searchTerms }),
    });

    if (!response.ok) {
      console.log("Network response was not ok");
      return;
    }

    let data = await response.json();

    tableContentLogs.innerHTML = "";
    if (data.length > 0) {
      filteredLogs = data;
      currentIndexLogs = 0;
      searchLogs = true;
      renderLogs(false);
    } else {
      tableContentLogs.innerHTML =
        '<div class="table__no-data">Данные отсутствуют</div>';
    }

    if (data.length < batchSize) {
      loadMoreButton.style.display = "none";
    } else {
      loadMoreButton.style.display = "block";
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function openDetailInfoLog(logId) {
  const log = filteredLogs.find((s) => s.id === logId);
  document.getElementById("action-detail-popup-activity").style.display =
    "block";
  document.querySelector(".overlay").style.display = "block";

  let oldData = document.getElementById("old-data-activity");
  let newData = document.getElementById("new-data-activity");
  oldData.textContent = log.oldData;
  newData.textContent = log.newData;
  resizeTextarea(oldData);
  resizeTextarea(newData);
}
