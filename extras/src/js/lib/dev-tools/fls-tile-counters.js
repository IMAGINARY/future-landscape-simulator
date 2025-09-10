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

module.exports = { populationCounter, averageCarbonCounter, productivityCounter };
