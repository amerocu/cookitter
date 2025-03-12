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


  //* Demonstration of End-to-End Type-safe ExtendScript Interaction
  const jsxTestTS = () => {
    evalTS("helloStr", "test").then((res) => {
      console.log(res);
    });
    evalTS("helloNum", 1000).then((res) => {
      console.log(typeof res, res);
    });
    evalTS("helloArrayStr", ["ddddd", "aaaaaa", "zzzzzzz"]).then((res) => {
      console.log(typeof res, res);
    });
    evalTS("helloObj", { height: 90, width: 100 }).then((res) => {
      console.log(typeof res, res);
      console.log(res.x);
      console.log(res.y);
    });
    evalTS("helloVoid").then(() => {
      console.log("function returning void complete");
    });
    evalTS("helloError", "test").catch((e) => {
      console.log("there was an error", e);
    });
  };

  const nodeTest = () => {
    alert(
      `Node.js ${process.version}\nPlatform: ${
        os.platform
      }\nFolder: ${path.basename(window.cep_node.global.__dirname)}`
    );
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
          <select value={mainLayer} onChange={(e) => setMainLayer(e.target.value)}>
              <option key="none" value="none">none</option>
          {layers.map((layer, index) => (
               <option key={layer.name} value={layer.name}>{layer.name}</option>
            ))}
          </select>
          <p>Main layer: <code>{mainLayer}</code></p>
        </div>
      </header>
    </div>
  );
};

export default Main;
