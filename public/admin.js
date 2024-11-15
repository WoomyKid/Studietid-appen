document.querySelector('.home-btn').addEventListener('click', function() {
    window.location.href = '/mainpage';
});

document.querySelector('#settings-btn').addEventListener('click', function() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/'; // Redirect to login page after logout
        } else {
            alert('Logout failed. Please try again.');
        }
    })
    .catch(error => console.error('Error logging out:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-data');

    fetch('/api/users-data')
        .then(response => response.json())
        .then(users => {
            const filteredUsers = users.filter(user => user.mail.endsWith('@iskule.no'));

            return fetch('/api/registered-data')
                .then(response => response.json())
                .then(registrations => ({ filteredUsers, registrations }));
        })
        .then(({ filteredUsers, registrations }) => {
            tableBody.innerHTML = ''; // Clear any existing table rows

            filteredUsers.forEach(user => {
                const userRegistration = registrations.find(reg => reg.users_id === user.user_id);

                let statusText = '<div id="nostat">ingenting nytt</div>';
                if (userRegistration && userRegistration.status_id === 2) {
                    statusText = '<div id="status">venter på godkjenning!</div>';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <span id="student-profile">
                            <img src="/bilder/${user.picture}" alt="${user.name} ${user.last_name}" id="studentprofile-img">
                        </span>
                        ${user.name} ${user.last_name}
                    </td>
                    <td>${statusText}</td>
                `;

                // Add click event to redirect to admin-godkjenn.html with the user's ID
                tr.addEventListener('click', () => {
                    window.location.href = `/godkjenn?student_id=${user.user_id}`;
                });

                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching user data:', error));
});