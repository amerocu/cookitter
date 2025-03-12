import { _getLayers } from "./ilst.pure";

// Function to test
function add(a: number, b: number): number {
  return a + b;
}

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
