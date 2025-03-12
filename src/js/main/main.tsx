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
  const [layers, setLayers] = useState<{ name: string; visible: boolean }[]>(
    []
  );
  const [mainLayer, setMainLayer] = useState<string>("none"); // Store selected layer
  const [sideLayer, setSideLayer] = useState<string>(""); // Store selected layer

  const jsxSerialize = () => {
    evalTS("appSerialize").then((res) => {
      console.log(typeof res, res);
    });
  };
  const jsxRender = () => {
    evalTS("appRender").then((res) => {
      console.log(typeof res, res);
    });
  };
  const jsxReset = () => {
    evalTS("appReset").then((res) => {
      console.log(typeof res, res);
    });
  };

  useEffect(() => {
    evalTS("getLayers").then((result) => {
      if (result) {
        try {
          setLayers(result);
        } catch (error) {
          console.error("Failed to parse layer data:", error);
        }
      }
    });
  }, []);

  return (
    <div className="app">
      <header>
        <div>
          <p>Illustrator Layers {layers.length}</p>
          <select
            value={mainLayer}
            onChange={(e) => setMainLayer(e.target.value)}
          >
            <option key="none" value="none">
              none
            </option>
            {layers.map((layer, index) => (
              <option key={layer.name} value={layer.name}>
                {layer.name}
              </option>
            ))}
          </select>
          <button onClick={jsxSerialize}>Serialize</button>
          <button onClick={jsxRender}>Render</button>
          <button onClick={jsxReset}>Reset</button>
          <p>
            Main layer: <code>{mainLayer}</code>
          </p>
          <p>version: 0.0.3</p>
        </div>
      </header>
    </div>
  );
};

export default Main;
