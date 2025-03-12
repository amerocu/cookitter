import { findIntersections, Rectangle } from "./rectangle";
import { artboardRectangle, pathItemRectangle } from "./rectangle.ilst";

export * from "./serialize";

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

  // TODO delete tags

  return "Deleted all elements in " + layerName;
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
  var s = {};

  for (const key in store) {
    const val = store[key];
    s[key] = {
      source: val.source?.name,
      destination: val.destination?.name,
    };
  }
  return s;
}

const cookitterTagName = "cookitter";

export const appRender = () => {
  const doc = app.activeDocument;
  var log: any[] = [];

  log.push(`hello`);

  const sLayer = doc.layers.getByName("taglio");
  log.push(`found layer ${sLayer.name}`);
  const sPathItems = sLayer.pathItems;

  const dLayer = doc.layers.getByName("tagliato");
  log.push(`found layer ${dLayer.name}`);
  const dPathItems = dLayer.pathItems;

  const syncItems = mkSyncItems(doc, dLayer);

  // Objects store for fast lookups
  var store: Store = {};

  // Loops on source items
  for (var i = 0; i < sPathItems.length; i++) {
    const sPi = sPathItems[i];

    log.push(`L1: found item ${sPi.name}`);
    const tag: Tag | null = getByNameSafe(sPi.tags, cookitterTagName);
    log.push(`L1: found tag ${tag?.name}:${tag?.value}`);
    if (tag) {
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
      newTag.name = cookitterTagName;
      const newId = generateID(store);
      newTag.value = newId;
      store[newId] = {
        source: sPi,
        destination: null,
      };
    }
  }

  log.push("L1 store:");
  log.push(ss(store));

  // Loops on destination items
  // We need a temporary copy of the destination elements because
  // we are removing ad adding elements while loooping.
  var tmp: PathItem[] = [];
  for (var i = 0; i < dPathItems.length; i++) {
    tmp.push(dPathItems[i]);
  }
  for (var i = 0; i < tmp.length; i++) {
    const dPi = tmp[i];

    log.push(`L2: found item ${dPi.name}`);
    const tag: Tag = getByNameSafe(dPi.tags, cookitterTagName);
    log.push(`L2: found tag ${tag?.name}:${tag?.value}`);
    if (tag) {
      const key = tag.value;

      const es = store[key];

      if (es) {
        if (es?.destination) {
          // we have already found another destination element with this id
          // this is a duplicate.
          dPi.remove();
        } else {
          // a source item with the same id of a destination one
          // we should pair them
          es.destination = dPi;
          // TODO check the diff and update?

          syncItems(es);
          log.concat();

          delete store[key];
        }
      } else {
        // the destinaiton element has an id, but we did not have a source
        // element, the source element has probably being delete.
        dPi.remove();
      }
    } else {
      // destination element without an id
      // this is maybe an use element, deleting it is not
      // polite but what could we do?
      dPi.remove();
    }
  }

  log.push("L2 store:");
  log.push(ss(store));

  // loop over source elements without a destination
  for (var elem in store) {
    log.concat(syncItems(store[elem]));
  }

  log.push("L3 store:");
  log.push(ss(store));

  return log;
};

function mkSyncItems(doc: Document, dLayer: Layer) {
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

  return (es: ElementStore) => {
    var log: any[] = [];
    const sPi = es.source;
    const dPi = es.destination;
    log.push(`syncing ${sPi.name} ${dPi?.name}`);

    if (dPi) {
      dPi.remove();
    } // TODO reuse original object

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

    return log;
  };
}

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
