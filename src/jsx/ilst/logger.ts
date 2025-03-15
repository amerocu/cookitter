type LoggerConfig = {
  name: string;
  enable: boolean;
  alsoDebug: boolean;
};

type Logger = {
  l: (level: string, msg: string) => void;
  i: (msg: string) => void;
  w: (msg: string) => void;
  e: (msg: string) => void;
  setFilePath: (path: string) => void;
};

function toYMD(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;
}

const emptyLogger: Logger = {
  l: (level: string, msg: string) => {},
  i: (msg: string) => {},
  w: (msg: string) => {},
  e: (msg: string) => {},
  setFilePath: (path: string) => {},
};

const Logger = function (cfg: LoggerConfig): Logger {
  if (!cfg.enable) {
    return emptyLogger;
  }

  const timestamp = toYMD(new Date());
  var logFilePath =
    Folder.myDocuments + `/cookitter/logs/${timestamp}_${cfg.name}.txt`;

  $.writeln("Opening log at: " + logFilePath);
  var file: File | null = null;
  try {
    file = new File(logFilePath);
    file.open("a"); // Append mode

    $.writeln("Opened!");
  } catch (e) {
    $.writeln("Unable to open log file " + e);
  }

  function log(level: string, message: string) {
    try {
      const timestamp = toYMD(new Date());
      const logMessage =
        "[" + timestamp + "][" + cfg.name + "][" + level + "] " + message;
      if (cfg.alsoDebug) $.writeln(logMessage);
      file?.writeln(logMessage);
    } catch (e) {
      $.writeln("Unable to log: " + e);
    }
  }

  return {
    l: log,
    i: function (message: string) {
      log("INFO", message);
    },
    w: function (message: string) {
      log("WARN", message);
    },
    e: function (message: string) {
      log("ERROR", message);
    },
    setFilePath: function (path: string) {
      logFilePath = path;
    },
  };
};

export default Logger;
