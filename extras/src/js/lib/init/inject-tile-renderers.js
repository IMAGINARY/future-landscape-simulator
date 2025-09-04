const { getTileTypeId } = require('../data/config-helpers');
const RandomTextureTileRenderer = require('../tile-renderers/random-texture-tile-renderer');
const OrientedTextureTileRenderer = require('../tile-renderers/oriented-texture-tile-renderer');

function injectTileRenderers(config, mapView) {
  const cropsTileId = getTileTypeId(config, 'crops');
  const forestTileId = getTileTypeId(config, 'forest');
  const wetlandsTileId = getTileTypeId(config, 'wetlands');
  const livestockTileId = getTileTypeId(config, 'livestock');
  const solarFarmTileId = getTileTypeId(config, 'solar-farm');
  const waterTileId = getTileTypeId(config, 'water');

  mapView.addTileTypeRenderer(cropsTileId, new OrientedTextureTileRenderer(mapView, 'landscape', 'crops'));
  mapView.addTileTypeRenderer(forestTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'forest', 4));
  mapView.addTileTypeRenderer(wetlandsTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'wetlands', 4));
  mapView.addTileTypeRenderer(livestockTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'livestock', 1, true));
  mapView.addTileTypeRenderer(solarFarmTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'solar-farm', 1, true));
  mapView.addTileTypeRenderer(waterTileId, new RandomTextureTileRenderer(mapView, 'water', 'water', 8));
}

module.exports = injectTileRenderers;
