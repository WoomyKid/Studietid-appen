const express = require("express");
const router = express.Router();
const registerFormH = require("./RegisterFormHandler.js");

router.post("/Register", registerFormH.postMessage);

module.exports = router;