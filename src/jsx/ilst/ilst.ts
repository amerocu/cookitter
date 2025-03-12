import {
  helloVoid,
  helloError,
  helloStr,
  helloNum,
  helloArrayStr,
  helloObj,
} from "../utils/samples";
export { helloError, helloStr, helloNum, helloArrayStr, helloObj, helloVoid };
import { dispatchTS } from "../utils/utils";

export const helloWorld = () => {
  alert("Hello from Illustrator");
};

export function getLayers() {
  var doc = app.activeDocument;
  var layers = [];
  
  for (var i = 0; i < doc.layers.length; i++) {
      layers.push({
          name: doc.layers[i].name,
          visible: doc.layers[i].visible
      });
  }
  
  return layers;
}
