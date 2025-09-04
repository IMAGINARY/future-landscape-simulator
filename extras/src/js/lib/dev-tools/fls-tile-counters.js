const populationCounter = {
  id: 'total-population',
  label: 'Population',
  calculate: (stats) => {
    return (stats.get('population-total')).toFixed(2);
  },
};

module.exports = { populationCounter };
