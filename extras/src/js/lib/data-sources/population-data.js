const DataSource = require('./data-source');
const Array2D = require('../data/array-2d');

class PopulationData extends DataSource {
  constructor(city, config) {
    super();
    this.city = city;
    this.config = config;

    this.populationPerType = Object.fromEntries(
      Object.keys(config.tileTypes).map(cellType => [cellType, config.tileTypes[cellType].population || 0])
    );
    this.population = 0;
  }

  getVariables() {
    return {
      'population-total': () => this.population,
    }
  }

  calculate() {
    this.population = 0;
    Array2D.forEach(this.city.map.cells, (cellType) => {
      this.population += this.populationPerType[cellType] || 0;
    });
  }
}

module.exports = PopulationData;
