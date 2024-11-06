const partner = new URLSearchParams(window.location.search).get("key");

document.addEventListener("DOMContentLoaded", () => {
	document.querySelector("title").textContent = "Доходы партнера " + partner;
});

function openDetailingPartnerWindow() {
	document.getElementById("detailing-popup").style.display = "block";
	document.querySelector(".overlay").style.display = "block";
}

function closePopup() {
	document.querySelectorAll(".popup").forEach((popup) => {
		popup.style.display = "none";
	});
	document.querySelector(".overlay").style.display = "none";
}

document.querySelector(".overlay").addEventListener("click", () => {
	closePopup();
});

async function calculate() {
	const startDateInput = document.getElementById("start-date").value;
	const endDateInput = document.getElementById("end-date").value;

	const startDateTimestamp = Math.floor(
		new Date(startDateInput).getTime() / 1000
	);
	const endDateTimestamp = Math.floor(
		new Date(endDateInput).getTime() / 1000
	);

	let body = {
		startDate: startDateTimestamp,
		endDate: endDateTimestamp,
	};

	let response = await fetch("/partner/calculate?key=" + partner, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error("Network response was not ok");
	} else {
		let data = await response.json();
		document.querySelector(
			".detailing-popup__income-detail"
		).style.display = "flex";
		document.getElementById("totalIncome").textContent =
			data.sumIncome.toFixed(2) + " $";
		document.getElementById("totalAvailable").textContent =
			data.incomeAvailable.toFixed(2) + " $";
	}
}
