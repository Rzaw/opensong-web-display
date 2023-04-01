const setupController = require('../controllers/setupController');

module.exports = (app) => {
    app.use("/setup", setupController);
}