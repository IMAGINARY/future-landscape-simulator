const Array2D = require('../data/array-2d');
const { getTileTypeId } = require('../data/config-helpers');
const DataSource = require('./data-source');
const { getTilePropertyValue, getTileTypeModifiers } = require('../data/fls-tile-property-helpers');
const { clamp } = require('../helpers/math');
const FlsDataSourceHelper = require('../data/fls-data-source-helper');

class CarbonData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;
    this.helper = null;

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

  onRegistered(dataManager) {
    super.onRegistered(dataManager);
    this.helper = new FlsDataSourceHelper(this.config, this.getDataManager());
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
    const tagMap = this.getDataManager().tagMap;
    const cityMap = this.city.map;

    const baseTable = this.helper.getPropertyTable('carbon');
    const bonusTable = this.helper.getBonusTable('carbon-bonus');

    this.solarFarmCount = 0;
    this.forestCount = 0;
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const baseValue = baseTable[v]?.match(tagMap, x, y) || 0;
      const bonusValue = bonusTable[v]?.reduce((acc, matcher) => acc + ((matcher.match(tagMap, x, y) || 0)), 0) || 0;
      this.carbonMap[y][x] = clamp(baseValue + bonusValue, -6, 6);

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
        condition: solarFarmPct >= solarFarmGoalPct,
        progress: this.goalProgress(solarFarmPct, solarFarmGoalPct),
      },
      {
        id: 'enough-forests',
        category: 'carbon',
        priority: 2,
        condition: forestPct >= forestGoalPct,
        progress: this.goalProgress(forestPct, forestGoalPct),
      },
      {
        id: 'reduce-emissions',
        category: 'carbon',
        priority: 3,
        condition: this.carbonIndex >= 5,
        progress: this.goalProgress(this.carbonIndex, 5),
      }
    ]
  }
}

module.exports = CarbonData;
