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

module.exports = { populationCounter, averageCarbonCounter };
