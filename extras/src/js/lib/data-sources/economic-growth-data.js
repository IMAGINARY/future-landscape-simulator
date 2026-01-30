const Array2D = require('../data/array-2d');
const DataSource = require('./data-source');
const { getTilePropertyValue } = require('../data/fls-tile-property-helpers');

class EconomicGrowthData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;

    this.productivityMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
    this.productivity = [];
    this.productivityTotal = 0;
    this.productiveCapacityMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
    this.productiveCapacity = [];
    this.productiveCapacityTotal = 0;
    this.averageActualProductivity = 0;
    this.economicGrowthIndex = 0;

    this.economicGrowthThresholds = this.config.goals?.['economic-growth']?.['index-thresholds'] || {};
    // Order of evaluation for the index thresholds (highest to lowest)
    this.economicGrowthThresholdOrder = Object.keys(this.economicGrowthThresholds)
      .map(Number)
      .sort((a, b) => b - a);
  }

  getVariables() {
    return {
      'productivity-map': () => this.productivityMap,
      'productivity': () => this.productivity,
      'productivity-total': () => this.productivityTotal,
      'productive-capacity-map': () => this.productiveCapacityMap,
      'productive-capacity': () => this.productiveCapacity,
      'productive-capacity-total': () => this.productiveCapacityTotal,
      'productivity-actual-avg': () => this.averageActualProductivity,
      'economic-growth-index': () => this.economicGrowthIndex,
    };
  }

  getTileProductivity(v, x, y) {
    return getTilePropertyValue(this.config, this.getDataManager(), 'productivity', v, x, y);
  }

  calculate() {
    // Productivity
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      this.productivityMap[y][x] = this.getTileProductivity(v, x, y);
    });
    this.productivity = Array2D.flatten(this.productivityMap);
    this.productivityTotal = this.productivity.reduce((a, b) => a + b, 0);

    // Productive capacity
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      this.productiveCapacityMap[y][x] = this.config.tileTypes?.[v]?.productiveCapacity || 0;
    });
    this.productiveCapacity = Array2D.flatten(this.productiveCapacityMap);
    this.productiveCapacityTotal = this.productiveCapacity.reduce((a, b) => a + b, 0);

    // Actual productivity
    const actualProductivity = Math.min(this.productivityTotal, this.productiveCapacityTotal);
    this.averageActualProductivity = actualProductivity / this.productivity.length;

    // Index
    // Find what threshold the average actual productivity meets
    this.economicGrowthIndex = 1; // Default to 1 if no thresholds are met
    for (const idx of this.economicGrowthThresholdOrder) {
      if (this.averageActualProductivity > this.economicGrowthThresholds[idx]) {
        this.economicGrowthIndex = idx;
        break;
      }
    }
  }

  getGoals() {
    return [
      {
        id: 'enough-workers',
        categoory: 'economic-growth',
        priority: 1,
        condition: this.productiveCapacityTotal >= this.productivityTotal,
        progress: this.goalProgress(this.productiveCapacityTotal, this.productivityTotal)
      },
      {
        id: 'high-productivity',
        categoory: 'economic-growth',
        priority: 2,
        condition: this.economicGrowthIndex >= 5,
        progress: this.goalProgress(this.economicGrowthIndex, 5)
      }
    ];
  }
}

module.exports = EconomicGrowthData;
