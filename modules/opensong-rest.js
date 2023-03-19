const xml2js = require("xml2js");
const httpClient = require("./httpClient");
let parser = new xml2js.Parser();

async function GetCurrentList(){
    var response = await httpClient.GetOpensongRest("presentation/slide/list");

    parser.parseString(response, function(err, data){
        if (err) {
            console.log(err);
        } else {
            return data;
        }
    });
}

module.exports = () => {

    return {
        GetCurrentList
    }
}