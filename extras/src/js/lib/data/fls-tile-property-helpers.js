/**
 * Returns a table indexed by tile type for the given property
 *
 * @param config
 * @param propertyName
 */
function getTilePropertyTable(config, propertyName) {
  const answer = {};
  Object.entries(config).forEach(([id, def]) => {
    if (def[propertyName] !== undefined) {
      answer[id] = def[propertyName];
    }
  });

  return answer;
}

/**
 * Get the base value of a tile property from config, handling both
 * scalar values and object values with urban/density variants.
 *
 * @param {Object} config - The application config
 * @param {Object} dataManager - The data manager instance
 * @param {string} propertyName - The property name to look up (e.g., 'biodiversity', 'food', 'productivity')
 * @param {number} v - The tile type ID
 * @param {number} x - The tile x coordinate
 * @param {number} y - The tile y coordinate
 * @returns {number} The base value for the property
 */
function getTilePropertyValue(config, dataManager, propertyName, v, x, y) {
  const propertyValue = config.tileTypes?.[v]?.[propertyName] || 0;

  if (typeof propertyValue === 'number' || typeof propertyValue === 'string') {
    return Number(propertyValue);
  }

  if (typeof propertyValue === 'object' && propertyValue !== null) {
    const urbanMap = dataManager.get('urban-map');
    if (urbanMap?.[y]?.[x] > 0 && propertyValue.urban) {
      return Number(propertyValue.urban);
    }

    const densityMap = dataManager.get('density-map');
    if (densityMap?.[y]?.[x] > 0) {
      return Number(propertyValue?.[`density-${densityMap[y][x]}`] || 0);
    }
  }

  return 0;
}

/**
 * Get the total modifiers for a specific tile type from all applicable modifiers.
 *
 * @param {DataManager} dataManager - The data manager instance
 * @param {string} id - The modifier ID to look up
 * @param {string} tileType - The tile type (e.g., 'residential', 'commercial', etc.)
 */
function getTileTypeModifiers(dataManager, id, tileType) {
  const bonuses = dataManager.getModifiers(id);
  const typeBonus = bonuses.reduce((acc, bonus) => {
    return acc + (bonus?.[tileType] || 0);
  }, 0);

  return typeBonus;
}

module.exports = {
  getTilePropertyTable,
  getTilePropertyValue,
  getTileTypeModifiers
};
