import {
  ArtboardsMapping,
  getLeftMostSide,
  getRightMostSide,
  isLeftFacingSide,
  oppositeSide,
  matchArtboard,
} from "./artboard.utils";

const a = {
  "1": { "1": { "1": "0", "2": "1" } },
  "2": { "1": { "1": "2", "2": "3" } },
  "3": { "1": { "1": "4", "2": "5" } },
};

const fakeBag: ArtboardsMapping = {
  "1": {
    "1": {
      "1": "CK-1-A",
      "2": "CK-1-B",
    },
  },
  "2": {
    "1": {
      "1": "CK-2-A",
      "2": "CK-2-B",
    },
  },
  "3": {
    "1": {
      "1": "CK-3-A",
      "2": "CK-3-B",
    },
    "2": {
      "1": "CK-3-C",
      "2": "CK-3-D",
    },
  },
  "4": {
    "1": {
      "1": "CK-4-A",
      "2": "CK-4-B",
    },
  },
};

describe("artboard.utils", () => {
  describe("matchArtboard", () => {
    test("empty", () => {
      expect(matchArtboard("")).toEqual(null);
    });
    test("no match", () => {
      expect(matchArtboard("hello")).toEqual(null);
    });
    test("example 1", () => {
      expect(matchArtboard("CK-10-A")).toEqual({
        page: "10",
        group: "1",
        side: "1",
      });
    });
    test("example 2", () => {
      expect(matchArtboard("ck-20-b")).toEqual({
        page: "20",
        group: "1",
        side: "2",
      });
    });
    test("example 3", () => {
      expect(matchArtboard("ck-30-c")).toEqual({
        page: "30",
        group: "2",
        side: "1",
      });
    });
    test("example 4", () => {
      expect(matchArtboard("ck-40-d")).toEqual({
        page: "40",
        group: "2",
        side: "2",
      });
    });
  });

  describe("find pages", () => {
    describe("first page", () => {
      test("left most", () => {
        expect(getLeftMostSide(fakeBag, "1")).toEqual(["1", "1", "CK-1-A"]);
      });
      test("right most", () => {
        expect(getRightMostSide(fakeBag, "1")).toEqual(["1", "2", "CK-1-B"]);
      });
    });
    describe("last page", () => {
      test("left most", () => {
        expect(getLeftMostSide(fakeBag, "4")).toEqual(["1", "1", "CK-4-A"]);
      });
      test("right most", () => {
        expect(getRightMostSide(fakeBag, "4")).toEqual(["1", "2", "CK-4-B"]);
      });
    });
    describe("multi group page", () => {
      test("left most", () => {
        expect(getLeftMostSide(fakeBag, "3")).toEqual(["1", "1", "CK-3-A"]);
      });
      test("right most", () => {
        expect(getRightMostSide(fakeBag, "3")).toEqual(["2", "2", "CK-3-D"]);
      });
    });
  });

  describe("isLeftFacingSide", () => {
    test("left most", () => {
      expect(isLeftFacingSide("1")).toEqual(true);
    });
    test("left middle", () => {
      expect(isLeftFacingSide("2")).toEqual(false);
    });
    test("right middle", () => {
      expect(isLeftFacingSide("3")).toEqual(true);
    });
    test("right most", () => {
      expect(isLeftFacingSide("4")).toEqual(false);
    });
  });

  describe("oppositeSide", () => {
    test("left most", () => {
      expect(oppositeSide("1")).toEqual("2");
    });
    test("left middle", () => {
      expect(oppositeSide("2")).toEqual("1");
    });
    test("right middle", () => {
      expect(oppositeSide("3")).toEqual("4");
    });
    test("right most", () => {
      expect(oppositeSide("4")).toEqual("3");
    });
  });
});
