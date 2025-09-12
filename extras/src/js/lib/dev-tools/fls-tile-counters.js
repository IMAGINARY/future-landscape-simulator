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

const foodPerCapitaCounter = {
  id: 'food-per-capita',
  label: 'Food per Capita (Animal)',
  calculate: (stats) => {
    return `${(stats.get('food-production-per-capita')).toFixed(2)} (${(stats.get('food-production-animal-per-capita')).toFixed(2)})`;
  },
}

const foodProductionCounter = {
  id: 'food-production',
  label: 'Plant / Animal / Feed',
  calculate: (stats) => {
    return `${(stats.get('food-production-total-plant')).toFixed(2)} / ${(stats.get('food-production-total-animal')).toFixed(2)} / ${(stats.get('food-production-total-feed')).toFixed(2)} (${(stats.get('food-production-feed-percent-satisfied')).toFixed(2)}%)`;
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

module.exports = { populationCounter, averageCarbonCounter, productivityCounter, biodiversityCounter, foodPerCapitaCounter, foodProductionCounter, averageUrbanPollutionCounter, natureUrbanXpCounter, parkCounter, urbanDensityCounter };
