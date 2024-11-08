document.addEventListener('DOMContentLoaded', () => {
    // console.log("DOMContentLoaded triggered in login.js");

    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const brukernavn = document.querySelector("input[name='Brukernavn']").value;
        const passord = document.querySelector("input[name='Passord']").value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: brukernavn, password: passord })
            });

            const result = await response.json();
            // console.log("Login response received:", result);

            if (result.success) {
                // console.log("Redirecting to:", result.redirect);
                window.location.href = result.redirect;
            } else {
                document.querySelector("input[name='Passord']").value = "";
                showMessage(result.message || 'Unexpected error. Please try again.');
            }
        } catch (error) {
            // console.error('Login failed:', error);
            showMessage('Noe gikk galt. Vennligst prøv igjen senere.');
        }
    });

    function showMessage(message) {
        const feilmelding = document.getElementById('error-message');
        feilmelding.textContent = message;
    } 
});
