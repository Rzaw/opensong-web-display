const WebSocketClient = require("websocket").client;
const logger = require("./logger");
const config = require("./config")();
const xml2js = require("xml2js");
const Log = require("./log");
const Type = require("./type");
const io = require("./socket-io")();
const presentationActions = require("./../models/opensong/PresentationActions");
const presentationSlideTypes = require("./../models/opensong/PresentationSlideTypes");
const PresentationActions = require("./../models/opensong/PresentationActions");
const PresentationSlideTypes = require("./../models/opensong/PresentationSlideTypes");

var parser = new xml2js.Parser();

var client = new WebSocketClient();
var clientSet = new WebSocketClient();
let connectionG;

client.on("connectFailed", HandleConnectFailed);
client.on("connect", HandleConnect);

function HandleConnectFailed(error) {
    logger.error(`${GetFormattedTime(new Date())} Connection Failed: ${error}`);
    io.LogToSetup(new Log(Date.now(), Type.Error, "Connection Failed", error));
}

function HandleConnect(connection) {
    logger.info(`${GetFormattedTime(new Date())} Connection successful`);
    io.LogToSetup(new Log(Date.now(), Type.Info, "Connection successful"));

    connectionG = connection;
    connectionG.sendUTF("/ws/subscribe/presentation");

    connectionG.on("error", HandleError);
    connectionG.on("close", HandleClose);
    connectionG.on("message", HandleMessage);
}

function HandleError(error) {
    logger.error(`${GetFormattedTime(new Date())} An error occurred ${error}`);
    io.LogToSetup(
        new Log(Date.now(), Type.Error, "An error occurred", error.message)
    );
}

function HandleClose() {
    logger.info(`${GetFormattedTime(new Date())} Connection closed.`);
    io.LogToSetup(new Log(Date.now(), Type.Info, "Connection closed"));
}

async function parseXml(xmlString) {
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

async function HandleMessage(message) {
    try {
        const parsed = await parseXml(message.utf8Data);

        if (parsed && parsed.response) {
            const action = parsed.response.$.action;

            switch (action) {
                case PresentationActions.Slide:
                    HandleSlideAction(parsed.response.slide);
                    break;
                case PresentationActions.Status:
                    HandleStatusAction(parsed.response);
                    break;
                default:
                    io.LogToSetup(
                        new Log(
                            Date.now(),
                            Type.Info,
                            `OpenSong responded with: ${message.utf8Data}`
                        )
                    );
            }
        }
    } catch (error) {
        io.LogToSetup(
            new Log(
                Date.now(),
                Type.Error,
                `Exception while executing set of commands`,
                error.message
            )
        );
    }
}

function HandleSlideAction(slide) {
    const result = GatherDataFromSlide(slide);

    io.LogToSetup(
        new Log(
            Date.now(),
            Type.Debug,
            "Displaying data to screen",
            undefined,
            {
                Action: "slide",
                Slide: result,
            }
        )
    );

    io.SendDataToSocket(result);
}

function HandleStatusAction(response) {
    const openSongData = {
        Action: "status",
        Running: IsRunning(response),
    };

    if (openSongData.Running != "0") {
        const itemNumber = GetItemNumber(response);
        openSongData.SlideNumber = itemNumber;
        RequestSlideDetails(itemNumber);
    }

    io.LogToSetup(
        new Log(
            Date.now(),
            Type.Debug,
            "Requesting slide information from Opensong",
            undefined,
            openSongData
        )
    );
}

function RequestSlideDetails(slideNumber) {
    connectionG.sendUTF(`/presentation/slide/${slideNumber}`);
}

module.exports = () => {
    return {
        startOpensongWebClient: (url, port) => StartOpensongWebClient(url, port),
        stopOpensongWebClient: () => StopOpensongWebClient(),
        getDefault: () => GetDefault(),
    };
};

function StartOpensongWebClient(url, port) {
    logger.info(`OpenSong IP: ${url}:${port}`);
    logger.info(
        `To see information in browser open http://${config.webServerIp}:${config.webServerPort}`
    );
    client.connect(`ws://${url}:${port}/ws`);
}

function StopOpensongWebClient() {
    connectionG.sendUTF('/ws/unsubscribe/presentation');
    logger.info("User closed OpenSong connection.");
    io.LogToSetup(new Log(Date.now(), Type.Info, "User closed OpenSong connection."));
}

function GatherDataFromSlide(slide) {
    let result = {};
    let whatItIs = slide[0].$.type;

    switch (whatItIs) {
        case PresentationSlideTypes.Song:
            result = GetSong(slide);
            break;
        case PresentationSlideTypes.Scripture:
            result = GetScripture(slide);
            break;
        case PresentationSlideTypes.Blank:
            result = GetDefault();
            break;
        default:
            break;
    }

    return result;
}
function GetScripture(data) {
    let scriptureVerse = data[0].slides[0].slide[0].body[0];
    let scriptureReference = data[0].title[0];
    let scriptureVersion = data[0].subtitle[0];

    return {
        verse: scriptureVerse,
        reference: scriptureReference,
        version: scriptureVersion,
        type: "scripture",
    };
}
function GetSong(data) {
    let songTitle = undefined;
    let songLyrics = undefined;

    songTitle = data[0].title[0];
    songLyrics = data[0].slides[0].slide[0].body[0];

    return { title: songTitle, lyric: songLyrics, type: "song" };
}

function GetDefault() {
    return { type: "blank" };
}

function GetFormattedTime(time) {
    return `[${NumberPad(time.getHours())}:${NumberPad(
        time.getMinutes()
    )}:${NumberPad(time.getSeconds())}]`;
}

function NumberPad(num) {
    return `${num < 10 ? "0" + num : num}`;
}

function IsRunning(response) {
    return response.presentation[0].$.running;
}

function GetItemNumber(item) {
    return item.presentation[0].slide[0].$.itemnumber;
}