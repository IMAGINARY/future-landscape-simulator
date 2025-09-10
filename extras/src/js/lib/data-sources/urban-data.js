const Array2D = require('../data/array-2d');
const { getTileTypeId } = require('../data/config-helpers');
const DataSource = require('./data-source');

class UrbanData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;
    this.urbanMap = Array2D.create(this.city.map.width, this.city.map.height, 0);

    this.urbanLowTileId = getTileTypeId(this.config, 'urban-low');
    this.urbanMidTileId = getTileTypeId(this.config, 'urban-mid');
    this.urbanHighTileId = getTileTypeId(this.config, 'urban-high');
  }

  getVariables() {
    return {
      'urban-map': () => this.urbanMap,
    };
  }

  calculate() {
    // The urban cells are those with an urban-* type, or those adjacent to urban-mid and
    // urban-high cells
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      if (v === this.urbanLowTileId || v === this.urbanMidTileId || v === this.urbanHighTileId) {
        this.urbanMap[y][x] = 1;
      } else {
        const adjacentUrban = this.city.map.adjacentCells(x, y)
          .some(([, , av]) => av === this.urbanMidTileId || av === this.urbanHighTileId);
        this.urbanMap[y][x] = adjacentUrban ? 1 : 0;
      }
    });
  }
}

module.exports = UrbanData;
