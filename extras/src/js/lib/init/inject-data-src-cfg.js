const ZoningData = require('../data-sources/zoning-data');
const UrbanData = require('../data-sources/urban-data');
const DensityData = require('../data-sources/density-data');
const PopulationData = require('../data-sources/population-data');
const CarbonData = require('../data-sources/carbon-data');
const EconomicGrowthData = require('../data-sources/economic-growth-data');

const dataSrcCfg = {
  dataSources: [
    ZoningData,
    UrbanData,
    DensityData,
    PopulationData,
    CarbonData,
    EconomicGrowthData,
  ],
};

module.exports = dataSrcCfg;
