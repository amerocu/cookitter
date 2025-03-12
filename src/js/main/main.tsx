import { useEffect, useState } from "react";
import { os, path } from "../lib/cep/node";
import {
  csi,
  evalES,
  evalFile,
  openLinkInBrowser,
  evalTS,
} from "../lib/utils/bolt";

import "./main.scss";

const Main = () => {
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(false); // Store selected layer
  const [syncInternval, setSyncInternval] = useState<number>(1000);
  const [timerId, setTimerId] = useState<NodeJS.Timer | null>(null);

  const serialize = () => {
    evalTS("serializeApp").then((res) => {
      console.log(typeof res, res);
    });
  };
  const render = () => {
    evalTS("appRender").then((res) => {
      console.log(typeof res, res);
    });
  };
  const reset = () => {
    evalTS("appReset").then((res) => {
      console.log(typeof res, res);
    });
  };

  const rerender = () => {
    evalTS("appRender").then((res) => {
      console.log(typeof res, res);
    });
  };

  // Timer Functions
  const startSync = () => {
    if (!isSyncEnabled) {
      const id = setInterval(rerender, syncInternval);
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
  }, [syncInternval]);

  return (
    <div className="app">
      <header>
        <div>
          <p>Cookitter</p>

          <button onClick={serialize}>Serialize</button>
          <button onClick={render}>Render</button>
          <button onClick={reset}>Reset</button>
          <button onClick={toggleSync}>
            {isSyncEnabled ? "Stop Sync" : "Start Sync"}
          </button>
          <input
            type="number"
            value={syncInternval}
            onChange={(e: any) => setSyncInternval(Number(e.target.value))}
            className="mt-1"
          />
          <p>version: 0.1.0</p>
        </div>
      </header>
    </div>
  );
};

export default Main;
