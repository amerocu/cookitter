import { matchLayer, addInSet, getFromSet, mapp } from "./utils";
import { findIntersections, Rectangle } from "./rectangle";
import { artboardRectangle, pathItemRectangle } from "./rectangle.ilst";

export * from "./serialize";

export const appReset = () => {
  var log: any[] = [];
  if (app.documents.length === 0) return "No document open.";

  var doc = app.activeDocument;
  const sLayerName = "taglio";
  var sLayer = doc.layers.getByName(sLayerName);

  if (sLayer) {
    const sPathItems = sLayer.pathItems;
    for (var i = 0; i < sPathItems.length; i++) {
      log.push(`deleting tags ${sPathItems[i].name}`);
      // NOTE this does not work!!
      // sPathItems[i].tags.removeAll();
      const tags = sPathItems[i].tags;
      while (tags.length > 0) {
        tags[0].remove();
      }
    }
  }

  const dLayerName = "tagliato";
  var dLayer = doc.layers.getByName(dLayerName);

  if (dLayer) {
    // Delete all items in the layer
    while (dLayer.pageItems.length > 0) {
      dLayer.pageItems[0].remove();
    }
  }

  log.push(`Deleted all elements in ${dLayerName}`);
  return log;
};

function generateID(store: Record<string, any>) {
  var timestamp = new Date().getTime(); // Get current timestamp
  var randomNum = Math.floor(Math.random() * 1e9); // Generate a random number
  var uniqueID = "id-" + timestamp.toString(16) + "-" + randomNum.toString(16);

  // checks that the id is unique in the store.
  if (store[uniqueID]) {
    alert("Cookitter: we got a clash: " + uniqueID);
    return generateID(store);
  } else {
    return uniqueID;
  }
}

type ElementStore = {
  source: PathItem;
  destination: null | PathItem;
};

type Store = Record<string, ElementStore>;

// Serialize Store functions
function ss(store: Store) {
  var s: Record<string, { source: string; destination: null | string }> = {};

  for (const key in store) {
    const val = store[key];
    s[key] = {
      source: val.source?.name,
      destination: val.destination?.name ?? null,
    };
  }
  return s;
}

const cookitterTagNameId = "cookitter_id";
const cookitterTagNameSignature = "cookitter_sign";

export const appRender = () => {
  const doc = app.activeDocument;
  var log: any[] = [];

  const sLayer = doc.layers.getByName("taglio");
  log.push(`found layer ${sLayer.name}`);
  const sPathItems = sLayer.pathItems;

  const dLayer = doc.layers.getByName("tagliato");
  log.push(`found layer ${dLayer.name}`);
  const dPathItems = dLayer.pathItems;

  const syncItems = mkSyncItems(log, doc, dLayer);

  // Items store for quick lookups
  var store: Store = {};

  // Loops on source items
  log.push(`L1: loops on source items`);
  for (var i = 0; i < sPathItems.length; i++) {
    const sPi = sPathItems[i];

    log.push(`L1: found item ${sPi.name}`);
    const tag: Tag | null = getByNameSafe(sPi.tags, cookitterTagNameId);
    if (tag) {
      log.push(`L1: found tag ${tag?.name}:${tag?.value}`);
      const key = tag.value;
      const es = store[key];

      log.push(`L1: found ${key}:${es}`);
      if (es) {
        // two source elements have the same id
        // probably the second is a copy of the first
        // let's give this element a new id, and add it to the store
        const newId = generateID(store);
        log.push(`L1: new id ${newId}`);
        tag.value = newId;
        store[newId] = {
          source: sPi,
          destination: null,
        };
      } else {
        // first time we find this tagged element
        // let's add it to the store
        log.push(`L1: adding source item`);
        store[tag.value] = {
          source: sPi,
          destination: null,
        };
      }
    } else {
      log.push(`L1: tag not found`);
      // original element without an id
      // let's give this element a new id, and add it to the store
      const newTag = sPi.tags.add();
      newTag.name = cookitterTagNameId;
      const newId = generateID(store);
      newTag.value = newId;
      store[newId] = {
        source: sPi,
        destination: null,
      };
    }
  }

  log.push("L1 store:");
  log.push({ store: ss(store) });

  // Loops on destination items
  // We need a temporary copy of the destination elements because
  // we are removing ad adding elements while loooping.

  log.push(`L2: loops on destination items`);
  if (dPathItems.length == 0) {
    log.push("L2 no destination items");
  }
  var tmp: PathItem[] = [];
  for (var i = 0; i < dPathItems.length; i++) {
    tmp.push(dPathItems[i]);
  }
  for (var i = 0; i < tmp.length; i++) {
    const dPi = tmp[i];

    log.push(`L2: found item ${dPi.name}`);
    const tag: Tag = getByNameSafe(dPi.tags, cookitterTagNameId);
    if (tag) {
      log.push(`L2: found tag ${tag?.name}:${tag?.value}`);
      const key = tag.value;

      const es = store[key];

      if (es) {
        if (es?.destination) {
          // we have already found another destination element with this id
          // this is a duplicate.
          log.push(`L2: remove destination item: ${dPi.name}`);
          dPi.remove();
        } else {
          log.push(`L2: found source item with same id`);
          // a source item with the same id of a destination one
          // we should pair them
          es.destination = dPi;
          // TODO check the diff and update?

          log.push(`L2: syncing items`);
          log.push(syncItems(es));
          log.concat();

          delete store[key];
        }
      } else {
        // the destinaiton element has an id, but we did not have a source
        // element, the source element has probably being delete.
        log.push(`L2: remove destination item: ${dPi.name}`);
        dPi.remove();
      }
    } else {
      // destination element without an id
      // this is maybe an use element, deleting it is not
      // polite but what could we do?
      log.push(`L2: remove destination item: ${dPi.name}`);
      dPi.remove();
    }
  }

  log.push("L2 store:");
  log.push({ store: ss(store) });

  // loop over source elements without a destination
  log.push(`L3: loops on source items without a destination`);
  for (var elem in store) {
    log.push(syncItems(store[elem]));
  }

  log.push("L3 store:");
  log.push({ store: ss(store) });

  return log;
};

type PageNumber = string;
type GroupNumber = string;
type SideNumber = string;

function mkSyncItems(log: any[], doc: Document, dLayer: Layer) {
  var artboards: Artboard[] = [];
  var artMap: Record<string, Artboard> = {};
  var artRectangle: Rectangle[] = [];
  var artMapping: Record<
    PageNumber,
    Record<GroupNumber, Record<SideNumber, Artboard>>
  > = {};
  // {
  //   "1": {
  //     "1": {
  //       side1: Layer:"ck-1-A",
  //       side2: Layer:"ck-1-b",
  //     },
  //   },
  //   "2": {
  //     "1": {
  //       side1: Layer:"ck-2-A",
  //       side2: Layer:"ck-2-B",
  //     },
  //   },
  // };

  for (var i = 0; i < doc.artboards.length; i++) {
    const artboard = doc.artboards[i];
    const lIF = matchLayer(artboard.name);
    if (lIF) {
      artMap[artboard.name] = artboard;
      artboards.push(artboard);
      artRectangle.push(artboardRectangle(artboard));
      addInSet(
        [lIF.page.toString(), lIF.group.toString(), lIF.side.toString()],
        artboard,
        artMapping
      );
      log.push(`added artboard:${artboard.name}`);
    } else {
      log.push(`ignoring artboard:${artboard.name}`);
    }
  }

  return (es: ElementStore) => {
    var log: any[] = [];
    const sPi = es.source;
    const dPi = es.destination;
    log.push(`syncing: ${sPi.name}`);

    // getting source items signature
    const tag: Tag = getByNameSafe(sPi.tags, cookitterTagNameSignature);
    log.push(`tag: ${tag?.name}`);
    const newSignature: string = hashString(
      JSON.stringify(serializePathItem(sPi))
    );
    log.push(`new signature ${newSignature}`);
    if (tag) {
      log.push(`old signature ${tag?.value}`);
      if (tag?.value == newSignature) {
        // the item has not changed
        // so we can return
        log.push(`no change`);
        return log;
      } else {
        tag.value = newSignature;
        // the item has changed we
        // must recreate it
        // TODO try update only changed properties?
      }
    } else {
      log.push(`added missing signature`);
      // no signatue, let's create it
      const newTag = sPi.tags.add();
      newTag.name = cookitterTagNameSignature;
      newTag.value = newSignature;
    }

    // we need to recreate the destination item
    if (dPi) {
      dPi.remove();
    }

    // create destination item
    const pathItemRect = pathItemRectangle(sPi);
    // the path item is missing
    log.push({ type: "searcing", shape: sPi.name, pathItemRect, artRectangle });

    const sArtboardIdx = findIntersections(pathItemRect, artRectangle);
    log.push(`found ${sArtboardIdx}`);

    if (sArtboardIdx !== null) {
      const sArtboard = artboards[sArtboardIdx];

      const lIF = matchLayer(sArtboard.name);
      if (!lIF) {
        log.push({ type: "board name invalid", artboard: sArtboard.name });
        return log;
      }

      const newSide = (lIF.side % 2) + 1;

      const dArtboard = getFromSet(
        [lIF.page.toString(), lIF.group.toString(), newSide.toString()],
        artMapping
      );
      if (!dArtboard) {
        log.push({ type: "board name without pair", artboard: sArtboard.name });
        return log;
      }
      log.push(`would duplicate ${sPi.name} in artboard:${dArtboard.name}`);
      const dPi = sPi.duplicate(dLayer, ElementPlacement.INSIDE);

      dPi.selected = false;
      dPi.locked = true;

      // mirror vertically
      dPi.resize(-100, 100);

      dPi.position = newPositionPathItem(pathItemRect, sArtboard, dArtboard);
    } else {
      log.push({ type: "board not found", shape: sPi.name });
    }

    return log;
  };
}

function serializePathItem(pi: PathItem) {
  return {
    // the commented properties are not considered as change
    area: pi.area,
    controlBounds: pi.controlBounds,
    // TODO fillColor:
    filled: pi.filled,
    fillOverprint: pi.fillOverprint,
    geometricBounds: pi.geometricBounds,
    guides: pi.guides,
    height: pi.height,
    lenght: pi.length,
    // locked: pi.locked,
    name: pi.name,
    note: pi.note,
    opacity: pi.opacity,
    pathPoints: mapp(pi.pathPoints, serializePathPoint),
    position: pi.position,
    resolution: pi.resolution,
    // selected: pi.selected,
    sliced: pi.sliced,
    stroke: pi.stroked
      ? {
          // TODO strokeCap
          // TODO strokeColor: pi.strokeColor,
          strokeDashes: pi.strokeDashes,
          strokeDashOffset: pi.strokeDashOffset,
          strokeJoin: pi.strokeJoin,
          strokeMiterLimit: pi.strokeMiterLimit,
          strokeOverprint: pi.strokeOverprint,
          strokeWidth: pi.strokeWidth,
        }
      : false,
    // tags:...
    top: pi.top,
    typename: pi.typename,
    width: pi.width,
    wrap: pi.wrapped
      ? {
          wrapInside: pi.wrapInside,
          wrapOffset: pi.wrapOffset,
        }
      : false,
    zOrderPosition: pi.zOrderPosition,
    // locked: pi.locked,
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

// FNV-1a Hash
function hashString(str: string): string {
  var hash = 0x811c9dc5; // 32-bit FNV offset basis
  for (var i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16); // Return as hexadecimal
}

function newPositionPathItem(
  pos: Rectangle,
  source: Artboard,
  dest: Artboard
): [number, number] {
  const deltax = pos.x - source.artboardRect[0];
  const deltay = pos.y - source.artboardRect[1];

  const artbx = dest.artboardRect[2] - deltax - pos.width;
  const artby = dest.artboardRect[1] + deltay;

  return [artbx, artby];
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
