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
  // X1+W1<X2 or
  // X2+W2<X1 or
  // Y1+H1<Y2 or
  // Y2+H2<Y1
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
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
