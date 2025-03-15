import { mapp } from "./utils";
import Logger from "./logger";

var l = Logger({ name: "serialize", alsoDebug: true, enable: true });

export const serializeApp = () => {
  const doc = app.activeDocument;

  l.i("serializing...");

  return {
    aliasPath: $.fileName,
    engine: $.engineName,
    layers: mapp(doc.layers, serializeLayer),
    artboards: mapp(doc.artboards, serializeArtboard),
  };
};

function serializeLayer(layer: Layer) {
  return {
    name: layer.name,
    visible: layer.visible,
    pathItems: mapp(layer.pathItems, serializePathItem),
  };
}

function serializePathItem(pi: PathItem) {
  return {
    name: pi.name,
    note: pi.note,
    lenght: pi.length,
    position: pi.position,
    width: pi.width,
    height: pi.height,
    top: pi.top,
    locked: pi.locked,
    selected: pi.selected,
    stroked: pi.stroked,
    stroke: {
      // strokeColor: pi.strokeColor,
      strokeDashes: pi.strokeDashes,
      strokeDashOffset: pi.strokeDashOffset,
      strokeJoin: pi.strokeJoin,
      strokeMiterLimit: pi.strokeMiterLimit,
      strokeOverprint: pi.strokeOverprint,
      strokeWidth: pi.strokeWidth,
    },
    tags: mapp(pi.tags, serializeTag),
    pathPoints: mapp(pi.pathPoints, serializePathPoint),
  };
}

function serializeTag(t: Tag) {
  return {
    name: t.name,
    value: t.value,
  };
}

function serializePathPoint(pp: PathPoint) {
  return {
    anchor: pp.anchor,
    leftDirection: pp.leftDirection,
    pointType: pp.pointType,
    rightDirection: pp.rightDirection,
    typename: pp.typename,
  };
}

function serializeArtboard(ab: Artboard) {
  return {
    name: ab.name,
    artboardRect: ab.artboardRect,
    rulerOrigin: ab.rulerOrigin,
    rulerPAR: ab.rulerPAR,
    typename: ab.typename,
  };
}
