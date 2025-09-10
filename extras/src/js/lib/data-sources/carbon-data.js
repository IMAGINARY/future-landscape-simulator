const Array2D = require('../data/array-2d');
const { getTileTypeId } = require('../data/config-helpers');
const DataSource = require('./data-source');

class CarbonData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;
    this.avgCarbon = 0;
    this.carbonMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
    this.carbon = [];
    this.carbonIndex = 0;
    this.solarFarmCount = 0;
    this.forestCount = 0;
    this.solarFarmTileId = getTileTypeId(this.config, 'solar-farm');
    this.forestTileId = getTileTypeId(this.config, 'forest');
    this.indexThresholds = this.config.goals?.carbon?.['index-thresholds'] || {};
    // Order of evaluation for the index thresholds (highest to lowest)
    this.indexThresholdOrder = Object.keys(this.indexThresholds)
      .map(Number)
      .sort((a, b) => b - a);
  }

  getVariables() {
    return {
      'carbon-map': () => this.carbonMap,
      'carbon': () => this.carbon,
      'carbon-avg': () => this.avgCarbon,
      'carbon-index': () => this.getCarbonIndex(),
    }
  }

  calculate() {
    this.solarFarmCount = 0;
    this.forestCount = 0;
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      this.carbonMap[y][x] = this.config.tileTypes?.[v]?.carbon || 0;
      if (v === this.solarFarmTileId) {
        this.solarFarmCount += 1;
      }
      if (v === this.forestTileId) {
        this.forestCount += 1;
      }
    });
    this.carbon = Array2D.flatten(this.carbonMap);
    this.avgCarbon = this.carbon.reduce((a, b) => a + b, 0) / this.carbon.length;
    this.carbonIndex = this.calculateCarbonIndex();
  }

  calculateCarbonIndex() {
    for (const idx of this.indexThresholdOrder) {
      if (this.avgCarbon < this.indexThresholds[idx]) {
        return idx;
      }
    }
    // If avgCarbon is not less than any threshold, return 1
    return 1;
  }

  getCarbonIndex() {
    return this.carbonIndex;
  }

  getGoals() {
    const totalCells = this.city.map.width * this.city.map.height;
    const solarFarmPct = (this.solarFarmCount / totalCells) * 100;
    const solarFarmGoalPct = this.config?.goals?.carbon?.['enough-solar-farms-percentage'] || 0;
    const forestPct = (this.forestCount / totalCells) * 100;
    const forestGoalPct = this.config?.goals?.carbon?.['enough-forests-percentage'] || 0;
    return [
      {
        id: 'enough-solar-farms',
        category: 'carbon',
        priority: 1,
        condition: solarFarmPct < solarFarmGoalPct,
        progress: this.goalProgress(solarFarmPct, solarFarmGoalPct),
      },
      {
        id: 'enough-forests',
        category: 'carbon',
        priority: 2,
        condition: forestPct < forestGoalPct,
        progress: this.goalProgress(forestPct, forestGoalPct),
      },
      {
        id: 'reduce-emissions',
        category: 'carbon',
        priority: 3,
        condition: this.carbonIndex < 5,
        progress: this.goalProgress(this.carbonIndex, 5),
      }
    ]
  }
}

module.exports = CarbonData;
