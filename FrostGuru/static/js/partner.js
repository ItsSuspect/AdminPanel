function openDetailingPartnerWindow() {
    document.getElementById('detailing-popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

function closePopup() {
    document.querySelectorAll('.popup').forEach(popup => {
        popup.style.display = 'none';
    });
    document.querySelector('.overlay').style.display = 'none';
}

document.querySelector('.overlay').addEventListener('click', function(event) {
    if (event.target === this) {
        closePopup();
    }
});

function calculate() {
    const startDateInput = document.getElementById('start-date').value;
    const endDateInput = document.getElementById('end-date').value;

    const startDateTimestamp = Math.floor(new Date(startDateInput).getTime() / 1000);
    const endDateTimestamp = Math.floor(new Date(endDateInput).getTime() / 1000);

    const CalculateRequest = {
        startDate: startDateTimestamp,
        endDate: endDateTimestamp
    };

    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');

    fetch('/partner/calculate?key=' + key, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(CalculateRequest)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.querySelector('.detailing-popup__income-detail').style.display = 'flex';
            document.getElementById('totalIncome').textContent = data.sumIncome.toFixed(2) + ' $';
            document.getElementById('totalAvailable').textContent = data.incomeAvailable.toFixed(2) + ' $';
        })
        .catch(error => {
            console.error('Error:', error);
        });
}