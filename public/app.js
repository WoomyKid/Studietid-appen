document.querySelector('.home-btn').addEventListener('click', function() {
    window.location.href = '/mainpage';
});

document.querySelector('.add-btn').addEventListener('click', function() {
    window.location.href = '/register';
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


const registerBtn = document.getElementById("post_");
const dateEl = document.querySelector("input[name='Date']");
const timeOneEl = document.getElementById("timeOne");
const timeTwoEl = document.getElementById("timeTwo");
const timeThreeEl = document.getElementById("timeThree");
const roomSelectEl = document.getElementById("rooms");
const subjectEl = document.querySelector("input[name='Fag']");
const teacherEl = document.getElementById("teacher");
const målEl = document.querySelector("textarea[name='Mål']");

function updateTimeSlots() {
    const selectedDate = new Date(dateEl.value);
    
    if (isNaN(selectedDate)) {
        // No date = hide all time slots
        document.getElementById('timeSlotOne').style.display = "none";
        document.getElementById('timeSlotTwo').style.display = "none";
        document.getElementById('timeSlotThree').style.display = "none";
        return;
    }

    const dayOfWeek = selectedDate.getDay();  // Sunday = 0, Monday = 1 etc..

    // Reset visibility
    document.getElementById('timeSlotOne').style.display = "none";
    document.getElementById('timeSlotTwo').style.display = "none";
    document.getElementById('timeSlotThree').style.display = "none";

    // Show times based on selected day
    if (dayOfWeek === 1) {
        document.getElementById('timeSlotThree').style.display = "block";
    } else if (dayOfWeek === 2) {
        document.getElementById('timeSlotTwo').style.display = "block";
    } else if (dayOfWeek === 3 || dayOfWeek === 4) {
        document.getElementById('timeSlotOne').style.display = "block";
        document.getElementById('timeSlotTwo').style.display = "block";
    }
}
   


// Add an event listener to the date input field to trigger the function when the user selects a date
dateEl.addEventListener('input', updateTimeSlots);

// Initial call to set time slots based on the default selected date (if any)
updateTimeSlots();

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
    } else if (timeThreeEl.checked) {
        totalHours = 1;
        timeRange = "15:45 - 16:45";
    }
    return { totalHours, timeRange };
}

// Validate all required fields and checkboxes
function validateInputs() {
    if (!dateEl.value) {
        alert("Please select a date.");
        return false;
    }

    if (!timeOneEl.checked && !timeTwoEl.checked && !timeThreeEl.checked) {
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
            window.location.href = '/mainpage';
        } else {
            alert("There was an error submitting your registration.");
        }
    })
    .catch(error => console.error('Error:', error));
};
