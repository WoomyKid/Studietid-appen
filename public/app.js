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
const teacherEl = document.getElementById("lærer");
const målEl = document.querySelector("textarea[name='Mål']")

function calculateTime() {
    let totalHours = 0;
    let timeRange = "";

    if (timeOne.checked && timeTwo.checked) {
        totalHours = 2; // Both time slots selected
        timeRange = "15:00 - 17:00";
    } else if (timeOne.checked) {
        totalHours = 1; // First time slot selected
        timeRange = "15:00 - 16:00";
    } else if (timeTwo.checked) {
        totalHours = 1; // Second time slot selected
        timeRange = "16:00 - 17:00";
    }
};