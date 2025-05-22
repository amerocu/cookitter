import { addInSet, getFromSet, mapp, objectLength } from "./utils";
import { findIntersections, Rectangle } from "./rectangle";
import {
  ArtboardsMapping,
  getLeftMostSide,
  getRightMostSide,
  matchArtboard,
  oppositeSide,
  isLeftFacingSide,
  AtrboardName,
} from "./artboard.utils";
import { artboardRectangle, pathItemRectangle } from "./rectangle.ilst";
import Logger from "./logger";
export * from "./serialize";

var l = Logger({ name: "main", alsoDebug: true, enable: true });

const mLayerName = "cookitter";
const sLayerName = "cookie";
const dLayerName = "cutter";
const pLayerName = "portals";
const cookitterTagNamePortalType = "cookitter_portal_type";

const cookitterTagNameId = "cookitter_id";
const cookitterTagNameHash = "cookitter_hash";
const cookitterTagNameOrigin = "cookitter_origin"; // user|cookie

const cookitterTagNameOriginUser = "user";
const cookitterTagNameOriginCookitter = "cookie";

export const appReset = () => {
  l.i("appReset...");
  if (app.documents.length === 0) {
    l.e("No document open.");
    return;
  }
  const doc: Document | null = app.activeDocument;

  if (!doc) {
    l.e("No document avaiable");
    return;
  }

  var sLayer: Layer | null = getByNameSafe(doc.layers, sLayerName);

  if (!sLayer) {
    l.e("No layer: " + sLayerName);
  } else {
    const sPathItems = sLayer.pathItems;
    l.i(`deleting source elements tags...`);
    for (var i = 0; i < sPathItems.length; i++) {
      l.i(`deleting tags ${sPathItems[i].name}`);
      // NOTE this does not work!!
      // sPathItems[i].tags.removeAll();
      const tags = sPathItems[i].tags;
      while (tags.length > 0) {
        tags[0].remove();
      }
    }
  }

  var dLayer: Layer | null = getByNameSafe(doc.layers, dLayerName);

  if (!dLayer) {
    l.e("No layer: " + dLayerName);
  } else {
    // Delete all items in the layer
    l.i(`deleting destination elements...`);
    while (dLayer.pageItems.length > 0) {
      dLayer.pageItems[0].remove();
    }
  }

  var pLayer: Layer | null = getByNameSafe(doc.layers, pLayerName);

  if (!pLayer) {
    l.e("No layer: " + pLayerName);
  } else {
    // Delete all items in the layer
    l.i(`deleting portals elements...`);
    while (pLayer.pageItems.length > 0) {
      pLayer.pageItems[0].remove();
    }
  }
};

export const newReset = () => {
  l.i("appReset...");
  if (app.documents.length === 0) {
    l.e("No document open.");
    return;
  }
  const doc: Document | null = app.activeDocument;

  if (!doc) {
    l.e("No document avaiable");
    return;
  }

  var mLayer: Layer | null = getByNameSafe(doc.layers, mLayerName);

  if (!mLayer) {
    l.e("No layer: " + mLayer);
  } else {
    resetPageItems(mLayer);
  }
};

// ResetPageItems accepts an Ai object that has a list of items `pageItems`, a Layer or a GroupItem.
// It traverses then
// - GroupItem
// Deletes all
// - PathItem
// - PlacedItems
// that have been generated, and removes tags to all user items.
function resetPageItems(obj: any) {
  var i = 0;
  l.i(`resetting object: ${obj.name} ${obj.typename}`);
  while (obj.pageItems.length > i) {
    const pageItem = obj.pageItems[i];
    const origin = getTagValue(pageItem, cookitterTagNameOrigin);
    const objType = pageItem.typename;

    l.i(`resetting item: ${objType} ${origin}`);

    if (objType == "GroupItem") {
      if (origin == "cookie") {
        resetPageItems(pageItem);
        if (obj.pageItems.length == 0) {
          obj.pageItems[i].remove();
        } else {
          i++;
        }
      } else {
      }
    } else if (objType == "PathItem" || objType == "PlacedItem") {
      if (origin == "cookie") {
        obj.pageItems[i].remove();
      } else {
        resetItemTags(pageItem);
        i++;
      }
    } else {
      l.w(`unsupported item type: ${objType}`);
      i++;
    }
  }
}

function resetItemTags(obj: any) {
  const tags = obj.tags;
  while (tags.length > 0) {
    tags[0].remove();
  }
}

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

export function newRender() {
  l.i("appRender...");

  if (app.documents.length === 0) {
    l.e("No document open.");
    return;
  }

  const doc: Document | null = app.activeDocument;

  if (!doc) {
    l.e("No document avaiable");
    return;
  }

  var mLayer: Layer | null = getByNameSafe(doc.layers, mLayerName);

  if (!mLayer) {
    l.e("No layer: " + mLayerName);
    return;
  }

  const artBag = mkArtboardsBag(doc);
  l.i(`artboards bag mapping: ` + JSON.stringify(artBag.artMapping));

  const mPageItems = mLayer.pageItems;

  // looping through a temp list becasue doRender can change
  // the list of elements.
  var tmp: PageItem[] = [];
  for (var i = 0; i < mPageItems.length; i++) {
    tmp.push(mPageItems[i]);
  }
  for (var i = 0; i < tmp.length; i++) {
    const sPi = tmp[i];
    doRender(sPi, artBag);
  }
}

// doRender does the rendering on any object on this class
// - GroupItem
// - PathItem
// - PlacedItems
// this method can delete the given object, so watch out!!
function doRender(obj: any, artBag: ArtboardsBag) {
  const objType = obj.typename;
  const origin = getTagValue(obj, cookitterTagNameOrigin);

  switch (objType) {
    case "GroupItem":
      switch (origin) {
        case "cookie":
          // if it's a cookie group it should contain:
          // - PathItem
          // - Portal
          // - the group should be a clipping group.
          doRenderGroupItem(obj, artBag);
          break;
        case null:
          // this should be a user group!
          setTagValue(obj, cookitterTagNameOrigin, cookitterTagNameOriginUser);
          l.i(`tagging object origin to: user`);
        // | follow bellow...
        case "user":
          // user group is just visited recursively
          doRender(obj, artBag);
          break;
        default:
          l.e(`Sorry, unhandled origin: ${objType}`);
      }
      break;
    case "PathItem":
      switch (origin) {
        case "cookie":
          // the path item should have been in a group so why is it here?
          // let's delete it.
          obj.remove();
          break;
        case null:
          // this is a new item, should be tagged, moved in a group, and rendered.
          setTagValue(obj, cookitterTagNameOrigin, cookitterTagNameOriginUser);
          break;
        case "user":
          // the path item should have been in a cookitter group so why is it here?
          // let's move it in a group and render the group.

          const group = makeCookitterGroup(obj);
          doRender(group, artBag);
          break;
        default:
          l.e(`Sorry, unhandled origin: ${objType}`);
      }
      break;
    case "PlacedItem":
      // we should never find PlacedItems outside their group, why is it here?
      // let's delete it.
      obj.remove();
      break;
    default:
      l.e(`Sorry, unhandled typename: ${objType}`);
  }
}

function makeCookitterGroup(obj: any): Group {
  const group = obj.parent.groupItems.add();

  setTagValue(group, cookitterTagNameOrigin, cookitterTagNameOriginCookitter);
  group.clipped = true;
  group.name = "CookitterClipGroup";
  obj.parent = group;

  return group;
}

function makeCookitterGroupUser(obj: any) {
  setTagValue(obj, cookitterTagNameOrigin, cookitterTagNameOriginUser);
  if (obj.name == "CookitterClipGroup") {
    obj.name = "UserGroup";
  }

  // delete al cookitter PlacedItems if present.
  var i = 0;
  while (obj.placedItems.length > i) {
    const pi = obj.placedItems[i];
    if (
      getTagValue(pi, cookitterTagNameOrigin) == cookitterTagNameOriginCookitter
    ) {
      pi.remove();
    } else {
      i++;
    }
  }
}

// doRenderGroupItem does the rendering inside a cookitter group
function doRenderGroupItem(obj: any, artBag: ArtboardsBag) {
  switch (obj.pathItems.length) {
    case 0:
      // an empty cookitter group does not make sense..
      // if it's completely empyt let's delete it otherwise it's a user group.
      if (obj.pageItems.length == 0) {
      } else {
        obj.remove();
      }
    case 1:
    // 1 is the perfect number of path items.
    // TODO
    default:
      // we have more than 1 path items, no good..
      // every path item should be in his own cookitter group.
      // let's move every path item in a new group an tag this one as a user group.

      // looping through a temp list because the list will change
      var tmp: PageItem[] = [];
      for (var i = 0; i < obj.pathItems.length; i++) {
        tmp.push(obj.pathItems[i]);
      }
      for (var i = 0; i < tmp.length; i++) {
        const pi = tmp[i];
        const group = makeCookitterGroup(pi);
        doRenderGroupItem(group, artBag);
      }
      makeCookitterGroupUser(obj);
  }
}

type ElementStore = {
  source: PathItem;
  destination: PathItem | null;
  sourcePortal: PlacedItem | null;
  destinationPortal: PlacedItem | null;
};

function mkElementStore(sPi: PathItem): ElementStore {
  return {
    source: sPi,
    destination: null,
    sourcePortal: null,
    destinationPortal: null,
  };
}

type ElementID = string;

type Store = Record<ElementID, ElementStore>;

// Serialize Store functions
function ss(store: Store) {
  var s: Record<
    string,
    {
      source: string;
      destination: string | null;
      sourcePortal: string | null;
      destinationPortal: string | null;
    }
  > = {};

  for (const key in store) {
    const val = store[key];
    s[key] = {
      source: val.source?.name,
      destination: val.destination?.name ?? null,
      sourcePortal: val.sourcePortal?.name ?? null,
      destinationPortal: val.destinationPortal?.name ?? null,
    };
  }
  return JSON.stringify(s);
}

export function appRender(settings: { doPortals: boolean }) {
  l.i("appRender...");

  if (app.documents.length === 0) {
    l.e("No document open.");
    return;
  }

  const doc: Document | null = app.activeDocument;

  if (!doc) {
    l.e("No document avaiable");
    return;
  }

  const sLayer: Layer | null = getByNameSafe(doc.layers, sLayerName);

  if (!sLayer) {
    l.e("No layer: " + sLayerName);
    return;
  }
  l.i(`found layer ${sLayer.name}`);
  const sPathItems = sLayer.pathItems;

  const dLayer: Layer | null = getByNameSafe(doc.layers, dLayerName);
  if (!dLayer) {
    l.e("No layer: " + dLayerName);
    return;
  }
  l.i(`found layer ${dLayer.name}`);
  const dPathItems = dLayer.pathItems;

  const artBag = mkArtboardsBag(doc);

  l.i(`artboards bag mapping: ` + JSON.stringify(artBag.artMapping));

  // Items store for quick lookups
  var store: Store = {};

  // Loops on source items
  l.i(`L1: loops on source items`);
  for (var i = 0; i < sPathItems.length; i++) {
    const sPi = sPathItems[i];

    l.i(`L1: found item ${sPi.name}`);
    const tag: Tag | null = getByNameSafe(sPi.tags, cookitterTagNameId);
    if (tag) {
      l.i(`L1: found tag ${tag?.name}:${tag?.value}`);
      const key = tag.value;
      const es = store[key];

      l.i(`L1: found ${key}:${es}`);
      if (es) {
        // two source elements have the same id
        // probably the second is a copy of the first
        // let's give this element a new id, and add it to the store
        const newId = generateID(store);
        l.i(`L1: new id ${newId}`);
        tag.value = newId;
        store[newId] = mkElementStore(sPi);
      } else {
        // first time we find this tagged element
        // let's add it to the store
        l.i(`L1: adding source item`);
        store[tag.value] = mkElementStore(sPi);
      }
    } else {
      l.i(`L1: tag not found`);
      // original element without an id
      // let's give this element a new id, and add it to the store
      const newTag = sPi.tags.add();
      newTag.name = cookitterTagNameId;
      const newId = generateID(store);
      newTag.value = newId;
      store[newId] = mkElementStore(sPi);
    }
  }

  l.i("L1 store:");
  l.i(ss(store));

  // Loops on destination items
  // We need a temporary copy of the destination elements because
  // we are removing ad adding elements while loooping.

  l.i(`L2: loops on destination items :${dPathItems.length}`);
  var tmp: PathItem[] = [];
  for (var i = 0; i < dPathItems.length; i++) {
    tmp.push(dPathItems[i]);
  }
  for (var i = 0; i < tmp.length; i++) {
    const dPi = tmp[i];

    l.i(`L2: found item ${dPi.name}`);
    const tag: Tag = getByNameSafe(dPi.tags, cookitterTagNameId);
    if (tag) {
      l.i(`L2: found tag ${tag?.name}:${tag?.value}`);
      const key = tag.value;

      const es = store[key];

      if (es) {
        if (es?.destination) {
          // we have already found another destination element with this id
          // this is a duplicate.
          l.i(`L2: remove destination item: ${dPi.name}`);
          dPi.remove();
        } else {
          l.i(`L2: found source item with same id`);
          // a source item with the same id of a destination one
          // we should pair them
          es.destination = dPi;

          l.i(`L2: syncing items: ${key}`);
          syncItems(artBag, dLayer, es);
        }
      } else {
        // the destinaiton element has an id, but we did not have a source
        // element, the source element has probably being deleted.
        l.i(`L2: remove destination item: ${dPi.name}`);
        dPi.remove();
      }
    } else {
      // destination element without an id
      // this is maybe an user element? deleting it is not
      // polite but what else could we do?
      l.e(`L2: remove destination item: ${dPi.name}`);
      dPi.remove();
    }
  }

  l.i("L2 store:");
  l.i(ss(store));

  // loop over source elements without a destination
  l.i(`L3: loops on source items without a destination`);
  for (var elem in store) {
    if (!store[elem].destination) {
      syncItems(artBag, dLayer, store[elem]);
    }
  }

  l.i("L3 store:");
  l.i(ss(store));

  if (!doc.imageCapture) {
    // TODO make portals not usable is imageCapture is not supported...
    alert("imageCapture() is not supported in this version of Illustrator.");
    return;
  }

  if (settings.doPortals) {
    const pLayer: Layer | null = getByNameSafe(doc.layers, pLayerName);
    if (!pLayer) {
      l.e("No layer: " + pLayerName);
      return;
    }
    l.i(`found layer ${pLayer.name}`);

    var pPlacedItems = pLayer.placedItems;
    var tmp2: PlacedItem[] = [];
    for (var i = 0; i < pPlacedItems.length; i++) {
      tmp2.push(pPlacedItems[i]);
    }
    l.i(`L4: loops on portals items :${dPathItems.length}`);
    for (var i = 0; i < tmp2.length; i++) {
      const pPi = tmp2[i];

      l.i(`L4: found item ${pPi.name}`);
      const tag: Tag = getByNameSafe(pPi.tags, cookitterTagNameId);
      if (tag) {
        l.i(`L2: found tag ${tag?.name}:${tag?.value}`);
        const key = tag.value;

        const es = store[key];
        if (es) {
          // let's find out which type of porta is this one

          const tag: Tag = getByNameSafe(pPi.tags, cookitterTagNamePortalType);
          if (tag) {
            const portalType = tag.value;

            if (portalType == "source") {
              es.sourcePortal = pPi;
            } else if (portalType == "destination") {
              es.destinationPortal = pPi;
            } else {
              l.i(
                `L2: portal with invalid portal type: ${pPi.name} ${portalType}`
              );
              pPi.remove();
            }
          } else {
            // this portal does not have a portal tag type.
            l.i(`L2: portal without a tag portal type: ${pPi.name}`);
            pPi.remove();
          }
        } else {
          // the destinaiton element has an id, but we did not have a source
          // element, the source element has probably being deleted.
          l.i(`L2: remove portal item: ${pPi.name}`);
          pPi.remove();
        }
      } else {
        // this is quite odd, all portals shoudl have an id.
        l.e(`L4: portal without an tag id: ${pPi.name}`);
        pPi.remove();
      }
    }

    l.i("L4 store:");
    l.i(ss(store));

    l.i(`loops on store items: ${objectLength(store)}`);
    for (var elem in store) {
      const sPi = store[elem].source;
      const sPPi = store[elem].sourcePortal;
      updatePortal(artBag, pLayer, sPi, sPPi, "source");

      const dPi = store[elem].destination;
      const dPPi = store[elem].destinationPortal;
      if (dPi) {
        updatePortal(artBag, pLayer, dPi, dPPi, "destination");
      }
    }
  }
  app.redraw();
}

const updatePortal = (
  artBag: ArtboardsBag,
  pLayer: Layer,
  sPi: PathItem,
  dPi: PlacedItem | null,
  portalType: string
) => {
  l.i(`doing: ${sPi.name}`);
  const pathItemRect = pathItemRectangle(sPi);
  const sArtboardIdx = findIntersections(pathItemRect, artBag.artRectangle);

  if (sArtboardIdx !== null) {
    const sArtboard = artBag.artboards[sArtboardIdx];

    l.i(`found in artboard: ${sArtboard.name}`);
    const lIF = matchArtboard(sArtboard.name);
    if (lIF) {
      var dArtboardInfo;
      if (isLeftFacingSide(lIF.side)) {
        const pageNum = (Number(lIF.page) + 1).toString();
        dArtboardInfo = getLeftMostSide(artBag.artMapping, pageNum);
      } else {
        const pageNum = (Number(lIF.page) - 1).toString();
        dArtboardInfo = getRightMostSide(artBag.artMapping, pageNum);
      }

      if (dArtboardInfo) {
        const [dGroup, dSide, dArtboardIdx] = dArtboardInfo;
        const cArtboard: Artboard = artBag.artboards[Number(dArtboardIdx)];

        l.i(`capture artboard: ${cArtboard.name}`);
        const tag: Tag | null = getByNameSafe(sPi.tags, cookitterTagNameId);
        if (tag) {
          const id = tag.value;
          const side = lIF.side;

          const doc = app.activeDocument;

          const portalsFolderPath = `${Folder.myDocuments}/cookitter/portals`;

          const portalsFolder = new Folder(portalsFolderPath);
          if (!portalsFolder.exists) {
            portalsFolder.create();
          }

          const portalFilePath = `${portalsFolder}/${id}-${side}.png`;
          l.i(`crating portal file ${portalFilePath}`);
          const tempFile = new File(portalFilePath);

          // Capture the selected portion as an image
          const options = new ImageCaptureOptions();
          // The object is only used to set these values an pass it to imageCapture
          // so it seems that types are wrong here.
          // @ts-ignore
          options.resolution = 150; // Adjust resolution as needed
          // @ts-ignore
          options.antiAliasing = true;
          // @ts-ignore
          options.transparency = false;

          // Find the capture rectangle
          const deltaLeft = sPi.left - sArtboard.artboardRect[0];
          const deltaTop = sPi.top - sArtboard.artboardRect[1];

          const targetLeft = cArtboard.artboardRect[0] + deltaLeft;
          const targetTop = cArtboard.artboardRect[1] + deltaTop;

          const targetRect: [number, number, number, number] = [
            targetLeft,
            targetTop,
            targetLeft + sPi.width,
            targetTop - sPi.height,
          ];
          doc.imageCapture(tempFile, targetRect, options);

          if (!tempFile.exists) {
            l.e(`Failed to capture image for item: ${id}`);
            return;
          }

          l.i(
            `making portal of ${sPi.name} from artboard ${sArtboard.name} to ${cArtboard.name}`
          );
          var placedItem = dPi;
          if (!placedItem) {
            l.i("creating a new portal with id: " + id);
            placedItem = pLayer.placedItems.add();
            placedItem.file = tempFile;
            $.sleep(100);
            placedItem.name = id;
            placedItem.position = sPi.position;
            placedItem.width = sPi.width;
            placedItem.height = sPi.height;

            const newTagId = placedItem.tags.add();
            newTagId.name = cookitterTagNameId;
            newTagId.value = id;

            const newTagType = placedItem.tags.add();
            newTagType.name = cookitterTagNamePortalType;
            newTagType.value = portalType;

            placedItem.selected = false;
            placedItem.locked = true;
          } else {
            l.i(`updating portal file ${portalFilePath}`);
            placedItem.file = tempFile;
            placedItem.name = id;
            placedItem.position = sPi.position;
            placedItem.width = sPi.width;
            placedItem.height = sPi.height;

            const newTagId = placedItem.tags.add();
            newTagId.name = cookitterTagNameId;
            newTagId.value = id;

            const newTagType = placedItem.tags.add();
            newTagType.name = cookitterTagNamePortalType;
            newTagType.value = portalType;

            placedItem.selected = false;
            placedItem.locked = true;
          }
        } else {
          l.e(`trying to portal an item without a tag`);
        }
      } else {
        l.i(`no destination artboard`);
      }
    } else {
      l.i(`invalid artboard name: ${sArtboard.name} }`);
    }
  }
};

type ArtboardsBag = {
  artboards: Artboard[];
  artMap: Record<string, Artboard>;
  artRectangle: Rectangle[];
  artMapping: ArtboardsMapping;
};

function mkArtboardsBag(doc: Document): ArtboardsBag {
  var artboards: Artboard[] = [];
  var artMap: Record<string, Artboard> = {};
  var artRectangle: Rectangle[] = [];
  var artMapping: ArtboardsMapping = {};

  for (var i = 0; i < doc.artboards.length; i++) {
    const artboard = doc.artboards[i];
    const lIF = matchArtboard(artboard.name);
    if (lIF) {
      artMap[artboard.name] = artboard;
      artboards.push(artboard);
      artRectangle.push(artboardRectangle(artboard));
      addInSet(
        [lIF.page.toString(), lIF.group.toString(), lIF.side.toString()],
        i.toString(),
        artMapping
      );
      l.i(`added artboard:${artboard.name}`);
    } else {
      l.i(`ignoring artboard:${artboard.name}`);
    }
  }

  return {
    artboards,
    artMap,
    artRectangle,
    artMapping,
  };
}

function syncItems(artBag: ArtboardsBag, dLayer: Layer, es: ElementStore) {
  const sPi = es.source;
  const dPi = es.destination;
  l.i(`syncing: ${sPi.name}`);

  // getting source items signature
  const tag: Tag = getByNameSafe(sPi.tags, cookitterTagNameHash);
  l.i(`tag: ${tag?.name}`);
  const itemBlob = JSON.stringify(serializePathItem(sPi));
  l.i(`item: ${itemBlob}`);
  const newSignature: string = hashString(itemBlob);
  l.i(`new signature ${newSignature}`);
  if (tag) {
    l.i(`old signature ${tag?.value}`);
    if (tag?.value == newSignature) {
      // the item has not changed
      // so we can return
      l.i(`no change`);
      return;
    } else {
      tag.value = newSignature;
      // the item has changed we
      // must recreate it
      // TODO try update only changed properties?
    }
  } else {
    l.i(`added missing signature`);
    // no signatue, let's create it
    const newTag = sPi.tags.add();
    newTag.name = cookitterTagNameHash;
    newTag.value = newSignature;
  }

  // we need to recreate the destination item
  if (dPi) {
    // TODO maybe actually reuse the path item, if just
    // the position changed?
    dPi.remove();
  }

  // create destination item
  const pathItemRect = pathItemRectangle(sPi);
  // the path item is missing
  l.i(`searcing sha: ${sPi.name} ${pathItemRect} ${artBag.artRectangle}`);

  const sArtboardIdx = findIntersections(pathItemRect, artBag.artRectangle);
  l.i(`found ${sArtboardIdx}`);

  if (sArtboardIdx !== null) {
    const sArtboard = artBag.artboards[sArtboardIdx];

    const lIF = matchArtboard(sArtboard.name);
    if (!lIF) {
      l.i(`board name invalid  artboard: ${sArtboard.name} }`);
      return;
    }

    const newSide = oppositeSide(lIF.side);

    const dArtboardIdx = getFromSet(
      [lIF.page, lIF.group, newSide],
      artBag.artMapping
    );
    const dArtboard = artBag.artboards[dArtboardIdx];
    if (!dArtboard) {
      l.i(`board name without pair: ${sArtboard.name} }`);
      return;
    }
    l.i(`would duplicate ${sPi.name} in artboard:${dArtboard.name}`);
    // ElementPlacement.INSIDE is the right value, types are wrong
    // @ts-ignore
    const newDPi = sPi.duplicate(dLayer, ElementPlacement.INSIDE);

    newDPi.selected = false;
    newDPi.locked = true;

    // mirror vertically
    newDPi.resize(-100, 100);

    const newPos = newPositionPathItem(pathItemRect, sArtboard, dArtboard);
    newDPi.position = newPos;
    // the element has all the properties it needs because it has been duplicated
    // @ts-ignore
    es.destination = newDPi;
  } else {
    l.i(`board not found, shape ${sPi.name} }`);
  }
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
    // zOrderPosition is bugged...
    // zOrderPosition: pi.zOrderPosition,
    // absoluteZOrderPosition: pi.absoluteZOrderPosition,
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

function getByNameSafe(collection: any, name: string): any | null {
  for (var i = 0; i < collection.length; i++) {
    if (collection[i].name === name) {
      return collection[i];
    }
  }
  return null;
}

function getTagValue(object: any, name: string): string | null {
  let collection = object.tags;
  for (var i = 0; i < collection.length; i++) {
    if (collection[i].name === name) {
      return collection[i].value;
    }
  }
  return null;
}

function setTagValue(object: any, name: string, value: string): Tag {
  // TODO do we need to loop and find if the tag is already set?
  const newTag = object.tags.add();
  newTag.name = name;
  newTag.value = value;
  return newTag;
}
