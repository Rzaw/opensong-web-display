const WebSocketClient = require("websocket").client;
const config = require("./config")();
const xml2js = require("xml2js");
const Log = require("./log");
const Type = require("./type");
const io = require("./socket-io")();

var parser = new xml2js.Parser();

var client = new WebSocketClient();

client.on("connectFailed", function (error) {
    console.error(`${GetFormattedTime(new Date())} Connection Failed: ${error}`);
    io.LogToSetup(new Log(Date.now(), Type.Error, "Connection Failed", error));
});
  
client.on("connect", function (connection) {
  // Izvada ja savienojums ir bijis veiksmīgs
  console.log(`${GetFormattedTime(new Date())} Connection successful`);
  io.LogToSetup(new Log(Date.now(), Type.Info, "Connection successful"));

  // Priekš kādām OpenSong versijām ir jānosūta abonēšanas pieprasījums
  connection.sendUTF("/ws/subscribe/presentation");

  // Statusi ko sagaida no OpenSong
  // Gadījumā ja Opensong ir kādas kļūmes
  connection.on("error", function (error) {
    console.error(`${GetFormattedTime(new Date())} An error occurred ${error}`);
    io.LogToSetup(
      new Log(Date.now(), Type.Error, "An error occurred", error.message)
    );
  });
  
    // Paziņojums par socket slēgšanu.
  connection.on("close", function () {
    console.log(`${GetFormattedTime(new Date())} Connection closed.`);
    io.LogToSetup(new Log(Date.now(), Type.Info, "Connection closed"));

    // Nosūtīt uz setup lapu ka savienojums ir slēgts un vai vēlas to restartēt.
  });
  
    // Izmaiņu saņemšana no OpenSong
  connection.on("message", function (message) {
    var parsed = undefined;

    // Parsing XML file
    parser.parseString(message.utf8Data, function (err, data) {
      // Ja ir kāda problēma izvada to uz ekrāna.
      if (err)
        io.LogToSetup(
          new Log(Date.now(), Type.Error, "Parsing Error", err.message)
        );
      parsed = data;
    });
  
      try {
        // Jā xml tulks nav spējis pārveidot uz json formātu, tad tiešais
        // teksts tiek izvadīts uz ekrāna
        if (parsed !== undefined) {
          // Lai programma tālāk nedarbotos, pārbaudām vai xml failā ir 'response'
          if (parsed.response === undefined || parsed.response === null) {
            return "";
          }
          // Pārbaude vai ir detalizēts slaids
          if (parsed.response.$.action === "slide") {
            // iegūt datus no slide
            var result = GatherDataFromSlide(parsed.response.slide);
  
            // izvada logu uz .../setup ekrāna
            io.LogToSetup(
              new Log(
                Date.now(),
                Type.Debug,
                "Displaying data to screen",
                undefined,
                {
                  Action: parsed.response.$.action,
                  Slide: result,
                }
              )
            );
  
            // Aizūta uz .../display lapu
            io.SendDataToSocket(result);
          }
          if (parsed.response.$.action === "status") {
            var openSongData = {};
            openSongData["Action"] = parsed.response.$.action;
  
            // Pārbauda vai "running"
            var running = IsRunning(parsed.response);
            openSongData["Running"] = running;
            if (running != "0") {
              // dabūt item numuru (funkcija)
              var itemNumber = GetItemNumber(parsed);
              openSongData["SlideNumber"] = itemNumber;
              // nosūtīt req uz ws un sagaidīt datus
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
        } else {
          io.LogToSetup(
            new Log(
              Date.now(),
              Type.Info,
              `OpenSong responded with: ${message.utf8Data}`
            )
          );
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
    });
  
    function RequestSlideDetails(slideNumber) {
      connection.sendUTF(`/presentation/slide/${slideNumber}`);
    }
  });

module.exports = () => {

    var startOpensongWebClient = (url, port) => {
        console.info(`OpenSong IP: ${url}:${port}`);
        console.info(
            `To see information in browser open http://${config.webServerIp}:${config.webServerPort}`
        );
        client.connect(`ws://${url}:${port}/ws`);
    }

    var stopOpensongWebClient = () => {
      client.abort();
      client.removeAllListeners((event) => console.log(event));
      console.info("User closed connection");
      io.LogToSetup(new Log(Date.now(), Type.Info, "User closed OpenSong connection."))
    }

    return {
        startOpensongWebClient,
        stopOpensongWebClient,
        getDefault: GetDefault()
    }
};

function IsRunning(response) {
    return response.presentation[0].$.running;
  }
  function GetItemNumber(item) {
    return item.response.presentation[0].slide[0].$.itemnumber;
  }
  function GatherDataFromSlide(slide) {
    var result = {};
    var whatItIs = slide[0].$.type;
  
    switch (whatItIs) {
      case "song":
        result = GetSong(slide);
        break;
      case "scripture":
        result = GetScripture(slide);
        break;
      case "blank":
        result = GetDefault();
        break;
      default:
        break;
    }
  
    return result;
  }
  function GetScripture(data) {
    var scriptureVerse = data[0].slides[0].slide[0].body[0];
    var scriptureReference = data[0].title[0];
    var scriptureVersion = data[0].subtitle[0];
  
    return {
      verse: scriptureVerse,
      reference: scriptureReference,
      version: scriptureVersion,
      type: "scripture",
    };
  }
  function GetSong(data) {
    var songTitle = undefined;
    var songLyrics = undefined;
  
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
