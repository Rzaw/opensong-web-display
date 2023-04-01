const displayController = require('../controllers/displayController');

module.exports = (app) => {
    app.use("/display", displayController);
}