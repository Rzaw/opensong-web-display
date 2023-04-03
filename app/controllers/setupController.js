const express = require('express');
const router = express.Router();
const config = require('../../config/server');
const opensong_ws = require('../../utils/opensong-ws');
const socket_io = require('../../utils/socket-io');

router.get("/", (req, res) => {
    res.render("setup/setup", {
        address: `${config.serverAddress}:${config.serverSocket}`,
        ClientStarted: "0",
        options: {
            serverIp: config.serverAddress,
            opensongIp: config.opensongAddress,
            opensongPort: config.opensongPort,
            serverPort: config.serverPort,
        },
    });
});

router.post("/start", (req, res) => {
    opensong_ws.startOpensongWebClient(config.opensongAddress, config.opensongPort);
    res.json({ running: true });
  });
  
  router.post("/stop", (req, res) => {
    opensong_ws.stopOpensongWebClient();
    res.json({ running: false });
  });
  
  router.post("/clearScreen", (req, res) => {
    socket_io.SendDataToSocket(opensong.getDefault);
    socket_io.LogToSetup(
      new Log(Date.now(), Type.Debug, "Sent clear command to display")
    );
    res.json({ running: true, clearScreen: true });
  });
  
  module.exports = router;