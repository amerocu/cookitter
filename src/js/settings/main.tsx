import { useEffect, useState } from "react";
import { os, path } from "../lib/cep/node";
import {
  csi,
  evalES,
  evalFile,
  openLinkInBrowser,
  subscribeBackgroundColor,
  evalTS,
} from "../lib/utils/bolt";

import "./main.scss";

const Main = () => {
  const [bgColor, setBgColor] = useState("#282c34");
  const [count, setCount] = useState(0);

  return (
    <div className="app" style={{ backgroundColor: bgColor }}>
      <header className="app-header">
        <p>
        Hello
        </p>
        <div className="button-group">
          <button onClick={() => setCount((count) => count + 1)}>
            Count is: {count}
          </button>
        </div>
        <p>
          Edit <code>main.tsx</code> and save to test HMR updates.
        </p>
      </header>
    </div>
  );
};

export default Main;
