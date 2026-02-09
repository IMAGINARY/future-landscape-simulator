const Array2D = require('../data/array-2d');
const DataSource = require('./data-source');
const { clamp } = require('../helpers/math');
const FlsDataSourceHelper = require('../data/fls-data-source-helper');

class FoodProductionData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;
    this.helper = null;

    this.foodProductionMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
    this.foodTypeMap = Array2D.create(this.city.map.width, this.city.map.height, 'plant');

    this.cropsProduction = 0;
    this.plantFoodProduction = 0;
    this.animalFoodProduction = 0;
    this.feedRequirement = 0;
    this.plantFoodRequirement = 0;
    this.animalFoodRequirement = 0;
    this.foodProductionIndex = 0;
  }

  onRegistered(dataManager) {
    super.onRegistered(dataManager);
    this.helper = new FlsDataSourceHelper(this.config, this.getDataManager());
  }

  getVariables() {
    return {
      'food-production-map': () => this.foodProductionMap,
      'food-production-crops': () => this.cropsProduction,
      'food-production-plant': () => this.plantFoodProduction,
      'food-production-animal': () => this.animalFoodProduction,
      'food-production-feed-requirement': () => this.feedRequirement,
      'food-production-plant-requirement': () => this.plantFoodRequirement,
      'food-production-animal-requirement': () => this.animalFoodRequirement,
      'food-production-index': () => this.foodProductionIndex,
    };
  }

  calculate() {
    const tagMap = this.getDataManager().tagMap;
    const cityMap = this.city.map;
    // Todo: This should be optimized to only re-calculate tables if power-ups change.
    const baseTable = this.helper.getPropertyTable('food');
    // We retrieve all the bonuses, because they get added together.
    const bonusTable = this.helper.getBonusTable('food-production-bonus');
    const foodTypeTable = this.helper.getPropertyTable('food-type');
    const feedRequirementTable = this.helper.getPropertyTable('feed-requirement');
    const feedTable = this.helper.getBonusTable('feed');
    // Calculate the food yield for each tile
    Array2D.mapInPlace(this.foodProductionMap, (v, x, y) => {
      const tileType = cityMap.get(x, y);
      const baseYield = baseTable[tileType]?.match(tagMap, x, y) || 0;
      const bonusYield = bonusTable[tileType]?.reduce((acc, matcher) => acc + ((matcher.match(tagMap, x, y) || 0)), 0) || 0;
      return clamp(baseYield + bonusYield, 0, 6);
    });

    // Calculate the food type for each tile
    Array2D.mapInPlace(this.foodTypeMap, (v, x, y) => {
      const tileType = cityMap.get(x, y);
      return foodTypeTable[tileType].match(tagMap, x, y) || 'plant';
    });

    // Sum the total food production by type
    this.animalFoodProduction = 0;
    this.cropsProduction = 0;
    Array2D.forEach(this.foodProductionMap, (v, x, y) => {
      const foodType = this.foodTypeMap[y][x];
      if (foodType === 'animal') {
        this.animalFoodProduction += v;
      }
      else if (foodType === 'plant') {
        this.cropsProduction += v;
      }
    });

    let grossFeedRequirement = 0;
    // Calculate the total feed requirement
    Array2D.forEach(cityMap.cells, (v, x, y) => {
      grossFeedRequirement += feedRequirementTable[v]?.match(tagMap, x, y) || 0;
    });
    // Clamp the feed requirement so it can't be over half the crops production
    const maxFeedPercentage = this.config.goals?.['food-production']?.['max-feed-percentage'] || 50;
    this.feedRequirement = Math.min(grossFeedRequirement, this.cropsProduction * (maxFeedPercentage / 100));

    this.plantFoodProduction = this.cropsProduction - this.feedRequirement;

    const population = this.getDataManager().get('population-total') || 0;

    const baseReqPercent = this.config.goals?.['food-production']?.['meat-base-req-percentage'] || 33.333;
    const plantBasedDietBonus = this.helper.getTotalBonus('plant-based-diet-bonus');
    const meatReqPercent = clamp(
      1 / ((100 / baseReqPercent) + plantBasedDietBonus), // Default is 33%, but it can be reduced by power-ups.
      1/8,
      1/2
    );

    const foodPerCapitaFactor = this.config.goals?.['food-production']?.['food-per-capita-factor'] || 1;
    this.plantFoodRequirement = population * foodPerCapitaFactor * (1 - meatReqPercent);
    this.animalFoodRequirement = population * foodPerCapitaFactor * meatReqPercent;

    this.foodProductionIndex = this.calculateIndex();
  }

  getGoals() {
    const partialPlantGoal = this.config?.goals?.['food-production']?.index?.['partial-plant-goal'] || 0.5;
    const partialAnimalGoal = this.config?.goals?.['food-production']?.index?.['partial-animal-goal'] || 0.5;

    return [
      {
        id: 'food-plant-half-requirement',
        category: 'food-production',
        priority: 1,
        condition: this.plantFoodProduction >= this.plantFoodRequirement * partialPlantGoal,
        progress: this.goalProgress(this.plantFoodProduction, this.plantFoodRequirement * partialPlantGoal),
        points: 1,
      },
      {
        id: 'food-animal-half-requirement',
        category: 'food-production',
        priority: 2,
        condition: this.animalFoodProduction >= this.animalFoodRequirement * partialAnimalGoal,
        progress: this.goalProgress(this.animalFoodProduction, this.animalFoodRequirement * partialAnimalGoal),
        points: 1,
      },
      {
        id: 'food-plant-full-requirement',
        category: 'food-production',
        priority: 3,
        condition: this.plantFoodProduction >= this.plantFoodRequirement,
        progress: this.goalProgress(this.plantFoodProduction, this.plantFoodRequirement),
        points: 1,
      },
      {
        id: 'food-animal-full-requirement',
        category: 'food-production',
        priority: 4,
        condition: this.animalFoodProduction >= this.animalFoodRequirement,
        progress: this.goalProgress(this.animalFoodProduction, this.animalFoodRequirement),
        points: 1,
      }
    ]
  }
}

module.exports = FoodProductionData;
