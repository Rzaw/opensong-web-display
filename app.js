const express = require("express");
const app = express();
const config = require("./config/server");

const logger = require("./utils/logger");
const startupMiddlewares = require('./middlewares/startupMiddlewares');
const setupRoute = require('./app/routes/setupRoute');
const displayRoute = require('./app/routes/displayRoute');
const opensongRoute = require('./app/routes/opensongRoute');

///// Logging information
logger.info(`Server IP: ${config.serverAddress}:${config.serverPort}`);

// Middlewares
startupMiddlewares(app);

// Routes
setupRoute(app);
displayRoute(app);
opensongRoute(app);


app.listen(config.serverPort);