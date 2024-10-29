let currentIndexSessions = 0;
let lastLoadedSessionId =
  sessions.length > 0 ? sessions[sessions.length - 1].id : null;
let filteredSessions = sessions;
let searchSessions = false;

$(document).ready(function () {
  renderSessions();
  const containerTable = $("#session-table");
  const button = `<button class="table__load-more-btn" id="loadMoreSessions">Load More</button>`;
  containerTable.append(button);

  $("#loadMoreSessions").click(async function () {
    await loadMoreSessions();
  });

  if (sessions.length < batchSize) {
    $("#loadMoreSessions").hide();
  }
});

function renderSessions() {
  const container = $("#session-table-content");
  const end = currentIndexSessions + batchSize;
  const slice = filteredSessions.slice(currentIndexSessions, end);

  slice.forEach((session) => {
    const sessionHtml = `
            <div class="table__row">
                <div class="table__cell table__cell_content_id" data-label="ID">
                    <p class="table__cell-text">${session.id}</p>
                </div>
                <div class="table__cell table__cell_content_application" data-label="Application">
                    <p class="table__cell-text">${session.app || "null"}</p>
                </div>
                <div class="table__cell table__cell_content_token" data-label="Token">
                    <p class="table__cell-text">${session.token}</p>
                </div>
                <div class="table__cell table__cell_content_hash" data-label="Hash">
                    <p class="table__cell-text">${session.hash}</p>
                </div>
                <div class="table__cell table__cell_content_ip" data-label="IP">
                    <p class="table__cell-text">${session.ip}</p>
                </div>
                <div class="table__cell table__cell_content_actions" data-label="Actions">
                    <p class="table__cell-text">${session.countActions}</p>
                    <button class="table__detail-btn" onclick="openDetailInfoActions(${
                      session.id
                    })"></button>
                </div>
                <div class="table__cell table__cell_content_bets" data-label="Bets">
                    <p class="table__cell-text">${session.countBets}</p>
                    <button class="table__detail-btn" onclick="openDetailInfoBets(${
                      session.id
                    })"></button>
                </div>
                <div class="table__cell table__cell_content_creation-date" data-label="Creation date">
                    <p class="table__cell-text">${
                      session.createDateConverted
                    }</p>
                </div>
            </div>`;
    container.append(sessionHtml);
  });

  currentIndexSessions = end;
}

async function loadMoreSessions() {
  if (lastLoadedSessionId === null) return;

  if (searchSessions) {
    const end = currentIndexSessions + batchSize;
    const slice = filteredSessions.slice(currentIndexSessions, end);
    if (slice.length > 0) {
      renderSessions();
    } else {
      $("#loadMoreSessions").hide();
    }
  } else {
    try {
      let response = await fetch("/pg_ru/loadMoreSessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lastId: lastLoadedSessionId }),
      });

      if (!response.ok) {
        console.log("Network response was not ok");
        return;
      }

      let data = await response.json();

      if (data.length > 0) {
        filteredSessions = filteredSessions.concat(data);
        lastLoadedSessionId = data[data.length - 1].id;
        renderSessions();
      }

      if (data.length < batchSize) {
        $("#loadMoreSessions").hide();
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }
}

async function searchTableSessions(event) {
  if (event) event.preventDefault();

  let input = document
    .getElementById("searchInputSessions")
    .value.toLowerCase();
  if (input === "") {
    filteredSessions = sessions;
    currentIndexSessions = 0;
    lastLoadedSessionId = 0;
    $("#session-table-content").empty();
    $("#loadMoreSessions").show();
    renderSessions();
    searchSessions = false;
    return;
  }

  let searchTerms = input.split("+").map((term) => term.trim());

  try {
    let response = await fetch("/pg_ru/searchSessions", {
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

    if (data.length > 0) {
      filteredSessions = data;
      currentIndexSessions = 0;
      searchSessions = true;
      $("#session-table-content").empty();
      renderSessions();
    }

    if (data.length < batchSize) {
      $("#loadMoreSessions").hide();
    } else $("#loadMoreSessions").show();
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function openDetailInfoActions(sessionId) {
  const session = filteredSessions.find((s) => s.id === sessionId);
  document.getElementById("action-detail-popup").style.display = "block";
  document.querySelector(".overlay").style.display = "block";

  const jsonObjects = JSON.parse(session.actions);
  const actionContainer = document.getElementById("detail-action");
  actionContainer.innerHTML = "";

  if (jsonObjects && jsonObjects.length > 0) {
    jsonObjects.forEach((obj) => {
      try {
        const sessionHtml = `
                    <div class="popup__action-block">
                        <div class="popup__action-info">
                            <p class="popup__action-title">${obj.title}</p>
                            <p class="popup__action-message">${obj.message}</p>
                        </div>
                        <p class="popup__action-date">${formatDate(
                          obj.timestamp
                        )}</p>
                    </div>
                `;
        actionContainer.innerHTML += sessionHtml;
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
      }
    });
  } else {
    actionContainer.innerHTML += `<p class="popup__no-data">Данные отсутствуют</p>`;
  }
  console.log(session);
}

function openDetailInfoBets(sessionId) {
  const session = filteredSessions.find((s) => s.id === sessionId);
  document.getElementById("session-bet-detail-popup").style.display = "block";
  document.querySelector(".overlay").style.display = "block";

  const jsonObjects = JSON.parse(session.bets);
  const actionContainer = document.getElementById("detail-bet");
  actionContainer.innerHTML = "";

  if (jsonObjects && jsonObjects.length > 0) {
    jsonObjects.forEach((obj) => {
      try {
        const couponsHtml = obj.coupons
          .map(
            (coupon) => `
                    <div class="popup__bet-coupon">
                        <p class="popup__bet-game">${coupon.game || "N/A"}</p>
                        <p class="popup__bet-market">${
                          coupon.market || "N/A"
                        }</p>
                        <p class="popup__bet-odd">Коэффициент: <span class="popup__bet-odd-amount">${
                          coupon.odd || "N/A"
                        }</span></p>
                    </div>
                `
          )
          .join("");

        const sessionHtml = `
                    <div class="popup__bet-block">
                        ${couponsHtml}
                        <div class="popup__bet-info">
                            <div class="popup__bet-detail">
                                <p class="popup__bet-date">${formatDate(
                                  obj.timestamp
                                )}</p>
                            </div>
                            <div class="popup__bet-size">
                                <p class="popup__bet-currency">${
                                  obj.currency || "N/A"
                                }</p>
                                <p class="popup__bet-amount">${
                                  obj.amount || "N/A"
                                }</p>
                            </div>
                        </div>
                    </div>
                `;
        actionContainer.innerHTML += sessionHtml;
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
      }
    });
  } else {
    actionContainer.innerHTML += `<p class="popup__no-data">Данные отсутствуют</p>`;
  }
  console.log(session);
}

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const options = {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  return new Intl.DateTimeFormat("ru-RU", options)
    .format(date)
    .replace(",", "");
}
