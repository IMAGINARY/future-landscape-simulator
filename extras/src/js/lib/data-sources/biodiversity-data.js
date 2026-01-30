const DataSource = require('./data-source');
const Array2D = require('../data/array-2d');
const { getTileTypeId } = require('../data/config-helpers');
const { getTilePropertyValue } = require('../data/fls-tile-property-helpers');

class BiodiversityData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;

    this.biodiversityMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
    this.biodiversity = [];
    this.biodiversityIndex = 0;
    this.highBiodiversityTileCount = 0;
    this.highBiodiversityTilePercent = 0;
    this.biodiversityRegionMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
    this.biodiversityRegionAcceptableCount = 0;
    this.biodiversityRegionAcceptablePercent = 0;
  }

  getVariables() {
    return {
      'biodiversity-map': () => this.biodiversityMap,
      'biodiversity': () => this.biodiversity,
      'biodiversity-index': () => this.biodiversityIndex,
      'biodiversity-high-count': () => this.highBiodiversityTileCount,
      'biodiversity-high-percent': () => this.highBiodiversityTilePercent,
      'biodiversity-region-map': () => this.biodiversityRegionMap,
      'biodiversity-region-acceptable-count': () => this.biodiversityRegionAcceptableCount,
      'biodiversity-region-acceptable-percent': () => this.biodiversityRegionAcceptablePercent,
    };
  }

  getTileBiodiversity(v, x, y) {
    const bonuses = this.getDataManager().getModifiers('biodiversity-bonus');
    const typeBonus = bonuses.reduce((acc, bonus) => {
      return acc + (bonus[this.config.tileTypes[v].type] || 0);
    }, 0);
    const baseBiodiversity = getTilePropertyValue(this.config, this.getDataManager(), 'biodiversity', v, x, y);
    return Math.min(6, Math.max(0, baseBiodiversity + typeBonus));
  }

  calculate() {
    // Biodiversity
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      this.biodiversityMap[y][x] = this.getTileBiodiversity(v, x, y);
    });
    this.biodiversity = Array2D.flatten(this.biodiversityMap);

    // Count of tiles with biodiversity >= high biodiversity threshold
    const highBiodiversityThreshold = this.config.goals?.biodiversity?.['high-biodiversity-threshold'] || 5;
    this.highBiodiversityTileCount = this.biodiversity.reduce((count, value) => {
      return count + (value >= highBiodiversityThreshold ? 1 : 0);
    }, 0);
    this.highBiodiversityTilePercent = (this.highBiodiversityTileCount / this.biodiversity.length) * 100;

    // Divide the map in 4x4 regions, and calculate the max biodiversity in each region
    const regionSize = 4;
    const regionBiodiversityMax = [];
    for (let ry = 0; ry < Math.ceil(this.city.map.height / regionSize); ry += 1) {
      for (let rx = 0; rx < Math.ceil(this.city.map.width / regionSize); rx += 1) {
        let maxBiodiversity = 0;
        for (let y = ry * regionSize; y < Math.min((ry + 1) * regionSize,
          this.city.map.height); y++) {
          for (let x = rx * regionSize; x < Math.min((rx + 1) * regionSize,
            this.city.map.width); x++) {
            if (this.biodiversityMap[y][x] > maxBiodiversity) {
              maxBiodiversity = this.biodiversityMap[y][x];
            }
          }
        }
        regionBiodiversityMax.push(maxBiodiversity);

        // Fill the biodiversityRegionMap with the max biodiversity for this region
        for (let y = ry * regionSize; y < Math.min((ry + 1) * regionSize,
          this.city.map.height); y++) {
          for (let x = rx * regionSize; x < Math.min((rx + 1) * regionSize,
            this.city.map.width); x++) {
            this.biodiversityRegionMap[y][x] = maxBiodiversity;
          }
        }
      }
    }

    // Calculate the number or biodiversity regions that have at least the minimum biodiversity
    const minAcceptableBiodiversity = this.config.goals?.biodiversity?.['min-acceptable-biodiversity'] || 1;
    this.biodiversityRegionAcceptableCount = regionBiodiversityMax.filter(b => b >= minAcceptableBiodiversity).length;
    const totalRegions = regionBiodiversityMax.length;
    this.biodiversityRegionAcceptablePercent = (this.biodiversityRegionAcceptableCount / totalRegions) * 100;

    // Calculate the index.
    // Gain points based on the number of high biodiversity tiles
    this.biodiversityIndex = 1;
    const highBiodiversityGoal = this.config.goals?.biodiversity?.['index-high-biodiversity-percentage'];
    if (this.highBiodiversityTilePercent >= highBiodiversityGoal?.['2']) {
      this.biodiversityIndex += 2;
    } else if (this.highBiodiversityTilePercent >= highBiodiversityGoal?.['1']) {
      this.biodiversityIndex += 1;
    }
    // Gain points based on the number of acceptable biodiversity regions
    const acceptableRegionGoal = this.config.goals?.biodiversity?.['index-region-biodiversity-percentage'];
    if (this.biodiversityRegionAcceptablePercent >= acceptableRegionGoal?.['2']) {
      this.biodiversityIndex += 2;
    } else if (this.biodiversityRegionAcceptablePercent >= acceptableRegionGoal?.['1']) {
      this.biodiversityIndex += 1;
    }
  }

  getGoals() {
    return [
      {
        id: 'high-biodiversity-tiles',
        category: 'biodiversity',
        priority: 1,
        condition: this.highBiodiversityTilePercent >= (this.config.goals?.biodiversity?.['index-high-biodiversity-percentage']?.['2']),
        progress: this.goalProgress(this.highBiodiversityTilePercent, this.config.goals?.biodiversity?.['index-high-biodiversity-percentage']?.['2']),
      },
      {
        id: 'enough-acceptable-biodiversity-regions',
        category: 'biodiversity',
        priority: 2,
        condition: this.biodiversityRegionAcceptablePercent >= (this.config.goals?.biodiversity?.['index-region-biodiversity-percentage']?.['2']),
        progress: this.goalProgress(this.biodiversityRegionAcceptablePercent, this.config.goals?.biodiversity?.['index-region-biodiversity-percentage']?.['2']),
      },
    ];
  }
}

module.exports = BiodiversityData;
