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
const cookitterTagNameOrigin = "cookitter_origin"; // user|cookie-main|cookie-clip
// Cookitter Tag Name Origin Values
const ctno = {
  usr: "user",
  pi: "cookie",
  gmain: "cookie-group-main",
  gclip: "cookie-group-clip",
};

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

function createID() {
  var timestamp = new Date().getTime(); // Get current timestamp
  var randomNum = Math.floor(Math.random() * 1e9); // Generate a random number
  var uniqueID = "id-" + timestamp.toString(16) + "-" + randomNum.toString(16);

  return uniqueID;
}

export function appRender(settings: { doPortals: boolean }) {
  l.i("appRender2...");

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
    doRender(sPi, artBag, settings.doPortals);
  }
}

// doRender does the rendering on any object on this class
// - GroupItem
// - PathItem
// - PlacedItems
// this method can delete the given object, so watch out!!
function doRender(obj: any, artBag: ArtboardsBag, doPortals: boolean) {
  l.i("doRender...");
  const objType = obj.typename;
  const origin = getTagValue(obj, cookitterTagNameOrigin);

  switch (objType) {
    case "GroupItem":
      switch (origin) {
        case ctno.gmain:
          // if it's a cookie main group it should contain
          // clipping groups
          doRenderMainGroupItem(obj, artBag, doPortals);
          break;
        case ctno.gclip:
          // if it's a cookie clipping group and it should
          // belong to a main group, delete it...
          doDeleteClippingGroupItem(obj);
          break;
        case null:
          // user group is just visited recursively
          doRender(obj, artBag, doPortals);
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
          // the path item should have been in a cookitter group so why is it here?
          // let's move it in a group and render the group.

          const group = makeCookitterMainGroup(obj);
          doRenderMainGroupItem(group, artBag, doPortals);
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

function makeCookitterMainGroup(obj: any): Group {
  l.i("makeCookitterMainGroup...");
  const mainGroup = obj.parent.groupItems.add();
  setTagValue(mainGroup, cookitterTagNameOrigin, ctno.gmain);
  mainGroup.name = "CookitterMainGroup";

  const clipGroup = mainGroup.groupItems.add();
  setTagValue(clipGroup, cookitterTagNameOrigin, ctno.gclip);
  clipGroup.name = "CookitterClipGroup";

  // ElementPlacement.INSIDE is the right value, types are wrong
  // @ts-ignore
  obj.move(clipGroup, ElementPlacement.PLACEATBEGINNING);

  return mainGroup;
}

// we have found a cookitter group that it's in the wrong place
// if the group containg only generated items we should delete it
// but if it contains a user PathItem, we should make the maing group.
function doDeleteClippingGroupItem(obj: any) {
  removeTag(obj, cookitterTagNameOrigin);
  if (obj.name == "CookitterClipGroup") {
    obj.name = "UserGroup";
  }

  // TODO
}

type ElementGroup = {
  mainGroup: GroupItem;

  sourceGroup: GroupItem | null;
  source: PathItem | null;
  sourcePortal: PlacedItem | null;

  destinationGroup: GroupItem | null;
  destination: PathItem | null;
  destinationPortal: PlacedItem | null;
};

function mkGroupElement(obj: GroupItem): ElementGroup {
  return {
    mainGroup: obj,
    sourceGroup: null,
    source: null,
    sourcePortal: null,
    destinationGroup: null,
    destination: null,
    destinationPortal: null,
  };
}

// Serialize Element Group
function seg(val: ElementGroup) {
  var s: {
    source: string | null;
    sourcePortal: string | null;
    sourceGroup: string | null;

    destination: string | null;
    destinationPortal: string | null;
    destinationGroup: string | null;
  };

  s = {
    source: val.source?.name ?? null,
    sourcePortal: val.sourcePortal?.name ?? null,
    sourceGroup: val.sourceGroup?.name ?? null,
    destination: val.destination?.name ?? null,
    destinationPortal: val.destinationPortal?.name ?? null,
    destinationGroup: val.destinationGroup?.name ?? null,
  };

  return JSON.stringify(s);
}

// doRenderGroupItem does the rendering inside a cookitter group
function doRenderMainGroupItem(
  obj: any,
  artBag: ArtboardsBag,
  doPortals: boolean
) {
  l.i("doRenderMainGroupItem...");
  const eg: ElementGroup = mkGroupElement(obj);

  // TODO check 1 or 2 groups exists
  for (var i = 0; i < obj.groupItems.length; i++) {
    const group = obj.groupItems[i];

    const origin = getTagValue(group, cookitterTagNameOrigin);

    if (origin == ctno.gclip) {
      let type = null;

      if (group.pathItems.length == 1) {
        const pi: PathItem = group.pathItems[0];
        const piOrigin = getTagValue(pi, cookitterTagNameOrigin);

        l.i(`found piOrigin: ${piOrigin}`);
        if (!piOrigin) {
          eg.sourceGroup = group;
          eg.source = pi;
          type = "source";
        } else if (piOrigin == ctno.pi) {
          eg.destinationGroup = group;
          eg.destination = pi;
          type = "destination";
        }
      } else {
        // TODO hanle error...
        l.e("todo a");
        return 1;
      }
      l.i(`found type: ${type}`);
      if (type) {
        if (group.placedItems.length == 1) {
          const pi: PlacedItem = group.placedItems[0];

          if (type == "source") {
            eg.sourcePortal = pi;
          } else {
            // (type == "destination"
            eg.destinationPortal = pi;
          }
        } else {
          l.i("no portal found");
        }
      } else {
        // TODO hanlde error...
        l.e("todo c");
        return 1;
      }
    } else {
      // TODO error...
      l.e("todo d");
      return 1;
    }
  }

  if (!eg.source || !eg.sourceGroup) {
    // this should not happen...
    return;
  }

  l.i(seg(eg));

  // At this poing we should have a valid GroupElement object.

  syncItems(artBag, eg);
  if (doPortals) {
    updatePortals(artBag, eg);
  }
}

function updatePortals(artBag: ArtboardsBag, eg: ElementGroup) {
  if (eg.sourceGroup && eg.source) {
    updatePortal(artBag, eg.sourceGroup, eg.source, eg.sourcePortal);
  }
  if (eg.destinationGroup && eg.destination) {
    updatePortal(
      artBag,
      eg.destinationGroup,
      eg.destination,
      eg.destinationPortal
    );
  }
}

const updatePortal = (
  artBag: ArtboardsBag,
  groupItem: GroupItem,
  pathItem: PathItem,
  placedItem: PlacedItem | null
) => {
  l.i(`doing: ${pathItem.name}`);
  const pathItemRect = pathItemRectangle(pathItem);
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
        const id: string = getTagId(pathItem);

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
        const deltaLeft = pathItem.left - sArtboard.artboardRect[0];
        const deltaTop = pathItem.top - sArtboard.artboardRect[1];

        const targetLeft = cArtboard.artboardRect[0] + deltaLeft;
        const targetTop = cArtboard.artboardRect[1] + deltaTop;

        const targetRect: [number, number, number, number] = [
          targetLeft,
          targetTop,
          targetLeft + pathItem.width,
          targetTop - pathItem.height,
        ];
        doc.imageCapture(tempFile, targetRect, options);

        if (!tempFile.exists) {
          l.e(`Failed to capture image for item: ${id}`);
          return;
        }

        l.i(
          `making portal of ${pathItem.name} from artboard ${sArtboard.name} to ${cArtboard.name}`
        );
        var placedItem: PlacedItem | null = placedItem;
        if (!placedItem) {
          l.i("creating a new portal with id: " + id);
          placedItem = groupItem.placedItems.add();
          placedItem.file = tempFile;
          $.sleep(100);
          placedItem.name = id;
          placedItem.position = pathItem.position;
          placedItem.width = pathItem.width;
          placedItem.height = pathItem.height;

          setTagValue(placedItem, cookitterTagNameOrigin, ctno.pi);

          placedItem.selected = false;
          placedItem.locked = true;
        } else {
          l.i(`updating portal file ${portalFilePath}`);
          placedItem.file = tempFile;
          placedItem.name = id;
          placedItem.position = pathItem.position;
          placedItem.width = pathItem.width;
          placedItem.height = pathItem.height;

          setTagValue(placedItem, cookitterTagNameOrigin, ctno.pi);

          placedItem.selected = false;
          placedItem.locked = true;
        }

        // ElementPlacement.INSIDE is the right value, types are wrong
        // @ts-ignore
        placedItem.move(groupItem, ElementPlacement.PLACEATEND);
        groupItem.clipped = true;
        pathItem.clipping = true;
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

function syncItems(artBag: ArtboardsBag, eg: ElementGroup) {
  if (!eg.source) {
    return;
  }
  const sPi = eg.source;
  const dPi = eg.destination;
  l.i(`syncing: ${sPi.name}`);

  // getting source items signature
  const tag: Tag = getByNameSafe(sPi.tags, cookitterTagNameHash);
  l.i(`tag: ${tag?.name}`);
  const itemBlob = JSON.stringify(serializePathItem(sPi));
  // l.i(`item: ${itemBlob}`);
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

    if (!eg.destinationGroup) {
      const clipGroup = eg.mainGroup.groupItems.add();
      setTagValue(clipGroup, cookitterTagNameOrigin, ctno.gclip);
      clipGroup.name = "CookitterClipGroup";
      eg.destinationGroup = clipGroup;
    }

    // ElementPlacement.INSIDE is the right value, types are wrong
    // @ts-ignore
    const newDPi = sPi.duplicate(eg.destinationGroup, ElementPlacement.INSIDE);

    newDPi.selected = false;
    newDPi.locked = true;

    // mirror vertically
    newDPi.resize(-100, 100);

    const newPos = newPositionPathItem(pathItemRect, sArtboard, dArtboard);
    newDPi.position = newPos;
    // the element has all the properties it needs because it has been duplicated
    // @ts-ignore
    eg.destination = newDPi;
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

function getTagId(object: any): string {
  let id = getTagValue(object, cookitterTagNameId);

  if (id) {
    return id;
  } else {
    id = createID();
    const tag = object.tags.add();
    tag.name = cookitterTagNameId;
    tag.value = id;
    return id;
  }
}

function setTagValue(object: any, name: string, value: string): Tag {
  // TODO do we need to loop and find if the tag is already set?
  const newTag = object.tags.add();
  newTag.name = name;
  newTag.value = value;
  return newTag;
}

function removeTag(object: any, name: string) {
  for (var i = object.tags.length - 1; i >= 0; i--) {
    var tag = object.tags[i];
    if (tag.name === name) {
      tag.remove();
    }
  }
}
