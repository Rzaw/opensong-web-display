const ADDRESS = "localhost";
const PORT = 8082;

//LogToScreen("Test!!!!");

var connection;
try {
  connection = new WebSocket(`ws://${ADDRESS}:${PORT}/ws`, "xml");
} catch (e) {
  LogToScreen(e);
}

console.log(connection);
LogToScreen(connection.readyState);

connection.onopen = function(event) {
  text = "Connection established";
  console.log(text);
  LogToScreen(text);
  connection.send("/ws/subscribe/presentation");
};

connection.onmessage = function(event) {
  //console.log(event);
  var xml = XMLParser(event.data);
  var slide = xml.getElementsByTagName("slide");
  if (slide !== undefined) {
    var itemNumber = slide[0].attributes[0].value;
    if (slide.length === 1) {
      connection.send(`/presentation/slide/${itemNumber}`);
    } else {
      // TODO
      // nosakām kas tas ir (song / verse)
      var whatItIs = slide[0].attributes.type.value;
      //console.log(whatItIs);
      if (whatItIs !== null && whatItIs === "song") {
        DisplaySong(slide[0]);
      }
      if (whatItIs !== null && whatItIs === "scripture") {
        DisplayVerse(slide[0]);
      }
      if (whatItIs !== null && whatItIs === "blank") {
        DisplayBlank();
      }
      if (whatItIs !== null) {
        DisplayDefault();
      } else {
        DisplayBlank();
      }

      // attiecīgi novirzām vajadzīgās lietas katru lietu

      // Krāsu palete priekš dziesmām
      // - #6B3231
      // - #DB565D
      // - #FCFAF1
      // - #FACCAD
      // - #FF8A40

      //$("#verse").text(slide[1].textContent);
      //console.log(slide[1].textContent);
    }
  }
};

function DisplaySong(data) {
  // Ja paliek aktīvs noņem 'hidden' atribūtu
  var songDiv = $("#song");
  songDiv.removeAttr("hidden");
  // vajadzētu pievienot 'hidden' atrubūtu priekš pantiem, lai nepārklājas.
  $("#scripture").attr("hidden", "hidden");

  var gData = GatherDataFromXml(data, ["title", "slides"]);

  songDiv.find("#songTitle").text(gData.title.text);
  songDiv
    .find("#songLyrics")
    .html(gData.slides.text.replace(new RegExp("\n", "g"), "<br>"));
}

function GatherDataFromXml(slide, searchableData) {
  var result = {};
  for (let n = 0; n < searchableData.length; n++) {
    for (let i = 0; i < slide.childNodes.length; i++) {
      var selectedNode = slide.childNodes[i];
      if (selectedNode.localName === searchableData[n]) {
        result[searchableData[n]] = {
          id: i,
          text: selectedNode.textContent
        };
      }
    }
  }
  return result;
}

function DisplayVerse(data) {
  // Paslēpt to kas šobrīd ir aktīvs
  $("#song").attr("hidden", "hidden");
  var scripture = $("#scripture");
  scripture.removeAttr("hidden");

  var xData = GatherDataFromXml(data, ["title", "subtitle", "slides"]);

  scripture.find("#verse").text(xData.slides.text);
  scripture.find("#reference").text(xData.title.text);
  scripture.find("#version").text(xData.subtitle.text);
}

function DisplayDefault() {}

function DisplayBlank() {
  $("#song").attr("hidden", "hidden");
  $("#scripture").attr("hidden", "hidden");
}

function XMLParser(xml) {
  if (window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(xml, "text/xml");
    return xmlDoc;
  } // Internet Explorer
  else {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(xml);
    return xmlDoc;
  }
}

function LogToScreen(text) {
  $("#debugger").text(text);
}
