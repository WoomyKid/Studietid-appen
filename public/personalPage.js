fetch("/api/user", {
    method: 'GET',
    credentials: 'same-origin',  // This sends the cookie with the request
})
.then(response => {
    if (!response.ok) throw new Error("User not logged in");
    return response.json();
})
.then(user => {
    const profilePic = document.querySelector("#profile-img");
    profilePic.src = "/bilder/" + user.picture;

    const studentName = document.getElementById("student-name");
    studentName.textContent = `${user.name} ${user.last_name}`;
})
.catch(error => {
    console.error("Error fetching user data:", error);
    window.location.href = "/";  // Redirect to login if not authenticated
});
