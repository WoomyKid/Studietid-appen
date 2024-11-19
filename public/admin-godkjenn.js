document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user_id');

    fetch(`/api/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                // throw new Error(`Failed to fetch user data: ${response.status}`);
                window.location.href = "/admin";
            }
            return response.json();
        })
        .then(data => {
            // console.log("Fetched user data:", data);

            const registerContainer = document.getElementById('Register-container');
            registerContainer.innerHTML = ''; // Clear existing content before appending new data

            data.forEach(register => {
                const registerDiv = document.createElement('div');
                registerDiv.className = 'Register-form';

                // Create user name header
                const studentName = document.createElement('h1');
                studentName.id = 'elev-navn';
                studentName.textContent = register.user_name;

                // Create the registration wrapper
                const registerWrapper = document.createElement('section');
                registerWrapper.className = 'register-wrapper';
                registerWrapper.innerHTML = `
                    <div class="categories">Dato: <p>${register.date}</p></div>
                    <div class="categories">Tid: <p>${register.timerange}</p></div>
                    <div class="categories">Timer: <p>${register.hours}</p></div>
                    <div class="categories">Rom: <p>${register.room}</p></div>
                    <div class="categories">Fag: <p>${register.subject}</p></div>
                    <div class="categories">Lærer: <p>${register.teacher_name}</p></div>
                    <div class="categories">Mål:</div>
                    <textarea name="Mål" rows="5" class="input-box" readonly>${register.goal}</textarea>
                    <br><br>
                    <span id="validation-btns">
                    <button id="godkjenn" onclick="onClickApprove(${register.register_id})">Godkjenn</button>
                    <button id="avvis" onclick="onClickReject(${register.register_id})">Avvis</button>
                    </span>
                `;

                // Append the name and register info to the div
                registerDiv.appendChild(studentName);
                registerDiv.appendChild(registerWrapper);
                registerContainer.appendChild(registerDiv);
            });

            document.querySelectorAll('#avvis').forEach(button => {
                button.addEventListener('click', () => {
                    const registerId = button.getAttribute('data-register-id');
                    updateStatus(3, registerId); // Pass status_id = 3 for rejection
                });
            });

            document.querySelectorAll('#godkjenn').forEach(button => {
                button.addEventListener('click', () => {
                    const registerId = button.getAttribute('data-register-id');
                    updateStatus(1, registerId); // Pass status_id = 1 for validation
                });
            });

        })
        .catch(error => {
            console.error("Error fetching user data:", error);
        });
});

function updateStatus(statusId, registerId) {
    if (!registerId) {
        console.error("Invalid register_id:", registerId);
        return;
    }

    fetch("/api/update-status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ register_id: registerId, status_id: statusId }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to update status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Status update successful:", data);
                location.reload();
        })
        .catch((error) => {
            console.error("Error updating status:", error);
        });
}