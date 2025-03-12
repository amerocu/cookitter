import { _getLayers, findIntersections, Rectangle } from "./ilst.pure";

const rectangles: Rectangle[] = [
  { x: 0, y: 0, width: 49, height: 49 },
  {
    x: 50,
    y: 0,
    width: 49,
    height: 49,
  },
  {
    x: 0,
    y: -50,
    width: 49,
    height: 49,
  },
  {
    x: 50,
    y: -50,
    width: 49,
    height: 49,
  },
];

const data: Record<string, Rectangle> = {
  "0": {
    x: 10,
    y: -10,
    width: 5,
    height: 5,
  },
  "1": {
    x: 60,
    y: -10,
    width: 5,
    height: 5,
  },
  "2": {
    x: 10,
    y: -60,
    width: 5,
    height: 5,
  },
  "3": {
    x: 60,
    y: -60,
    width: 5,
    height: 5,
  },
};

describe("list.tests.ts", () => {
  describe("findIntersections", () => {
    rectangles.forEach((element, idx) => {
      test("find rectangle " + idx, () => {
        expect(findIntersections(element, rectangles)).toEqual(idx);
      });
    });

    ["0", "1", "2", "3"].forEach((element: string, idx) => {
      test("find element " + idx, () => {
        expect(findIntersections(data[element], rectangles)).toEqual(idx);
      });
    });

    test("regression 1", () => {
      expect(
        findIntersections(
          {
            height: 91.8005812630472,
            width: 106.002180607973,
            x: 30.3715454719049,
            y: -461.884575266695,
          },
          [
            {
              height: 283.4645669291,
              width: 283.4645669291,
              x: 0,
              y: -301.552252431315,
            },
          ]
        )
      ).toEqual(0);
    });
  });
  describe("getLayers", () => {
    test("empty layers", () => {
      expect(
        _getLayers({
          app: {
            activeDocument: {
              layers: [],
            },
          },
        })()
      ).toEqual([]);
    });
  });
});
