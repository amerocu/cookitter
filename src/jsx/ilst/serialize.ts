import { mapp } from "./utils";
import Logger, { LogLevel } from "./logger";

var l = Logger({ name: "serialize", enable: false, logLevel: LogLevel.DEBUG });

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

function serializeLayer(l: Layer) {
  return {
    name: l.name,
    visible: l.visible,
    locked: l.locked,
    opacity: l.opacity,
    preview: l.preview,
    printable: l.printable,
    sliced: l.sliced,
    typename: l.typename,
    layers: mapp(l.layers, serializeLayer),
    pathItems: mapp(l.pathItems, serializePathItem),
    placedItems: mapp(l.placedItems, serializePlacedItem),
    groupItems: mapp(l.groupItems, serializeGroupItem),
    pageItems: mapp(l.pageItems, serializePageItem),
  };
}

function serializeGroupItem(g: GroupItem) {
  return {
    name: g.name,
    clipped: g.clipped,
    editable: g.editable,
    locked: g.locked,
    typename: g.typename,

    tags: mapp(g.tags, serializeTag),
    pathItems: mapp(g.pathItems, serializePathItem),
    placedItems: mapp(g.placedItems, serializePlacedItem),
    groupItems: mapp(g.groupItems, serializeGroupItem),
    pageItems: mapp(g.pageItems, serializePageItem),
  };
}

function serializePageItem(i: PageItem) {
  return {
    name: i.name,
    typename: i.typename,
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
    sliced: pi.sliced,
    clipping: pi.clipping,
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
    filled: pi.filled,
    pathPoints: mapp(pi.pathPoints, serializePathPoint),
  };
}

function serializePlacedItem(pi: PlacedItem) {
  return {
    name: pi.name,
    note: pi.note,
    editable: pi.editable,
    locked: pi.locked,
    file: pi.file?.absoluteURI,
    selected: pi.selected,
    sliced: pi.sliced,
    tags: mapp(pi.tags, serializeTag),
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
