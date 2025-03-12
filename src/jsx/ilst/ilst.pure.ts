export const _getLayers =
  ({ app }: { app: any; [key: string]: unknown }) =>
  () => {
    var doc = app.activeDocument;
    var layers = [];

    for (var i = 0; i < doc.layers.length; i++) {
      layers.push({
        name: doc.layers[i].name,
        visible: doc.layers[i].visible,
      });
    }

    return layers;
  };

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function intersects(a: Rectangle, b: Rectangle): boolean {
  const t1 = a.x + a.width < b.x,
    t2 = b.x + b.width < a.x,
    t3 = a.y - a.height > b.y,
    t4 = b.y - b.height > a.y;

  return !(t1 || t2 || t3 || t4);
}

export function findIntersections(
  target: Rectangle,
  artboards: Rectangle[]
): number | null {
  for (var i = 0; i < artboards.length; i++) {
    const artboard = artboards[i];

    if (intersects(target, artboard)) {
      return i;
    }
  }
  return null;
}
