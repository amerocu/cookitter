import { Rectangle } from "./rectangle";

export function artboardRectangle(artboard: Artboard): Rectangle {
  const artRect = artboard.artboardRect;
  return {
    x: artRect[0],
    y: artRect[1],
    width: Math.abs(artRect[0] - artRect[2]),
    height: Math.abs(artRect[1] - artRect[3]),
  };
}

export function pathItemRectangle(pi: PathItem): Rectangle {
  const pos = pi.position;
  return {
    x: pos[0],
    y: pos[1],
    width: pi.width,
    height: pi.height,
  };
}
