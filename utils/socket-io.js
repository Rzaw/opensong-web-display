const config = require("./../config/server");
const io = require("socket.io")(config.serverSocket);

module.exports = () => {
    var SendDataToSocket = function(data) {
        io.emit("formOpenSong", data);
    };
    var LogToSetup = function(data) {
        io.emit("logsFromServer", data);
    };

    return {
        SendDataToSocket,
        LogToSetup
    }
}
