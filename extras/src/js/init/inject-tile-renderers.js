const { getTileTypeId } = require('../lib/config-helpers');
const RandomTextureTileRenderer = require('../tile-renderers/random-texture-tile-renderer');

function injectTileRenderers(config, mapView) {
  const waterTileId = getTileTypeId(config, 'water');

  mapView.addTileTypeRenderer(waterTileId, new RandomTextureTileRenderer(mapView, 'water', 'water', 8));
}

module.exports = injectTileRenderers;
