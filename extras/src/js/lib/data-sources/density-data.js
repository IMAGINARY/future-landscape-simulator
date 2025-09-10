const Array2D = require('../data/array-2d');
const DataSource = require('./data-source');
const calculateDensityMap = require('../model/calculate-density-map');

class DensityData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;

    this.densityMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
  }

  getVariables() {
    return {
      'density-map': () => this.densityMap,
    }
  }

  calculate() {
    calculateDensityMap(this.city.map.cells, this.densityMap);
  }
}

module.exports = DensityData;
