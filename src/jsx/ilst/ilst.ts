import { _getLayers, findIntersections, Rectangle } from "./ilst.pure";

export const getLayers = _getLayers({ app: app });

function mapp(data: any, f: any) {
  var tmp = [];
  for (var i = 0; i < data.length; i++) {
    tmp.push(f(data[i]));
  }
  return tmp;
}

export const appReset = () => {
  if (app.documents.length === 0) return "No document open.";

  var doc = app.activeDocument;
  const layerName = "tagliato";
  var targetLayer = doc.layers.getByName(layerName);

  if (!targetLayer) return "Layer not found.";

  // Delete all objects in the layer
  while (targetLayer.pageItems.length > 0) {
    targetLayer.pageItems[0].remove();
  }

  return "Deleted all elements in " + layerName;
};

export const appRender = () => {
  const doc = app.activeDocument;
  var log: any[] = [];

  var artboards: Artboard[] = [];
  var artMap: Record<string, Artboard> = {};
  var artRectangle: Rectangle[] = [];
  var artMapping: Record<string, string> = {
    P1A: "P1B",
    P1B: "P1A",
    P2A: "P2B",
    P2B: "P2A",
  };

  for (var i = 0; i < doc.artboards.length; i++) {
    const artboard = doc.artboards[i];
    if (artboard.name != "") {
      artMap[artboard.name] = artboard;
      artboards.push(artboard);
      artRectangle.push(artboardRectangle(artboard));
    }
  }

  const sLayer = doc.layers.getByName("taglio");
  log.push(`found layer ${sLayer.name}`);

  const dLayer = doc.layers.getByName("tagliato");
  log.push(`found layer ${dLayer.name}`);

  const sPathItems = sLayer.pathItems;
  for (var i = 0; i < sPathItems.length; i++) {
    const sPi = sPathItems[i];

    const pathItemRect = pathItemRectangle(sPi);
    // the path item is missing
    log.push({ type: "searcing", shape: sPi.name, pathItemRect, artRectangle });
    const sArtboardIdx = findIntersections(pathItemRect, artRectangle);

    log.push(`found ${sArtboardIdx}`);

    if (sArtboardIdx !== null) {
      const sArtboard = artboards[sArtboardIdx];
      const dArtboardName = artMapping[sArtboard.name];
      const dArtboard = artMap[dArtboardName];

      log.push(`would duplicate ${sPi.name} in artboard:${dArtboard.name}`);
      const dPi = sPi.duplicate(dLayer, ElementPlacement.INSIDE);

      dPi.selected = false;
      dPi.locked = true;

      movePathItem(dPi, sArtboard, dArtboard);
    } else {
      log.push({ type: "board not found", shape: sPi.name });
    }
  }
  return log;
};

function movePathItem(pi: PageItem, source: Artboard, dest: Artboard) {
  // mirror vertically
  pi.resize(-100, 100);

  const deltax = pi.position[0] - source.artboardRect[0];
  const deltay = pi.position[1] - source.artboardRect[1];

  $.writeln(`delta ${deltax},${deltay}`);

  const artbx = dest.artboardRect[2] - deltax - pi.width;
  const artby = dest.artboardRect[1] + deltay;

  pi.position = [artbx, artby];
  // pi.left = artbx;
  // pi.top = artby;
}

function getByNameSafe(collection: any, name: string) {
  for (var i = 0; i < collection.length; i++) {
    if (collection[i].name === name) {
      return collection[i];
    }
  }
  return null;
}

function artboardRectangle(artboard: Artboard): Rectangle {
  const artRect = artboard.artboardRect;
  return {
    x: artRect[0],
    y: artRect[1],
    width: Math.abs(artRect[0] - artRect[2]),
    height: Math.abs(artRect[1] - artRect[3]),
  };
}

function pathItemRectangle(pi: PathItem): Rectangle {
  const pos = pi.position;
  return {
    x: pos[0],
    y: pos[1],
    width: pi.width,
    height: pi.height,
  };
}

export const appSerialize = () => {
  const doc = app.activeDocument;

  return {
    layers: mapp(doc.layers, dumpLayer),
    layersRect: mapp(doc.artboards, artboardRectangle),
    artboards: mapp(doc.artboards, dumpArtboard),
  };
};

function dumpLayer(layer: Layer) {
  return {
    name: layer.name,
    visible: layer.visible,
    pathItems: mapp(layer.pathItems, dumpPathItem),
  };
}

function dumpPathItem(pi: PathItem) {
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
    pathPoints: mapp(pi.pathPoints, dumpPathPoint),
  };
}

function dumpPathPoint(pp: PathPoint) {
  return {
    anchor: pp.anchor,
    leftDirection: pp.leftDirection,
    pointType: pp.pointType,
    rightDirection: pp.rightDirection,
    typename: pp.typename,
  };
}

function dumpArtboard(ab: Artboard) {
  return {
    name: ab.name,
    artboardRect: ab.artboardRect,
    rulerOrigin: ab.rulerOrigin,
    rulerPAR: ab.rulerPAR,
    typename: ab.typename,
  };
}

export const helloWorld = () => {
  alert("Hello from Illustrator");
};
