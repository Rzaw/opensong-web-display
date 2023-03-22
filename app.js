const express = require("express");
const app = express();
const config = require("./modules/config")();

const fetch = require("node-fetch");
const Log = require("./modules/log");
const io = require("./modules/socket-io")();
const opensong = require("./modules/opensong-ws")();
const logger = require("./modules/logger");

const opensongRest = require("./modules/opensong-rest")

///// Logging information
logger.info(`Server IP: ${config.webServerIp}:${config.webServerPort}`);

app.set("view engine", "ejs");
app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({ extended: false }));

// for use of web dependencies
app.use("/public", express.static("public"));
app.use(
  "/scripts",
  express.static(__dirname + "/node_modules/socket.io-client/dist")
);
app.use(
  "/font-awesome",
  express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free/")
);

app.get("/setup", function (req, res) {
  res.render("setup/setup", {
    address: `${config.webServerIp}:${config.webServerSocketPort}`,
    ClientStarted: "0",
    options: {
      opensongIp: config.openSongWsIp,
      opensongPort: config.openSongWsPort,
      serverPort: config.webServerPort,
    }
  });
});

app.post("/setup/start", function (req, res) {
  // jāievieto loģika kas dos saprast vai 
  opensong.startOpensongWebClient(config.openSongWsIp, config.openSongWsPort);
  res.json({ running: true });
});

app.post("/setup/stop", function (req, res) {
  // Jāsaprot kā apturēt WebSocket
  opensong.stopOpensongWebClient();
  res.json({ running: false });
});

app.post("/setup/clearScreen", function (req, res) {
  // Jāsaprot kā apturēt WebSocket
  io.SendDataToSocket(opensong.getDefault);
  io.LogToSetup(
    new Log(Date.now(), Type.Debug, "Sent clear command to display")
  );
  res.json({ running: true, clearScreen: true });
});

// app.get("/currentSet", function(req, res){
  
//   let result;
//   // "/presentation/slide/list"
  

//   res.json();
// });

app.get("/display", function (req, res) {
  res.render("display/index", { address: `${config.webServerIp}:${config.webServerSocketPort}` });
});

app.get("/display-alpha", function (req, res) {
  res.render("display/alpha", { address: `${config.webServerIp}:${config.webServerSocketPort}` });
});

app.post("/opensong/slide-control", function (req, res) {
  //req.body.webAction
  if (req.body.webAction !== undefined) {
    var reqToOpensong = "";

    switch (req.body.webAction) {
      case "first-slide":
        reqToOpensong = "/presentation/slide/first";
        break;
      case "previous-section":
        reqToOpensong = "/presentation/section/previous";
        break;
      case "previous-slide":
        reqToOpensong = "/presentation/slide/previous";
        break;
      case "next-slide":
        reqToOpensong = "/presentation/slide/next";
        break;
      case "next-section":
        reqToOpensong = "/presentation/section/next";
        break;
      case "last-slide":
        reqToOpensong = "/presentation/slide/last";
        break;
      default:
        res.json({ message: "Action not found" });
        break;
    }

    let url = `http://${config.openSongWsIp}:${config.openSongWsPort}${reqToOpensong}`;
    fetch(url, { method: "POST" });
  }
  res.json({});
});

app.listen(config.webServerPort);