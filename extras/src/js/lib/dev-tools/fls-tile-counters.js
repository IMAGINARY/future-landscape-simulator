const populationCounter = {
  id: 'total-population',
  label: 'Population',
  calculate: (stats) => {
    return (stats.get('population-total')).toFixed(2);
  },
};

const averageCarbonCounter = {
  id: 'carbon-avg',
  label: 'Avg. Carbon',
  calculate: (stats) => {
    return (stats.get('carbon-avg')).toFixed(2);
  },
}

const productivityCounter = {
  id: 'productivity-index',
  label: 'Productivity (Potential / Capacity)',
  calculate: (stats) => {
    const potential = stats.get('productivity-total');
    const capacity = stats.get('productive-capacity-total');
    const averageActualProductivity = stats.get('productivity-actual-avg').toFixed(2);
    return `${averageActualProductivity} (${potential} / ${capacity})`;
  }
};

const biodiversityCounter = {
  id: 'high-biodiversity',
  label: 'High Biodiversity Tiles',
  calculate: (stats) => {
    return `${stats.get('biodiversity-high-count')} (${stats.get('biodiversity-high-percent').toFixed(2)}%)`;
  }
}

const foodRequirementCounter = {
  id: 'food-requirement',
  label: 'Req: 🌾|🥕|🐮',
  calculate: (stats) => {
    return `${(stats.get('food-production-feed-requirement')).toFixed(2)} | ${(stats.get('food-production-plant-requirement')).toFixed(2)} | ${(stats.get('food-production-animal-requirement')).toFixed(2)}`;
  },
}

const foodProductionCounter = {
  id: 'food-production',
  label: 'Prod: 🚜|🥕|🐮',
  calculate: (stats) => {
    return `${(stats.get('food-production-crops')).toFixed(2)} | ${(stats.get('food-production-plant')).toFixed(2)} | ${(stats.get('food-production-animal')).toFixed(2)}`;
  }
}

const averageUrbanPollutionCounter = {
  id: 'urban-pollution-avg',
  label: 'Avg. Urban Pollution',
  calculate: (stats) => {
    return (stats.get('pollution-urban-avg')).toFixed(2);
  }
}

const natureUrbanXpCounter = {
  id: 'nature-xp-urban-percent',
  label: 'Urban access to Nature %',
  calculate: (stats) => {
    return (stats.get('nature-xp-urban-percent')).toFixed(2);
  }
}

const parkCounter = {
  id: 'parks-percent',
  label: 'Parks %',
  calculate: (stats) => {
    return (stats.get('parks-percent')).toFixed(2);
  }
}

const urbanDensityCounter = {
  id: 'urban-density-avg',
  label: 'Avg. Urban Density',
  calculate: (stats) => {
    return (stats.get('urban-density-avg')).toFixed(2);
  }
}

module.exports = { populationCounter, averageCarbonCounter, productivityCounter, biodiversityCounter, foodRequirementCounter, foodProductionCounter, averageUrbanPollutionCounter, natureUrbanXpCounter, parkCounter, urbanDensityCounter };
