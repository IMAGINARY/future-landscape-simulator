const Array2D = require('../data/array-2d');
const DataSource = require('./data-source');

class QualityOfLifeData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;

    this.qualityOfLifeIndex = 0;
  }

  getVariables() {
    return {
      'quality-of-life-index': () => this.qualityOfLifeIndex,
    }
  }

  calculate() {

  }

  getGoals() {
    return [];
  }
}

module.exports = QualityOfLifeData;
