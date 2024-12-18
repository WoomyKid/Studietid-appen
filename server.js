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

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
}

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.session.admin) {
        return next();
    } else {
        res.status(403).send("Access denied: Admins only."); // Forbidden for non-admin users
    }
}

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

app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/admin.html')); // Only accessible if logged in and is admin
});

app.get('/', (req, res) => {
    // Redirect to /login if not logged in, otherwise choose appropriate page
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }

    // Check session for admin status and redirect accordingly
    if (req.session.admin) {
        return res.redirect('/admin');
    } else {
        return res.redirect('/mainpage');
    }
});

app.get('/mainpage', isAuthenticated, (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin'); // Redirect admin to admin page
    }
    res.sendFile(path.join(__dirname, '/public/mainpage.html'));
});

app.post("/api/update-status", (req, res) => {
    const { register_id, status_id } = req.body;

    if (!register_id || !status_id) {
        return res.status(400).send({ Message: "Missing required fields." });
    }
    // console.log("Updating register:", register_id, "to status:", status_id);

    // Update the database
    const sql = "UPDATE register SET status_id = ? WHERE register_id = ?";
    db.run(sql, [status_id, register_id], function (err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send({ Message: "Failed to update the status." });
        }

        if (this.changes > 0) {
            res.status(200).send({ Message: "Status updated successfully." });
        } else {
            res.status(404).send({ Message: "Register not found." });
        }
    });
});


// app.use("*", express.static(path.join(__dirname, "/public/404.html")));
//kan ikke ha 404 page hvis jeg bruker den fetch metoden jeg gjør nå.. :(

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

        // Sjekker om passordet er plaintext eller ikke
        // if (user.passord.startsWith('$2b$')) {
            // Assume it's a bcrypt hash
            validPassword = bcrypt.compareSync(password, user.passord);
        // } else {
        //     // For å få plaintext til å fungere
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

// Route for admin page, accessible only by admin users
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/admin.html'));
});

app.get('/godkjenn', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/admin-godkjenn.html'));
});


// login page for unauthenticated users
app.use("/login", express.static(path.join(__dirname, "/public")));

app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/bilder", express.static(path.join(__dirname, "bilder")));
app.use("/register", express.static(path.join(__dirname, "/public/register.html")));

app.get('/api/table-data', (req, res) => {
    const query = `
        SELECT register.users_id, register.date, register.hours, register.room, register.subject, status.register_status, 
               teachers.name || ' ' || teachers.last_name AS teacher_name
        FROM register
        INNER JOIN status ON register.status_id = status.status_id
        INNER JOIN teachers ON register.teachers_id = teachers.teacher_id WHERE register.users_id = ?
        `
    ;

    db.all(query, [req.session.user_id], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/saldo', (req, res) => {
    const query = `
        SELECT SUM(hours) AS total_hours
        FROM register
        WHERE status_id = 1 AND register.users_id = ?
        `
    ;

    db.get(query, [req.session.user_id], (err, row) => {
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

    app.post('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.json({ message: 'Logged out successfully' });
        });
    });

    app.get('/api/registered-data', (req, res) => {
        const query = `
        SELECT * FROM register WHERE status_id = 2
        `
        ;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
    })

    app.get('/api/user/:id', (req, res) => {
        const userId = req.params.id;
    
        const query = `
            SELECT register.register_id, users.name ||' '|| users.last_name as user_name, register.date, register.timerange, register.hours, register.room, register.subject, teachers.name ||' '|| teachers.last_name as teacher_name,
            register.goal FROM register
            INNER JOIN users ON register.users_id = users.user_id
            INNER JOIN teachers ON register.teachers_id = teachers.teacher_id WHERE register.users_id = ? AND status_id = 2
        `;
        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
    
            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: 'No records found for this user' });
            }
    
            res.json(rows); // Return the array of records
        });
    });
    
// // Update register status to "approved" (status_id = 1)
// app.post('/api/update-status-approved', (req, res) => {
//     const { register_id } = req.body; // Get the register ID from the body

//     const sql = 'UPDATE register SET status_id = 1 WHERE register_id = ?';
//     db.run(sql, [register_id], function (err) {
//         if (err) {
//             console.error('Database error:', err);
//             return res.status(500).json({ error: 'Failed to update register status' });
//         }
        
//         if (this.changes > 0) {
//             return res.json({ message: 'Register status updated to approved' });
//         } else {
//             return res.status(404).json({ message: 'Register not found' });
//         }
//     });
// });

// // Update register status to "rejected" (status_id = 3)
// app.post('/api/update-status-rejected', (req, res) => {
//     const { register_id } = req.body; // Get the register ID from the body

//     const sql = 'UPDATE register SET status_id = 3 WHERE register_id = ?';
//     db.run(sql, [register_id], function (err) {
//         if (err) {
//             console.error('Database error:', err);
//             return res.status(500).json({ error: 'Failed to update register status' });
//         }
        
//         if (this.changes > 0) {
//             return res.json({ message: 'Register status updated to rejected' });
//         } else {
//             return res.status(404).json({ message: 'Register not found' });
//         }
//     });
// });

});

app.listen(port, (error)=> {
    if(error) {
        console.log("The server did not start: ", error);
        return;
    }

    console.log("The server is running on http://localhost:" + port);
}) 