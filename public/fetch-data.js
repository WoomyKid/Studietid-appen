document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event triggered");

    const tableBody = document.getElementById('table-data');

    fetch('/api/table-data')
        .then(response => {
            console.log("Fetch response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data);

            tableBody.innerHTML = ''; // Clear the placeholder

            if (data.length === 0) {
                console.log("No data found in the database.");
                return;
            }

            data.forEach(row => {
                const tr = document.createElement('tr');

                const dateObj = new Date(row.date);
                const formattedDate = 
                    String(dateObj.getDate()).padStart(2, '0') + '.' +
                    String(dateObj.getMonth() + 1).padStart(2, '0') + '.' +
                    dateObj.getFullYear();

                tr.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${row.hours}</td>
                    <td>${row.room}</td>
                    <td>${row.subject}</td>
                    <td>${row.register_status}</td>
                    <td>${row.teacher_name}</td>
                `;

                console.log("Appending row:", tr.innerHTML);
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching table data:', error));

    fetch('/api/saldo')
        .then(response => response.json())
        .then(data => {
            const saldoElement = document.getElementById('hours');
            saldoElement.textContent = data.total_hours;
        })
        .catch(error => console.error('Error fetching saldo:', error));
});