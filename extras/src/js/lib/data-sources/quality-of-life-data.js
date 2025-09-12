const Array2D = require('../data/array-2d');
const { getTileTypeId } = require('../data/config-helpers');
const DataSource = require('./data-source');

class QualityOfLifeData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;

    this.urbanAreaIds = [
      getTileTypeId(this.config, 'urban-low'),
      getTileTypeId(this.config, 'urban-mid'),
      getTileTypeId(this.config, 'urban-high'),
    ];

    this.natureXpIds = Object.entries(this.config.tileTypes || {})
      .filter(([id, type]) => type?.natureXp >= 1)
      .map(([id, type]) => Number(id));

    this.parkIds = [
      getTileTypeId(this.config, 'wetland'),
      getTileTypeId(this.config, 'forest'),
    ];

    this.qualityOfLifeIndex = 0;
    this.pollutionMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
    this.pollutionUrbanAvg = 0;
    this.natureXpUrbanPercent = 0;
    this.parkTotal = 0;
    this.parksPercent = 0;
    this.urbanHighPercent = 0;
    this.urbanDensityAvg = 0;
  }

  getVariables() {
    return {
      'pollution-map': () => this.pollutionMap,
      'pollution-urban-avg': () => this.pollutionUrbanAvg,
      'quality-of-life-index': () => this.qualityOfLifeIndex,
      'nature-xp-urban-percent': () => this.natureXpUrbanPercent,
      'parks-percent': () => this.parksPercent,
      'urban-density-avg': () => this.urbanDensityAvg,
    }
  }

  calculate() {
    // Calculate the pollution map. Use tileTypes.[id].pollution, which indicates how much
    // pollution the tile generates. Pollution spreads to directly adjacent tiles.
    // A tile's pollution level is the maximum of its own pollution and that of its neighbors.
    const pollutionPerTile = this.config.tileTypes?.['pollution'] || 0;
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      this.pollutionMap[y][x] = this.config.tileTypes?.[v]?.pollution || 0;
      this.city.map.nearbyCells(x, y).forEach(([adjX, adjY, adjV]) => {
        const adjPollution = this.config.tileTypes?.[adjV]?.pollution || 0;
        if (adjPollution > this.pollutionMap[y][x]) {
          this.pollutionMap[y][x] = adjPollution;
        }
      });
    });

    // Calculate the average pollution in urban areas
    // Iterate over the map, and calculate the average pollution of any tiles whose type is in this.urbanAreaIds,
    let urbanPollutionSum = 0;
    let urbanTileCount = 0;
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      if (this.urbanAreaIds.includes(v)) {
        urbanPollutionSum += this.pollutionMap[y][x];
        urbanTileCount += 1;
      }
    });
    this.pollutionUrbanAvg = (urbanTileCount > 0) ? (urbanPollutionSum / urbanTileCount) : 0;

    // Calculate the natureXp percent. That is, the percentage of urban areas (urbanAreaIds) that
    // have a natureXp tile (natureXpIds) within 2 tiles (Manhattan distance), but not 1 tile
    // (because adjacent tiles are parks, and not proper nature).
    let urbanWithNatureXpCount = 0;
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      if (this.urbanAreaIds.includes(v)) {
        let hasNatureXp = false;
        for (let dy = -2; dy <= 2; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) {
            if (Math.abs(dx) + Math.abs(dy) == 2) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < this.city.map.width && ny >= 0 && ny < this.city.map.height) {
                const nv = this.city.map.cells[ny][nx];
                if (this.natureXpIds.includes(nv)) {
                  hasNatureXp = true;
                }
              }
            }
          }
        }
        if (hasNatureXp) {
          urbanWithNatureXpCount += 1;
        }
      }
    });
    this.natureXpUrbanPercent = (urbanTileCount > 0) ? (urbanWithNatureXpCount / urbanTileCount) * 100 : 0;

    // Calculate the number of parks. Parks are tiles of type in this.parkIds that are adjacent to urban areas.
    let parkCount = 0;
    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      if (this.parkIds.includes(v)) {
        // Check if adjacent to an urban area
        const adjacentToUrban = this.city.map.adjacentCells(x, y).some(([adjX, adjY, adjV]) => this.urbanAreaIds.includes(adjV));
        if (adjacentToUrban) {
          parkCount += 1;
        }
      }
    });
    this.parkTotal = parkCount;
    // Calculate the percentage of park tiles relative to total tiles
    const totalTiles = this.city.map.width * this.city.map.height;
    this.parksPercent = (totalTiles > 0) ? (this.parkTotal / totalTiles) * 100 : 0;

    // Calculate the percentage of urban-high tiles relative to total urban tiles
    const urbanHighCount = this.dataManager.get('zones-urban-high-count') || 0;
    this.urbanHighPercent = (urbanTileCount > 0) ? (urbanHighCount / urbanTileCount) * 100 : 0;

    // Calculate this.urbanDensityAvg, the average density of urban areas using the density-map
    const densityMap = this.dataManager.get('density-map');
    let urbanDensitySum = 0;
    if (densityMap) {
      Array2D.forEach(this.city.map.cells, (v, x, y) => {
        if (this.urbanAreaIds.includes(v)) {
          urbanDensitySum += densityMap[y][x] || 0;
        }
      });
      this.urbanDensityAvg = (urbanTileCount > 0) ? (urbanDensitySum / urbanTileCount) : 0;
    } else {
      this.urbanDensityAvg = 0;
    }

    // Calculate the quality of life index, which is an integer from 1 to 5
    // by checking which is the max level at which all thresholds are met
    this.qualityOfLifeIndex = 1;
    for (let level = 5; level >= 1; level -= 1) {
      const thresholds = this.config?.goals?.['quality-of-life']?.['index-thresholds']?.[String(level)] || {};
      const meetsPollution = (thresholds['max-urban-pollution-average'] !== undefined)
        ? (this.pollutionUrbanAvg <= thresholds['max-urban-pollution-average'])
        : true;
      const meetsNatureXp = (thresholds['min-urban-nature-proximity-percent'] !== undefined)
        ? (this.natureXpUrbanPercent >= thresholds['min-urban-nature-proximity-percent'])
        : true;
      const meetsParks = (thresholds['min-urban-parks-percent'] !== undefined)
        ? (this.parksPercent >= thresholds['min-urban-parks-percent'])
        : true;
      const meetsUrbanHigh = (thresholds['min-urban-high-percent'] !== undefined)
        ? (this.urbanHighPercent >= thresholds['min-urban-high-percent'])
        : true;
      const meetsUrbanDensity = (thresholds['min-urban-density-average'] !== undefined)
        ? (this.urbanDensityAvg >= thresholds['min-urban-density-average'])
        : true;

      if (meetsPollution && meetsNatureXp && meetsParks && meetsUrbanHigh && meetsUrbanDensity) {
        this.qualityOfLifeIndex = level;
        break;
      }
    }
  }

  getGoals() {
    const l5MaxPollutionThreshold = this.config?.goals?.['quality-of-life']?.['index-thresholds']?.['5']?.['max-urban-pollution-average'] || 0;
    const l5MinNatureXpUrbanPercent = this.config?.goals?.['quality-of-life']?.['index-thresholds']?.['5']?.['min-urban-nature-proximity-percent'] || 0;
    const l5MinParksPercent = this.config?.goals?.['quality-of-life']?.['index-thresholds']?.['5']?.['min-urban-parks-percent'] || 0;
    const l5MinUrbanHighPercent = this.config?.goals?.['quality-of-life']?.['index-thresholds']?.['5']?.['min-urban-high-percent'] || 0;
    const l5MinUrbanDensityAverage = this.config?.goals?.['quality-of-life']?.['index-thresholds']?.['5']?.['min-urban-density-average'] || 0;

    return [
      {
        id: 'urban-pollution',
        category: 'quality-of-life',
        priority: 1,
        condition: this.pollutionUrbanAvg < l5MaxPollutionThreshold,
        progress: this.goalProgress(this.pollutionUrbanAvg, l5MaxPollutionThreshold),
      },
      {
        id: 'urban-nature-proximity',
        category: 'quality-of-life',
        priority: 1,
        condition: this.natureXpUrbanPercent >= l5MinNatureXpUrbanPercent,
        progress: this.goalProgress(this.natureXpUrbanPercent, l5MinNatureXpUrbanPercent),
      },
      {
        id: 'urban-parks',
        category: 'quality-of-life',
        priority: 1,
        condition: this.parksPercent >= l5MinParksPercent,
        progress: this.goalProgress(this.parksPercent, l5MinParksPercent),
      },
      {
        id: 'enough-urban-high-density',
        category: 'quality-of-life',
        priority: 1,
        condition: this.urbanHighPercent >= l5MinUrbanHighPercent,
        progress: this.goalProgress(this.urbanHighPercent, l5MinUrbanHighPercent),
      },
      {
        id: 'reduce-urban-sprawl',
        category: 'quality-of-life',
        priority: 1,
        condition: this.urbanDensityAvg >= l5MinUrbanDensityAverage,
        progress: this.goalProgress(this.urbanDensityAvg, l5MinUrbanDensityAverage),
      },
    ];
  }
}

module.exports = QualityOfLifeData;
