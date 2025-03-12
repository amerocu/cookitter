import { _getLayers } from "./ilst.pure";

describe("list.tests.ts", () => {
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
