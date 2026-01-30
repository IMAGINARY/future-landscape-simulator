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

module.exports = { getTilePropertyValue };
