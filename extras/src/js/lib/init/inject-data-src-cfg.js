const ZoningData = require('../data-sources/zoning-data');
const UrbanData = require('../data-sources/urban-data');
const DensityData = require('../data-sources/density-data');
const PopulationData = require('../data-sources/population-data');
const CarbonData = require('../data-sources/carbon-data');
const EconomicGrowthData = require('../data-sources/economic-growth-data');
const BiodiversityData = require('../data-sources/biodiversity-data');
const FoodProductionData = require('../data-sources/food-production-data');
const QualityOfLifeData = require('../data-sources/quality-of-life-data');

const dataSrcCfg = {
  dataSources: [
    ZoningData,
    UrbanData,
    DensityData,
    PopulationData,
    CarbonData,
    EconomicGrowthData,
    BiodiversityData,
    FoodProductionData,
    QualityOfLifeData,
  ],
};

module.exports = dataSrcCfg;
