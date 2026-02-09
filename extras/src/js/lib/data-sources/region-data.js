const Array2D = require('../data/array-2d');
const DataSource = require('./data-source');
const { findRegions } = require('../data/regions');

class RegionData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;
    this.regions = [];
    this.regionMap = Array2D.create(this.city.map.width, this.city.map.height, -1);
  }

  getVariables() {
    return {
      'regions': () => this.regions,
      'region-map': () => this.regionMap,
    };
  }

  calculate() {
    const urbanMap = this.getDataManager().get('urban-map');
    const densityMap = this.getDataManager().get('density-map');
    const { width, height } = this.city.map;

    // Build auxiliary array with composite strings "<cellTypeId>:<mod>:<orientation>"
    const auxArray = Array2D.create(width, height, '');
    const uniqueValues = new Set();

    Array2D.forEach(this.city.map.cells, (cellTypeId, x, y) => {
      const isUrban = urbanMap[y][x] > 0;
      const mod = isUrban ? 'u' : densityMap[y][x];
      const orientation = this.city.getCellOrientation(x, y);
      const compositeKey = `${cellTypeId}:${mod}:${orientation}`;
      auxArray[y][x] = compositeKey;
      uniqueValues.add(compositeKey);
    });

    // Find regions using all unique composite values
    const includeTileTypes = Array.from(uniqueValues);
    const { regions, regionMap: rawRegionMap } = findRegions(auxArray, includeTileTypes);
    this.regions = regions;

    // Build region-map with region indices
    const regionIndexMap = new Map();
    this.regions.forEach((region, idx) => {
      regionIndexMap.set(region, idx);
    });

    Array2D.forEach(rawRegionMap, (regionRef, x, y) => {
      this.regionMap[y][x] = regionRef === null ? -1 : regionIndexMap.get(regionRef);
    });

    // Add tags based on region size
    const sRegionMaxSize = 2;
    const mRegionMaxSize = 4;

    const tagMap = this.getDataManager().tagMap;
    Array2D.forEach(this.regionMap, (x, y) => {
      const regionIdx = this.regionMap[y][x];
      if (regionIdx >= 0) {
        const regionSize = this.regions[regionIdx].length;
        if (regionSize <= sRegionMaxSize) {
          tagMap.set(x, y, 'region-s');
        } else if (regionSize <= mRegionMaxSize) {
          tagMap.set(x, y, 'region-m');
        } else {
          tagMap.set(x, y, 'region-l');
        }
      }
    });
  }
}

module.exports = RegionData;
