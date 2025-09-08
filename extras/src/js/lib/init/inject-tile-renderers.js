const { getTileTypeId } = require('../data/config-helpers');
const RandomTextureTileRenderer = require('../tile-renderers/random-texture-tile-renderer');
const OrientedTextureTileRenderer = require('../tile-renderers/oriented-texture-tile-renderer');

function injectTileRenderers(config, mapView) {
  const cropsTileId = getTileTypeId(config, 'crops');
  const forestTileId = getTileTypeId(config, 'forest');
  const wetlandsTileId = getTileTypeId(config, 'wetlands');
  const livestockTileId = getTileTypeId(config, 'livestock');
  const solarFarmTileId = getTileTypeId(config, 'solar-farm');
  const industrialTileId = getTileTypeId(config, 'industrial');
  const urbanHighTileId = getTileTypeId(config, 'urban-high');
  const urbanMidTileId = getTileTypeId(config, 'urban-mid');
  const urbanLowTileId = getTileTypeId(config, 'urban-low');
  const waterTileId = getTileTypeId(config, 'water');

  mapView.addTileTypeRenderer(cropsTileId, new OrientedTextureTileRenderer(mapView, 'landscape', 'crops'));
  mapView.addTileTypeRenderer(forestTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'forest', 4));
  mapView.addTileTypeRenderer(wetlandsTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'wetlands', 4));
  mapView.addTileTypeRenderer(livestockTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'livestock', 1, true));
  mapView.addTileTypeRenderer(solarFarmTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'solar-farm', 1, true));
  mapView.addTileTypeRenderer(industrialTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'industrial', 1, true));
  mapView.addTileTypeRenderer(urbanHighTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'urban-high', 1, true));
  mapView.addTileTypeRenderer(urbanMidTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'urban-mid', 1, true));
  mapView.addTileTypeRenderer(urbanLowTileId, new RandomTextureTileRenderer(mapView, 'landscape', 'urban-low', 1, true));
  mapView.addTileTypeRenderer(waterTileId, new RandomTextureTileRenderer(mapView, 'water', 'water', 8));
}

module.exports = injectTileRenderers;
