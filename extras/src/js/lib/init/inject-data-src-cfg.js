const ZoningData = require('../data-sources/zoning-data');
const PopulationData = require('../data-sources/population-data');

const dataSrcCfg = {
  dataSources: [
    ZoningData,
    PopulationData,
  ],
};

module.exports = dataSrcCfg;
