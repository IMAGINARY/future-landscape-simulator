const ZoningData = require('../data-sources/zoning-data');
const PopulationData = require('../data-sources/population-data');
const CarbonData = require('../data-sources/carbon-data');

const dataSrcCfg = {
  dataSources: [
    ZoningData,
    PopulationData,
    CarbonData,
  ],
};

module.exports = dataSrcCfg;
