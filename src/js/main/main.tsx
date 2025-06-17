import { useState } from "react";
import { openLinkInBrowser, evalTS } from "../lib/utils/bolt";

import "../style.css";

const speedLevels: Record<string, number> = {
  slowest: 5000,
  slow: 1000,
  fast: 500,
  fastest: 200,
};

const Main = () => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [doPortals, setDoPortals] = useState<boolean>(false);

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
    evalTS("appRender", { doPortals }).then((res) => {
      setIsSyncing(false);
      console.log(typeof res, res);
    });
  };

  const messages = [{ type: "info", text: "No messages." }];

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
      {/* <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === "warning" ? "⚠️" : msg.type === "info" ? "ℹ️" : "❌"}{" "}
            {msg.text}
          </div>
        ))}
      </div> */}

      {/* Footer Row */}
      <div className="bottom-row">
        <span>v1.0.0</span>
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
