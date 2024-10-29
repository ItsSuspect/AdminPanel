const batchSize = 100;
const sortedApps = [...apps].sort((a, b) => b.activeKeys - a.activeKeys);

document.addEventListener("keydown", (event) => {
  if (event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)) {
    event.preventDefault();

    document.querySelectorAll(".main-content").forEach((content) => {
      if (!content.hasAttribute("style")) return;
      const input = content.querySelector(".table__search input");
      if (input) input.focus();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const lastVisibleTable = localStorage.getItem("lastVisibleTableFG");
  if (lastVisibleTable) {
    navigateChange(
      document.querySelector('[data-table="' + lastVisibleTable + '"]'),
      "." + lastVisibleTable
    );
  } else {
    localStorage.setItem("lastVisibleTableFG", "main-content_table_user-table");
    navigateChange(
      document.querySelector('[data-table="main-content_table_user-table"]'),
      ".main-content_table_user-table"
    );
  }

  document.querySelectorAll(".header__navigation button").forEach((button) => {
    button.addEventListener("click", () => {
      navigateChange(button, "." + button.getAttribute("data-table"));
      localStorage.setItem(
        "lastVisibleTableFG",
        button.getAttribute("data-table")
      );
    });
  });

  document.querySelectorAll(".popup__file-input").forEach((input) => {
    input.addEventListener("dragenter", () => {
      input.classList.add("popup__file-input_drag");
    });

    input.addEventListener("dragleave", () => {
      input.classList.remove("popup__file-input_drag");
    });

    input.addEventListener("drop", () => {
      input.classList.remove("popup__file-input_drag");
    });
  });

  document.addEventListener("click", (event) => {
    document.querySelectorAll(".popup__select").forEach((selector) => {
      if (!selector.contains(event.target)) {
        selector.classList.remove("popup__select_opened");
        selector.parentNode.style.zIndex = 1;
      }
    });

    document
      .querySelectorAll(".popup__predictive-input")
      .forEach((selector) => {
        if (!selector.contains(event.target)) {
          selector.classList.remove("popup__predictive-input_opened");
          selector.style.zIndex = 1;
        }
      });

    document.querySelectorAll(".task__select").forEach((selector) => {
      if (!selector.contains(event.target)) {
        selector.classList.remove("popup__select_opened");
        selector.parentNode.style.zIndex = 1;
      }
    });
  });

  document.querySelector(".overlay").addEventListener("click", () => {
    closePopup();
  });

  document
    .querySelectorAll(".popup__predictive-input.country__input .popup__input")
    .forEach((input) => {
      input.addEventListener("input", () =>
        openDynamicSelectorForCountry(input)
      );
      input.addEventListener("click", () =>
        openDynamicSelectorForCountry(input)
      );
    });

  document
    .querySelectorAll(".popup__predictive-input.app__input .popup__input")
    .forEach((input) => {
      input.addEventListener("input", () => openDynamicSelectorForApps(input));
      input.addEventListener("click", () => openDynamicSelectorForApps(input));
    });

  document
    .querySelectorAll(".popup__predictive-input_partner .popup__input")
    .forEach((input) => {
      input.addEventListener("input", () =>
        openDynamicSelectorForPartner(input)
      );
      input.addEventListener("click", () =>
        openDynamicSelectorForPartner(input)
      );
    });
});

function openDynamicSelectorForCountry(input) {
  const filter = input.value.toLowerCase();
  const predictionListContainer = input
    .closest(".popup__predictive-input.country__input")
    .querySelector(".popup__prediction-list");

  predictionListContainer.innerHTML = "";

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(filter)
  );
  filteredCountries.forEach((country) => {
    const listItem = document.createElement("li");
    listItem.classList.add("popup__prediction");
    listItem.onclick = function () {
      selectCurrentValueDynamic(this);
    };

    const paragraph = document.createElement("p");
    paragraph.classList.add("popup__prediction-value");
    paragraph.textContent = country;

    listItem.appendChild(paragraph);
    predictionListContainer.appendChild(listItem);
  });
}

function openDynamicSelectorForPartner(input) {
  const filter = input.value.toLowerCase();
  const predictionListContainer = input
    .closest(".popup__predictive-input_partner")
    .querySelector(".popup__prediction-list");

  predictionListContainer.innerHTML = "";

  const filteredPartners = partners.filter((partner) =>
    partner.toLowerCase().includes(filter)
  );
  filteredPartners.forEach((partner) => {
    const listItem = document.createElement("li");
    listItem.classList.add("popup__prediction");
    listItem.onclick = function () {
      selectCurrentValueDynamic(this);
    };

    const paragraph = document.createElement("p");
    paragraph.classList.add("popup__prediction-value");
    paragraph.textContent = partner;

    listItem.appendChild(paragraph);
    predictionListContainer.appendChild(listItem);
  });
}

function openDynamicSelectorForApps(input) {
  const filter = input.value.toLowerCase();
  const predictionListContainer = input
    .closest(".popup__predictive-input.app__input")
    .querySelector(".popup__prediction-list");

  predictionListContainer.innerHTML = "";

  const filteredApps = sortedApps.filter((app) =>
    app.name.toLowerCase().includes(filter)
  );
  filteredApps.forEach((app) => {
    const listItem = document.createElement("li");
    listItem.classList.add("popup__prediction");
    listItem.onclick = function () {
      selectCurrentValueDynamic(this);
    };

    const paragraph = document.createElement("p");
    paragraph.classList.add("popup__prediction-value");
    paragraph.textContent = app.name;

    listItem.appendChild(paragraph);
    predictionListContainer.appendChild(listItem);
  });
}

function navigateChange(element, className) {
  document.querySelector("#burger-checkbox").checked = false;

  document.querySelectorAll(".header__navigation button").forEach((btn) => {
    btn.classList.remove("header__navigation-item_selected");
  });

  element.classList.add("header__navigation-item_selected");

  document.querySelectorAll(".main-content").forEach((content) => {
    content.removeAttribute("style");
  });

  document.querySelector(className).style.display = "block";
}

function closePopup() {
  document.querySelectorAll(".popup").forEach((popup) => {
    popup.style.display = "none";
  });
  document.querySelector(".overlay").style.display = "none";
}

function openSelectorDynamic(element) {
  element = element.parentNode;
  if (element.classList.contains("popup__predictive-input_opened")) {
    element.classList.remove("popup__predictive-input_opened");
    element.style.zIndex = 1;
  } else {
    element.classList.add("popup__predictive-input_opened");
    element.style.zIndex = 2;
  }
}

function openSelector(element) {
  element = element.parentNode;
  if (element.classList.contains("popup__select_opened")) {
    element.classList.remove("popup__select_opened");
    element.parentNode.style.zIndex = 1;
  } else {
    element.classList.add("popup__select_opened");
    element.parentNode.style.zIndex = 2;
  }
}

function selectCurrentValueDynamic(element) {
  const selectedValue = element.querySelector("p").textContent;
  const inputElement =
    element.parentNode.parentNode.querySelector(".popup__input");
  inputElement.value = selectedValue;

  element.parentNode.parentNode.classList.remove(
    "popup__predictive-input_opened"
  );
}

function selectCurrentValue(element) {
  const selectedValue = element.querySelector("p").textContent;
  const inputElement = element.parentNode.parentNode.querySelector(
    ".popup__select-input .popup__select-input-value"
  );
  inputElement.textContent = selectedValue;

  element.parentNode.parentNode.classList.remove("popup__select_opened");
  element.parentNode.parentNode.style.zIndex = 1;

  element = element.parentNode.parentNode.querySelector(".popup__select-input");
  element.classList.remove(element.classList[1]);

  if (selectedValue === "Завершено" || selectedValue === "Готово")
    element.classList.add("is-done");
  else if (selectedValue === "В работе") element.classList.add("in-work");
  else if (selectedValue === "Выплата") element.classList.add("in-payment");
  else if (selectedValue === "Реализуемо")
    element.classList.add("is-realizable");
  else if (selectedValue === "Нереализуемо")
    element.classList.add("is-unrealizable");
  else if (selectedValue === "Ожидание") element.classList.add("in-waiting");
}

function closeSelector(element) {
  element.parentNode.parentNode.classList.remove("popup__select_opened");
  element.parentNode.parentNode.style.zIndex = 1;
}

function resetModalProperties(popupId) {
  const elements = document
    .getElementById(popupId)
    .querySelectorAll("input, textarea");
  elements.forEach((element) => {
    element.value = "";
  });

  const popupSelectValues = document
    .getElementById(popupId)
    .querySelectorAll(".popup__select-input-value");
  popupSelectValues.forEach((selectValue) => {
    const nextElement = selectValue.parentElement.nextElementSibling;

    if (
      nextElement &&
      nextElement.classList.contains("popup__select-option-list")
    ) {
      selectValue.textContent = "Выберите";
      selectValue.parentElement.classList.remove(
        selectValue.parentElement.classList[1]
      );
    }
  });
}

function resizeTextBlock(element) {
  const textarea = element.parentNode.querySelector(
    ".expandable-text-block__expanding-text"
  );
  const textareaStyle = getComputedStyle(textarea);

  if (element.classList.contains("expandable-text-block__resize-btn_expand"))
    textarea.style.height =
      textarea.scrollHeight + styleToValue(textareaStyle.paddingTop) + "px";
  else textarea.style.height = "";

  element.classList.toggle("expandable-text-block__resize-btn_expand");
  element.classList.toggle("expandable-text-block__resize-btn_collapse");
}

// function resizeTextarea(textarea) {
//     if (textarea.scrollHeight > textarea.clientHeight) {
//         const popup = textarea.parentNode.parentNode.parentNode;
//         const textareaStyle = getComputedStyle(textarea);
//
//         if (window.innerHeight > 700 && (popup.clientHeight + styleToValue(textareaStyle.lineHeight)) < 600) {
//             while (popup.clientHeight + styleToValue(textareaStyle.lineHeight) < 600 && textarea.scrollHeight > textarea.clientHeight)
//                 textarea.rows++
//         } else if (window.innerHeight <= 700 &&popup.clientHeight + styleToValue(textareaStyle.lineHeight) < window.innerHeight * 0.9) {
//             while (popup.clientHeight + styleToValue(textareaStyle.lineHeight) < window.innerHeight * 0.9 && textarea.scrollHeight > textarea.clientHeight)
//                 textarea.rows++
//         } else textarea.style.overflow = 'auto';
//     }
// }

// function styleToValue(style) {
//     return Number(style.replace(/[a-zA-Z]/g, ''));
// }

function resizeTextarea(textarea) {
  textarea.style.height = "auto";
  const newHeight = textarea.scrollHeight + "px";
  const maxHeight =
    window.innerHeight > 700 ? "600px" : window.innerHeight * 0.9 + "px";

  if (parseFloat(newHeight) <= parseFloat(maxHeight)) {
    textarea.style.height = newHeight;
    textarea.style.overflow = "hidden";
  } else {
    textarea.style.height = maxHeight;
    textarea.style.overflow = "auto";
  }
}

function styleToValue(styleValue) {
  return parseFloat(styleValue.replace("px", "")) || 0;
}

function toggleButton(toggleBtn) {
  toggleBtn.classList.toggle("popup__toggle-btn_toggled");
}

function formatDate(timestamp, includeSeconds = false) {
  if (timestamp == null) return "null";

  const date = new Date(timestamp * 1000);
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  };

  if (includeSeconds) options.second = "2-digit";

  return date.toLocaleString("ru-RU", options).replace(",", "");
}
