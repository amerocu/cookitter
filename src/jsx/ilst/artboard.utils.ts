import { objectKeys, mapp } from "./utils";

export type PageNumber = string;
export type GroupNumber = string;

// SideNumber keeps track of which side of
// the page we have, pages which are composed of multiple
// sheets have innder sides, that are only seen from other
// pages holes
//     A  B   C  D
//     |  |   |  |
//    <|  |> <|  |>
//     |  |   |  |
//     1  2   3  4
export type SideNumber = string;
export type ArtboardNumber = string;

// ArtboardsMapping is a nested attribute set that indexe
// artboards by page:group:side and return the index of the
// artboard in an Artboards[] array.
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
export type ArtboardsMapping = Record<
  PageNumber,
  Record<GroupNumber, Record<SideNumber, ArtboardNumber>>
>;

export type ArtboardName = {
  page: PageNumber;
  group: GroupNumber;
  side: SideNumber;
};

export function matchArtboard(name: string): ArtboardName | null {
  const regex = /[cC][kK]-(\d+)-([a-zA-Z])/;
  const res = regex.exec(name);

  if (res) {
    const page = parseInt(res[1]);
    const char = res[2].toUpperCase();
    const sideNum = char.charCodeAt(0) - "A".charCodeAt(0) + 1;

    const group = Math.floor((sideNum + 1) / 2);
    const side = ((sideNum - 1) % 2) + 1;

    return {
      page: page.toString(),
      group: group.toString(),
      side: side.toString(),
    };
  }
  return null;
}

export function isLeftFacingSide(side: SideNumber): boolean {
  return (Number(side) - 1) % 2 == 0;
}

export function oppositeSide(side: SideNumber): SideNumber {
  if (isLeftFacingSide(side)) {
    return (Number(side) + 1).toString();
  } else {
    return (Number(side) - 1).toString();
  }
}

export function getLeftMostSide(
  am: ArtboardsMapping,
  pn: PageNumber
): [GroupNumber, SideNumber, ArtboardNumber] | null {
  const group = am[pn];

  if (!group) {
    return null;
  }
  const gKeys = objectKeys(group);

  if (gKeys.length === 0) {
    return null; // Or undefined, or any default value you prefer
  }

  const maxGroupKey = Math.min(...mapp(gKeys, Number));

  const sides = group[maxGroupKey];

  if (!sides) {
    return null;
  }

  const sKeys = objectKeys(sides);

  if (sKeys.length === 0) {
    return null; // Or undefined, or any default value you prefer
  }

  const maxSideKey = Math.min(...mapp(sKeys, Number));

  return [maxGroupKey.toString(), maxSideKey.toString(), sides[maxSideKey]];
}

export function getRightMostSide(
  am: ArtboardsMapping,
  pn: PageNumber
): [GroupNumber, SideNumber, ArtboardNumber] | null {
  const group = am[pn];

  if (!group) {
    return null;
  }
  const gKeys = objectKeys(group);

  if (gKeys.length === 0) {
    return null; // Or undefined, or any default value you prefer
  }

  const maxGroupKey = Math.max(...mapp(gKeys, Number));

  const sides = group[maxGroupKey];

  if (!sides) {
    return null;
  }

  const sKeys = objectKeys(sides);

  if (sKeys.length === 0) {
    return null; // Or undefined, or any default value you prefer
  }

  const maxSideKey = Math.max(...mapp(sKeys, Number));

  return [maxGroupKey.toString(), maxSideKey.toString(), sides[maxSideKey]];
}
