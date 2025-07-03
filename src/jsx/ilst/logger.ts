type LoggerConfig = {
  name: string;
  enable: boolean;
  logLevel: LogLevel;
};

type Logger = {
  l: (level: LogLevel, msg: Message) => void;
  i: (msg: Message) => void;
  w: (msg: Message) => void;
  e: (msg: Message) => void;
  setFilePath: (path: string) => void;
};

type Message = string | (() => string);

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;
}

const emptyLogger: Logger = {
  l: (level: LogLevel, msg: Message) => {},
  i: (msg: Message) => {},
  w: (msg: Message) => {},
  e: (msg: Message) => {},
  setFilePath: (path: Message) => {},
};

const Logger = function (cfg: LoggerConfig): Logger {
  if (!cfg.enable) {
    return emptyLogger;
  }
  const logFolderPath = `${Folder.myDocuments}/cookitter/logs`;

  var logFolder = new Folder(logFolderPath);
  if (!logFolder.exists) {
    logFolder.create();
  }

  const timestamp = toYMD(new Date());
  var logFilePath = `${logFolderPath}/${timestamp}_${cfg.name}.txt`;
  var lastFlushTime = new Date().getTime();
  var flushInterval = 10000; // 10 seconds

  $.writeln("Opening log at: " + logFilePath);
  var file: File | null = null;

  function flush() {
    try {
      if (file) {
        file.close();
        $.writeln("Closing log file...");
      }
      file = new File(logFilePath);
      file.open("a"); // Append mode
      lastFlushTime = new Date().getTime();
      $.writeln("Opened!");
    } catch (e) {
      $.writeln("Unable to open log file " + e);
    }
  }

  flush();

  function shouldLog(level: LogLevel): boolean {
    return level <= cfg.logLevel;
  }

  function log(level: LogLevel, message: Message) {
    try {
      if (shouldLog(level)) {
        const timestamp = toYMD(new Date());

        const textMessage = typeof message === "function" ? message() : message;

        const logMessage =
          "[" + timestamp + "][" + cfg.name + "][" + level + "] " + textMessage;

        file?.writeln(logMessage);
        if (cfg.logLevel == LogLevel.DEBUG) $.writeln(logMessage);

        const now = new Date().getTime();
        if (now - lastFlushTime >= flushInterval) {
          flush();
        }
      }
    } catch (e) {
      $.writeln("Unable to log: " + e);
    }
  }

  return {
    l: log,
    i: function (message: Message) {
      log(LogLevel.INFO, message);
    },
    w: function (message: Message) {
      log(LogLevel.WARN, message);
    },
    e: function (message: Message) {
      log(LogLevel.ERROR, message);
    },
    setFilePath: function (path: string) {
      logFilePath = path;
    },
  };
};

export default Logger;
