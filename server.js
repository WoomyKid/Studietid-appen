const express = require("express");
const app = express();

const sqlite3 = require("sqlite3").verbose();

const path = require("path");
const port = 3000;

const DbPath = path.join(__dirname, "./Data/StudietidDB.sqlite");

const db = new sqlite3.Database(DbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const api_ = require(path.join(__dirname, "/API"));
app.use("/api", api_);

app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/login", express.static(path.join(__dirname, "/public")));
app.use("/bilder", express.static(path.join(__dirname, "bilder")));
app.use("/mainpage", express.static(path.join(__dirname, "/public/mainpage.html")));
app.use("/register", express.static(path.join(__dirname, "/public/register.html")));
app.use("/admin", express.static(path.join(__dirname, "/public/admin.html")));
// app.use("*", express.static(path.join(__dirname, "/public/404.html")));
//kan ikke ha 404 page hvis jeg bruker den fetch metoden jeg gjør nå..

app.get('/api/table-data', (req, res) => {
    const query = `
        SELECT register.date, register.hours, register.room, register.subject, status.register_status, 
               teachers.name || ' ' || teachers.last_name AS teacher_name
        FROM register
        INNER JOIN status ON register.status_id = status.status_id
        INNER JOIN teachers ON register.teachers_id = teachers.teacher_id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Check if data is being retrieved from the database
        res.json(rows);
    });
});

app.get('/api/saldo', (req, res) => {
    const query = `
        SELECT SUM(hours) AS total_hours
        FROM register
        WHERE status_id = 1
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ total_hours: row.total_hours || 0 });
    });
});


app.listen(port, (error)=> {
    if(error) {
        console.log("The server did not start: ", error);
        return;
    }

    console.log("The server is running on http://localhost:" + port);
}) 