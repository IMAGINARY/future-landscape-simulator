const Array2D = require('../data/array-2d');
const calculateDensityMap = require('../model/calculate-density-map');
const { getTileTypeId } = require('../data/config-helpers');

class NatureTileRenderer {
  constructor(config, mapView, bundle, prefix, textureCount = 4) {
    this.config = config;
    this.mapView = mapView;
    this.bundle = bundle;
    this.prefix = prefix;
    this.textureCount = textureCount;

    this.randomMap = Array2D.create(this.mapView.city.map.width, this.mapView.city.map.height);
    Array2D.fill(this.randomMap, () => Math.random());

    this.densityMap = Array2D.create(this.mapView.city.map.width, this.mapView.city.map.height, 0);
    this.mapView.city.events.on('update', this.updateMapTracking.bind(this));
    this.updateMapTracking();

    this.urbanAreaIds = [
      getTileTypeId(this.config, 'urban-low'),
      getTileTypeId(this.config, 'urban-mid'),
      getTileTypeId(this.config, 'urban-high'),
    ];
  }

  render(tileType, x, y) {
    const textureNumber = 1 + Math.floor(this.randomMap[y][x] * this.textureCount);
    let set;

    // If the tile is adjacent to an urban area, set=urban
    const isUrban = this.mapView.city.map.adjacentCells(x, y).some(([, , value]) => this.urbanAreaIds.includes(value));
    if (isUrban) {
      set = 'urban';
    } else {
      set = `d${Math.max(1, Math.min(3, this.densityMap[y][x]))}`;
    }

    return {
      bundle: this.bundle,
      texture: `${this.prefix}-${set}-0${textureNumber}`,
      textureAngle: 0,
    };
  }

  updateMapTracking() {
    calculateDensityMap(this.mapView.city.map.cells, this.densityMap);
  }
}

module.exports = NatureTileRenderer;
