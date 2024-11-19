const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DbPath = path.join(__dirname, "../Data/StudietidDB.sqlite");

const updateStatusHandler = {
    updateStatus: (req, res) => {
        const { register_id, status_id } = req.body;

        console.log("Received data for status update:", req.body);

        if (!register_id || !status_id) {
            res.status(400).send({ Message: "Invalid data provided." });
            return;
        }

        const db = new sqlite3.Database(DbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log("Error opening DB connection:", err);
                res.status(500).send({ Message: "Database connection error." });
                return;
            }
        });

        const query = `UPDATE register SET status_id = ? WHERE register_id = ?`;

        db.run(query, [status_id, register_id], function (err) {
            if (err) {
                console.log("Error updating status:", err);
                res.status(500).send({ Message: "Failed to update status." });
            } else {
                console.log(`Status updated successfully for register_id ${register_id}.`);
                res.send({ Message: "Status updated successfully." });
            }
        });

        db.close((err) => {
            if (err) {
                console.log("Error closing DB connection:", err);
            } else {
                console.log("DB connection closed.");
            }
        });
    },
};

module.exports = updateStatusHandler;