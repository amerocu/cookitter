import { useState } from "react";
import { openLinkInBrowser, evalTS } from "../lib/utils/bolt";
import { version } from "../../../package.json";

import "../style.css";

type Message = {
  type: "info" | "warning" | "error";
  text: string;
};

function prettyDuration(duration: number): string {
  if (duration < 1000) {
    return `${duration.toFixed(0)} ms`;
  } else if (duration < 60 * 1000) {
    return `${(duration / 1000).toFixed(1)} s`;
  } else {
    return `${(duration / 1000 / 60).toFixed(1)} m`;
  }
}

const speedLevels: Record<string, number> = {
  slowest: 5000,
  slow: 1000,
  fast: 500,
  fastest: 200,
};

const Main = () => {
  const [activePanel, setActivePanel] = useState<
    "messages" | "manual" | "auto"
  >("auto");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [doPortals, setDoPortals] = useState<boolean>(false);
  const [duration, setDuration] = useState<number | null>(null);

  const serialize = () => {
    evalTS("serializeApp").then((res) => {
      console.log(typeof res, res);
    });
  };

  const reset = () => {
    evalTS("appReset").then((res) => {
      console.log(typeof res, res);
    });
  };

  const sync = () => {
    setIsSyncing(true);
    const start = performance.now();
    evalTS("appRender", { doPortals }).then((res) => {
      const end = performance.now();
      const duration = end - start;
      setDuration(duration);
      setIsSyncing(false);
      console.log(typeof res, res);
    });
  };

  const infoMessages: Message[] = [
    ...(duration
      ? [
          {
            type: "info",
            text: `Sync took ${prettyDuration(duration)}`,
          } as Message,
        ]
      : []),
  ];

  const errorMessages: Message[] = [];

  const messages = [...infoMessages, ...errorMessages];

  return (
    <div className="panel">
      <div className="top-row">
        <button className="button" onClick={sync} disabled={isSyncing}>
          {isSyncing ? "Syncing..." : "Sync"}
        </button>
        <label>
          Portals
          <input
            type="checkbox"
            checked={doPortals}
            onChange={() => setDoPortals(!doPortals)}
          />
        </label>
        <button className="button" onClick={reset}>
          Reset
        </button>
      </div>
      {/* Message List */}
      <div className="panel-tabs">
        <button
          className={`tab-button ${activePanel === "manual" ? "active" : ""}`}
          onClick={() =>
            setActivePanel(activePanel === "manual" ? "auto" : "manual")
          }
        >
          📘 Manual
        </button>
        <button
          className={`tab-button ${activePanel === "messages" ? "active" : ""}`}
          onClick={() =>
            setActivePanel(activePanel === "messages" ? "auto" : "messages")
          }
        >
          📝 Messages {messages.length}
        </button>
      </div>
      <div className="panel-content">
        {activePanel === "messages" ||
        (activePanel === "auto" && messages.length > 0) ? (
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.type === "warning"
                  ? "⚠️"
                  : msg.type === "info"
                    ? "ℹ️"
                    : "❌"}
                {msg.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="manual">
            <ul>
              <li>
                Name arboards based on page and side.
                <ul>
                  <li>
                    <code>CK-1-A</code> page 1 side A
                  </li>
                  <li>
                    <code>CK-1-B</code> page 1 side B
                  </li>
                  <li>
                    <code>CK-2-A</code> page 2 side A
                  </li>
                  <li>and so on...</li>
                </ul>
              </li>
              <li>
                Click <b>Sync</b> to make the magic happen.
              </li>
              <li>
                Add your PathItems in the <code>cookitter</code> layer.
              </li>
              <li>
                Enable <b>Portals</b> to see through your cuts.
              </li>
              <li>
                Use <b>Reset</b> to start fresh of all cookitter work.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Footer Row */}
      <div className="bottom-row">
        <span>v{version}</span>
        <a onClick={serialize} className="help">
          serialize
        </a>
        <a
          onClick={() =>
            openLinkInBrowser("https://github.com/amerocu/cookitter")
          }
          className="help"
        >
          Help
        </a>
      </div>
    </div>
  );
};

export default Main;
