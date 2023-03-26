const os = require('os');

module.exports = () => {
    const config = require("config");

    const opConfig = config.get("OpensongRemoteConnection");
    const srvConfig = config.get("ServerConfiguration");
    ;
    const _DEFAULT = {
        "OpenSong": {
            "IP": "127.0.0.1",
            "Port": 8082
        },
        "WebServer": {
            "Socket":{
                "Port": 8001
            },
            "Server": {
                "IP": "127.0.0.1",
                "Port": 8080
            }
        }
    }

    var webServerIp = _DEFAULT.WebServer.Server.IP;
    var webServerPort = _DEFAULT.WebServer.Server.Port;
    var webServerSocketPort = _DEFAULT.WebServer.Socket.Port;
    var openSongWsIp = _DEFAULT.OpenSong.IP;
    var openSongWsPort = _DEFAULT.OpenSong.Port;

    // Checks for values
    // OpenSong configuration
    if (opConfig !== undefined) {
        // Opensong check
        if (opConfig.IsLocal){
            console.warn("Server listens for local Opensong instance!");
        }
        if (!opConfig.IsLocal && opConfig.Address !== undefined && opConfig.Address !== '' ) {
            openSongWsIp = opConfig.Address;
        }
        if (opConfig.Port !== undefined && opConfig.Port !== '' ) {
            openSongWsPort = opConfig.Port;
        }
    }

    if (srvConfig !== undefined) {
        // Server check
        if (srvConfig.PageConfig !== undefined) {
            if (srvConfig.PageConfig.Address !== undefined && srvConfig.PageConfig.Address !== "undefined" && srvConfig.PageConfig.Address !== '' ) {
                webServerIp = srvConfig.PageConfig.Address;
            } else {
                webServerIp = GetNetworkAddress();
            }
            if (srvConfig.PageConfig.Port !== undefined && srvConfig.PageConfig.Port !== '' ) {
                webServerPort = srvConfig.PageConfig.Port;
            }
        }

        // Socket check
        if (srvConfig.SocketIO !== undefined) {
            if (srvConfig.SocketIO.Port !== undefined && srvConfig.SocketIO.Port !== '' ) {
                webServerSocketPort = srvConfig.SocketIO.Port;
            }
        }
    }

    return {
        webServerIp,
        webServerPort,
        webServerSocketPort,
        openSongWsIp,
        openSongWsPort
    }

}

function GetNetworkAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const ifaceName in networkInterfaces) {
      const iface = networkInterfaces[ifaceName];
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
    return null;
  }