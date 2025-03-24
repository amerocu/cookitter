import { addInSet, getFromSet, mapp } from "./utils";

describe("utils", () => {
  describe("addInSet", () => {
    test("add on null", () => {
      expect(addInSet(["hello"], 1, null)).toEqual({
        hello: 1,
      });
    });
    test("add to {}", () => {
      expect(addInSet(["hello"], 1, {})).toEqual({
        hello: 1,
      });
    });
    test("add deep to {}", () => {
      expect(addInSet(["hello", "world"], 1, {})).toEqual({
        hello: { world: 1 },
      });
    });
    test("add deep to non empty", () => {
      expect(addInSet(["hello", "world"], 1, { hello: { human: 2 } })).toEqual({
        hello: { world: 1, human: 2 },
      });
    });
  });
  describe("getFromSet", () => {
    test("get from null", () => {
      expect(getFromSet(["hello"], null)).toEqual(null);
    });
    test("get from set", () => {
      expect(getFromSet(["hello"], { hello: 1 })).toEqual(1);
    });
    test("miss from set", () => {
      expect(getFromSet(["world"], { hello: 1 })).toEqual(null);
    });
  });
  describe("mapp", () => {
    test("maps number list", () => {
      expect(mapp([1, 2, 3], (x: number) => x + 1)).toEqual([2, 3, 4]);
    });
  });
});
