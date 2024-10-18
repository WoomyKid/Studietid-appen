const express = require("express");
const app = express();

const path = require("path");
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const api_ = require(path.join(__dirname, "/API"));
app.use("/api", api_);

app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/bilder", express.static(path.join(__dirname, "bilder")));
app.use("/home", express.static(path.join(__dirname, "/public/index.html")));
app.use("/register", express.static(path.join(__dirname, "/public/register.html")));
app.use("/admin", express.static(path.join(__dirname, "/public/admin.html")));
app.use("*", express.static(path.join(__dirname, "/public/404.html")));

app.listen(port, (error)=> {
    if(error) {
        console.log("The server did not start: ", error);
        return;
    }

    console.log("The server is running on http://localhost:" + port);
}) 