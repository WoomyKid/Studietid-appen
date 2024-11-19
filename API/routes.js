const express = require("express");
const router = express.Router();

const updateStatusHandler = require("./UpdateStatusHandler");
const registerFormH = require("./RegisterFormHandler.js");


router.post("/api/update-status", updateStatusHandler.updateStatus);
router.post("/Register", registerFormH.postMessage);

module.exports = router;