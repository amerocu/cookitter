import { _getLayers, findIntersections } from "./ilst.pure";

// Function to test
function add(a: number, b: number): number {
  return a + b;
}

const data = {
  rectangles: [
    { x: 0, y: 0, width: 49, height: 49 },
    {
      x: 50,
      y: 0,
      width: 49,
      height: 49,
    },
    {
      x: 0,
      y: 50,
      width: 49,
      height: 49,
    },
    {
      x: 50,
      y: 50,
      width: 49,
      height: 49,
    },
  ],
  zero: {
    x: 10,
    y: 10,
    width: 5,
    height: 5,
  },
  uno: {
    x: 60,
    y: 10,
    width: 5,
    height: 5,
  },
  due: {
    x: 10,
    y: 60,
    width: 5,
    height: 5,
  },
  tre: {
    x: 60,
    y: 60,
    width: 5,
    height: 5,
  },
};

describe("list.tests.ts", () => {
  describe("findIntersections", () => {
    test("find element 0", () => {
      expect(findIntersections(data.zero, data.rectangles)).toEqual(0);
    });
    test("find element 1", () => {
      expect(findIntersections(data.uno, data.rectangles)).toEqual(1);
    });
    test("find element 2", () => {
      expect(findIntersections(data.due, data.rectangles)).toEqual(2);
    });
    test("find element 3", () => {
      expect(findIntersections(data.tre, data.rectangles)).toEqual(3);
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

    test("one layer", () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
    });
  });
});
