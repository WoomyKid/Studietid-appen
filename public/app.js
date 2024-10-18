document.querySelector('.home-btn').addEventListener('click', function() {
    window.location.href = '/home';
});

document.querySelector('.add-btn').addEventListener('click', function() {
    window.location.href = '/register';
});

const registerBtn = document.getElementById("post_");
const dateEl = document.querySelector("input[name='Date']");
const timeOneEl = document.getElementById("timeOne");
const timeTwoEl = document.getElementById("timeTwo");
const roomSelectEl = document.getElementById("rooms");
const subjectEl = document.querySelector("input[name='Fag']");
const teacherEl = document.getElementById("teacher");
const målEl = document.querySelector("textarea[name='Mål']");

const message_ = {

}

function calculateTime() {
    let totalHours = 0;
    let timeRange = "";

    if (timeOne.checked && timeTwo.checked) {
        totalHours = 2;
        timeRange = "15:00 - 17:00";
    } else if (timeOne.checked) {
        totalHours = 1;
        timeRange = "15:00 - 16:00";
    } else if (timeTwo.checked) {
        totalHours = 1;
        timeRange = "16:00 - 17:00";
    }
    return { totalHours, timeRange };
};

registerBtn.onclick = function () {
    const timeData = calculateTime();

    message_.Date = dateEl.value;
    message_.TotalHours = timeData.totalHours;
    message_.TimeRange = timeData.timeRange; 
    message_.Subject = subjectEl.value;
    message_.Teacher = teacherEl.value;
    message_.Goal = målEl.value;
    message_.Room = roomSelectEl.value;

    console.log(message_);

    fetch("/api/Register", {
        method: "POST",
        body: JSON.stringify(message_),
        headers: {
            "content-type": "application/json"
        }
    });
    window.location.href = '/home';
};

