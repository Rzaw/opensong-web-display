class Log {
  constructor(logTime, Type, logText, logError, openSongData) {
    this.Time = logTime;
    this.Type = Type;
    this.Text = logText;
    this.Error = logError;
    this.OpenSongData = openSongData;
  }
}

module.exports = Log;
