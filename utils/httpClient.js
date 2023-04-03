const config = require("./../config/server");

async function GetOpensongRest(resource)
{
    let res = await fetch(`http://${config.opensongAddress}:${config.opensongPort}/${resource}`);
    return res.text()
}

async function PostOpensongRest(resource, payload = null)
{
    let postOptions = {method: 'POST'};
    let res = await fetch(`http://${config.opensongAddress}:${config.opensongPort}/${resource}`, postOptions);
    return res.text()
}

module.exports = () => {
    return {
        GetOpensongRest,
        PostOpensongRest
    }
}