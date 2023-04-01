const express = require('express');
const router = express.Router();
const config = require('../../config/server');

router.get("/", (req, res) => {
    res.render("display/index", { address: `${config.serverAddress}:${config.serverSocket}` });
});

router.get("/alpha", (req, res) => {
    res.render("display/alpha", { address: `${config.serverAddress}:${config.serverSocket}` });
});

module.exports = router;