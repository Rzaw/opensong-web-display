const xmlParser = require("./xmlUtility");
const httpClient = require("./httpClient");

async function GetCurrentList(){
    var response = await httpClient.GetOpensongRest("/presentation/slide");

    let jsonData = await xmlParser(response);

    console.log(jsonData);
}

module.exports = () => {

    return {
        GetCurrentList
    }
}