const opensongController = require('../controllers/opensongController');

module.exports = (app) => {
    app.use("/opensong", opensongController);
}