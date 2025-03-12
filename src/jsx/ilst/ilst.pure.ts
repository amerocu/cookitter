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
