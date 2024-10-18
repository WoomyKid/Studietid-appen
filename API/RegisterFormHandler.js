const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DbPath = path.join(__dirname, "../Data/StudietidDB.sqlite");

const handleRegisterForm = {
    postMessage: async (req, res) => {
        const body_ = await req.body;

        console.log("Received data from client:", body_);

        const db = new sqlite3.Database(DbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log("Error opening DB connection:", err);
                res.status(500).send({
                    Message: "Something went wrong, please try again.",
                });
            } else {
                console.log("Connected to DB successfully.");
            }
        });

        const [teacherName, teacherLastName] = body_.Teacher.split(" ");

        console.log("Teacher Name:", teacherName, "Teacher Last Name:", teacherLastName);

        const teacherQuery = "SELECT teacher_id FROM teachers WHERE name = ? AND last_name = ?";

        db.get(teacherQuery, [teacherName, teacherLastName], (err, row) => {
            if (err) {
                console.log("Error while fetching teacher_id:", err);
                res.status(500).send({
                    Message: "Something went wrong, please try again.",
                });
                return;
            }

            if (row) {
                const teacherId = row.teacher_id;

                console.log("Fetched teacher_id:", teacherId);

                const queryStr = "INSERT INTO register (goal, date, hours, subject, room, teachers_id) VALUES (?, ?, ?, ?, ?, ?)";
                db.run(queryStr, [body_.Goal, body_.Date, body_.TotalHours, body_.Subject, body_.Room, teacherId], (err) => {
                    if (err) {
                        console.log("Error inserting into register table:", err);
                        res.status(500).send({
                            Message: "Something went wrong, please try again.",
                        });
                    } else {
                        console.log("Data inserted successfully into register table.");
                        res.send({
                            Message: "Thank you for your message.",
                        });
                    }
                });
            } else {
                console.log("No teacher found with the name:", teacherName, teacherLastName);
                res.status(404).send({
                    Message: "Selected teacher was not found in the database.",
                });
            }
        });

        db.close((err) => {
            if (err) {
                console.log("Error closing the DB connection:", err);
            } else {
                console.log("DB connection closed.");
            }
        });
    },
};

module.exports = handleRegisterForm;