document.querySelector('.home-btn').addEventListener('click', function() {
    window.location.href = '/mainpage';
});

document.querySelector('.add-btn').addEventListener('click', function() {
    window.location.href = '/register';
});

document.querySelector('#settings-btn').addEventListener('click', function() {
    window.location.href = '/';
});

const registerBtn = document.getElementById("post_");
const dateEl = document.querySelector("input[name='Date']");
const timeOneEl = document.getElementById("timeOne");
const timeTwoEl = document.getElementById("timeTwo");
const roomSelectEl = document.getElementById("rooms");
const subjectEl = document.querySelector("input[name='Fag']");
const teacherEl = document.getElementById("teacher");
const målEl = document.querySelector("textarea[name='Mål']");

function calculateTime() {
    let totalHours = 0;
    let timeRange = "";

    if (timeOneEl.checked && timeTwoEl.checked) {
        totalHours = 2;
        timeRange = "15:00 - 17:00";
    } else if (timeOneEl.checked) {
        totalHours = 1;
        timeRange = "15:00 - 16:00";
    } else if (timeTwoEl.checked) {
        totalHours = 1;
        timeRange = "16:00 - 17:00";
    }
    return { totalHours, timeRange };
}

// Validate all required fields and checkboxes
function validateInputs() {
    if (!dateEl.value) {
        alert("Please select a date.");
        return false;
    }

    if (!timeOneEl.checked && !timeTwoEl.checked) {
        alert("Please select at least one time.");
        return false;
    }

    if (!roomSelectEl.value) {
        alert("Please select a room.");
        return false;
    }

    if (!subjectEl.value) {
        alert("Please enter the subject.");
        return false;
    }

    if (!teacherEl.value) {
        alert("Please select a teacher.");
        return false;
    }

    if (!målEl.value) {
        alert("Please enter a goal.");
        return false;
    }

    return true; // If all fields are filled, return true
}

registerBtn.onclick = function () {
    // Check if all inputs are valid before proceeding
    if (!validateInputs()) {
        return; // Stop function execution if validation fails
    }

    const timeData = calculateTime();

    const message_ = {
        Date: dateEl.value,
        TotalHours: timeData.totalHours,
        TimeRange: timeData.timeRange,
        Subject: subjectEl.value,
        Teacher: teacherEl.value,
        Goal: målEl.value,
        Room: roomSelectEl.value,
    };

    console.log(message_);

    // Send data to API if validation passed
    fetch("/api/Register", {
        method: "POST",
        body: JSON.stringify(message_),
        headers: {
            "content-type": "application/json",
        },
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/home';
        } else {
            alert("There was an error submitting your registration.");
        }
    })
    .catch(error => console.error('Error:', error));
};
