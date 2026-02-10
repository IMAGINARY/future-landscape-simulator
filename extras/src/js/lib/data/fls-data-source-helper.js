const TagMatcher = require('../data/tag-matcher');
const { isObject } = require('../helpers/types');
const { getTileTypeId } = require('./config-helpers');

class FlsDataSourceHelper {
  constructor(config, dataManager) {
    this.config = config;
    this.dataManager = dataManager;
  }

  /**
   * Builds a property table for the given property name, applying all relevant modifiers from
   * power-ups.
   *
   * The table is indexed by tile type, and contains TagMatchers.
   *
   * @param {string} propertyName
   * @param {*} defaultValue
   */
  getPropertyTable(propertyName, defaultValue = 0) {
    const table = {};

    // Get the base values for the property from config.
    Object.entries(this.config.tileTypes). forEach(([typeId, def]) => {
      if (def[propertyName] !== undefined) {
        const rules = isObject(def[propertyName]) ? def[propertyName] : { '*' : def[propertyName] };
        table[typeId] = new TagMatcher(rules);
      } else {
        table[typeId] = new TagMatcher({ '*': defaultValue });
      }
    });

    // Fully override the base values with all the modifiers from power-ups.
    this.dataManager
      .getModifiers(propertyName)
      .forEach((modifier) => {
        Object.entries(modifier).forEach(([typeName, def]) => {
          const typeId = getTileTypeId(this.config, typeName);
          const rules = isObject(def) ? def : { '*' : def };
          table[typeId] = new TagMatcher(rules);
        });
      });

    return table;
  }

  /**
   * Builds a bonus table for the given bonus ID.
   *
   * The table is indexed by tileType, and contains arrays of TagMatchers for that bonus from
   * all Power-ups. When calculating the bonus for a tile, all the matchers for that tile's type
   * should be checked and the bonuses summed.
   *
   * @param bonusId
   */
  getBonusTable(bonusId) {
    const table = {};

    this.dataManager
      .getModifiers(bonusId)
      .forEach((modifier) => {
        Object.entries(modifier).forEach(([typeName, def]) => {
          const typeId = getTileTypeId(this.config, typeName);
          const rules = isObject(def) ? def : { '*' : def };
          if (!table[typeId]) {
            table[typeId] = [];
          }
          table[typeId].push(new TagMatcher(rules));
        });
      });

    return table;
  }

  /**
   * Adds up the total bonus from all modifiers for a given bonus ID.
   *
   * Use for modifiers that give a flat bonus (not based on tile type).
   *
   * @param {string} bonusId
   * @return {number} The total bonus value from all modifiers for the given bonus ID.
   */
  getTotalBonus(bonusId) {
    return this.dataManager.getModifiers(bonusId).reduce((total, modifier) => {
      return total + Number(modifier) || 0;
    }, 0);
  }
}

module.exports = FlsDataSourceHelper;
