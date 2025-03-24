import { useEffect, useState } from "react";
import { os, path } from "../lib/cep/node";
import { objectKeys } from "../../jsx/ilst/utils";
import {
  csi,
  evalES,
  evalFile,
  openLinkInBrowser,
  evalTS,
} from "../lib/utils/bolt";

import "../style.css";

const speedLevels: Record<string, number> = {
  slowest: 5000,
  slow: 1000,
  fast: 500,
  fastest: 200,
};

const Main = () => {
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(false);
  const [doPortals, setDoPortals] = useState<boolean>(false);
  const [refreshSpeed, setRefreshSpeed] = useState<string>("slow");
  const [timerId, setTimerId] = useState<NodeJS.Timer | null>(null);

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
    evalTS("appRender").then((res) => {
      console.log(typeof res, res);
    });
    if (doPortals) {
      evalTS("portalRender").then((res) => {
        console.log(typeof res, res);
      });
    }
  };

  // Timer Functions
  const startSync = () => {
    if (!isSyncEnabled) {
      const intervalms = speedLevels[refreshSpeed];
      const id = setInterval(sync, intervalms);
      setTimerId(id);
      setIsSyncEnabled(true);
    }
  };

  const stopSync = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setIsSyncEnabled(false);
  };

  const toggleSync = () => {
    if (isSyncEnabled) {
      stopSync();
    } else {
      startSync();
    }
  };

  useEffect(() => {
    if (isSyncEnabled) {
      stopSync();
      startSync();
    }
  }, [refreshSpeed]);

  const messages = [
    { type: "warning", text: "Potential issue detected." },
    { type: "error", text: "Sync failed!" },
  ];

  return (
    <div className="panel">
      <div className="top-row">
        <button className="button" onClick={sync}>
          Sync
        </button>
        <button
          className={`toggle-button ${isSyncEnabled ? "active" : ""}`}
          onClick={toggleSync}
        >
          🔄
        </button>
        <label>
          Portals
          <input
            type="checkbox"
            checked={doPortals}
            onChange={() => setDoPortals(!doPortals)}
          />
        </label>
        <select
          value={refreshSpeed}
          onChange={(e) => setRefreshSpeed(e.target.value)}
        >
          <option value="slower">Slower</option>
          <option value="slow">Slow</option>
          <option value="fast">Fast</option>
          <option value="fastest">Fastest</option>
        </select>
        <button className="toggle-button" onClick={reset}>
          🚫
        </button>
      </div>
      {/* Message List */}
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === "warning" ? "⚠️" : "❌"} {msg.text}
          </div>
        ))}
      </div>

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
