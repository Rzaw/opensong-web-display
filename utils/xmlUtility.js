const xml2js = require("xml2js");

async function parseXml(xmlString) {
    let parser = new xml2js.Parser({
        preserveWhitespace: true
    });

    return new Promise((resolve, reject) => {
        parser.parseString(xmlString, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}


module.exports = parseXml;