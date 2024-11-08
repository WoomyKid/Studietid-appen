const express = require("express");
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

const sqlite3 = require("sqlite3").verbose();

const path = require("path");
const port = 3000;

const DbPath = path.join(__dirname, "./Data/StudietidDB.sqlite");

const db = new sqlite3.Database(DbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

app.use(session({
    secret: 'din hemmelige nøkkel',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 15 * 60 * 1000,
        secure: false,
        httpOnly: true
    }
  }));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const api_ = require(path.join(__dirname, "/API"));
app.use("/api", api_);

app.get('/', async (req, res) => {
    if (req.session.loggedIn && req.session.username) {
        const isAdmin = sjekkAdmin(req.session.username);
        if (isAdmin) {
            res.sendFile(path.join(__dirname, '/public/admin.html')); // Admin page
        } else {
            res.sendFile(path.join(__dirname, '/public/mainpage.html')); // Regular user page
        }
    } else {
        res.redirect('/login'); // Redirect to login if not logged in
    }
});

app.use("/", express.static(path.join(__dirname, "/public")));

// app.use("*", express.static(path.join(__dirname, "/public/404.html")));
//kan ikke ha 404 page hvis jeg bruker den fetch metoden jeg gjør nå..

function sjekkAdmin(bruker) {
    let admin = false;

    const spr = db.prepare('SELECT * FROM users WHERE mail = ?');
    const resultat = spr.get(bruker);

    if (resultat && bruker.endsWith('@vlfk')) {
        admin = true;
    }
    console.log(admin);

    return admin;
}

function hashpassword(passord, teacher_id) {
    const saltRounds = 10; // Antall runder med hashing
    const hashedPassword = bcrypt.hashSync(passord, saltRounds);

    // Lagre brukeren i databasen med det hash'ede passordet
    const stmt = db.prepare('UPDATE users SET passord = ? WHERE user_id = ?');
    stmt.run(hashedPassword, teacher_id);
}

// hashpassword('Test2', 4);

// sjekkAdmin("klaus@vlfk");
// sjekkAdmin("ola@iskule.no");

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // console.log("login request for:", username);

    const query = 'SELECT * FROM users WHERE mail = ?';
    db.get(query, [username], (err, user) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
        }

        if (!user) {
            // console.log("User not found:", username);
            return res.json({ success: false, message: 'Bruker ikke funnet.' });
        }

        let validPassword = false;

        // Check if password is hashed or plain text
        // if (user.passord.startsWith('$2b$')) {
            // Assume it's a bcrypt hash
            validPassword = bcrypt.compareSync(password, user.passord);
        // } else {
        //     // Assume it's plain text
        //     validPassword = (password === user.passord);
        // }

        if (validPassword) {
            req.session.loggedIn = true;
            req.session.username = user.mail;
            req.session.user_id = user.user_id;
            req.session.admin = sjekkAdmin(user.mail);

            // console.log("Login successful:", username);
            return res.json({ success: true, redirect: '/' });
            
        } else {
            // console.log("Invalid password for user:", username);
            return res.json({ success: false, message: 'Feil passord. Vennligst prøv igjen.' });
        }
    });
});

app.use("/login", express.static(path.join(__dirname, "/public")));
app.use("/bilder", express.static(path.join(__dirname, "bilder")));
app.use("/mainpage", express.static(path.join(__dirname, "/public/mainpage.html")));
app.use("/register", express.static(path.join(__dirname, "/public/register.html")));
app.use("/admin", express.static(path.join(__dirname, "/public/admin.html")));

app.get('/api/table-data', (req, res) => {
    const query = `
        SELECT register.users_id, register.date, register.hours, register.room, register.subject, status.register_status, 
               teachers.name || ' ' || teachers.last_name AS teacher_name
        FROM register
        INNER JOIN status ON register.status_id = status.status_id
        INNER JOIN teachers ON register.teachers_id = teachers.teacher_id
        `
    ;

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
        `
    ;

    db.get(query, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ total_hours: row.total_hours || 0 });
    });
});

app.get('/api/users-data', (req, res) => {
    const query = `
    SELECT * FROM users
    `
    ;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Check if data is being retrieved from the database
        res.json(rows);
    });
})

app.get('/api/user', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    // If the user is logged in, return the user data
    const query = 'SELECT * FROM users WHERE mail = ?';
    db.get(query, [req.session.username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user); // Return the user data
    });

});

app.listen(port, (error)=> {
    if(error) {
        console.log("The server did not start: ", error);
        return;
    }

    console.log("The server is running on http://localhost:" + port);
}) 