const config = require("./config")();
const io = require("socket.io")(config.webServerSocketPort);

module.exports = () => {
    var SendDataToSocket = function(data) {
        io.emit("formOpenSong", data);
    };
    var LogToSetup = function(data) {
        io.emit("logsFromServer", data);
    };

    var DisplayOpensongSet = function(data) {
        io.emit("displayOpensongSet", data);
    };

    return {
        SendDataToSocket,
        LogToSetup,
        DisplayOpensongSet
    }
}
