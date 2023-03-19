const config = require("./config")();

async function GetOpensongRest(resource)
{
    let res = await fetch(`http://${config.openSongWsIp}:${config.openSongWsPort}/${resource}`);
    return res.text()
}

async function PostOpensongRest(resource, payload)
{

}

module.exports = () => {
    return {
        GetOpensongRest,
        PostOpensongRest
    }
}