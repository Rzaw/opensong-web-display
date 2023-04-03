const os = require("os");
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    serverAddress: process.env.ADDRESS || GetNetworkAddress(),
    serverPort: process.env.PORT || 8088,
    serverSocket: process.env.SOCKET_PORT || 8001,
    opensongAddress: process.env.OPENSONG_ADDRESS || '192.168.8.91',
    opensongPort: process.env.OPENSONG_PORT || 8082,
}

function GetNetworkAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const ifaceName in networkInterfaces) {
        const iface = networkInterfaces[ifaceName];
        for (const alias of iface) {
            if (alias.family === "IPv4" && !alias.internal) {
                return alias.address;
            }
        }
    }
    return null;
}