const Array2D = require('../data/array-2d');
const DataSource = require('./data-source');

class FoodProductionData extends DataSource {
  constructor(city, config) {
    super(city, config);
    this.city = city;
    this.config = config;

    this.foodProductionMap = Array2D.create(this.city.map.width, this.city.map.height, 0);
    this.totalAnimalFoodProduction = 0;
    this.totalPlantFoodProduction = 0;
    this.totalFeedFoodProduction = 0;
    this.totalFoodProduction = 0;
    this.foodProductionPerCapita = 0;
    this.foodProductionAnimalPerCapita = 0;
    this.feedPercentageSatisfied = 0;
    this.foodProductionIndex = 0;
  }

  getVariables() {
    return {
      'food-production-map': () => this.foodProductionMap,
      'food-production-total-animal': () => this.totalAnimalFoodProduction,
      'food-production-total-plant': () => this.totalPlantFoodProduction,
      'food-production-total-feed': () => this.totalFeedFoodProduction,
      'food-production-total-human': () => this.totalFoodProduction,
      'food-production-per-capita': () => this.foodProductionPerCapita,
      'food-production-animal-per-capita': () => this.foodProductionAnimalPerCapita,
      'food-production-feed-percent-satisfied': () => this.feedPercentageSatisfied,
      'food-production-index': () => this.foodProductionIndex,
    };
  }

  getTileFoodProduction(v, x, y) {
    const foodProduction = this.config.tileTypes?.[v]?.food || 0;
    const foodType = this.config.tileTypes?.[v]?.['food-type'] || 'plant';
    if (typeof foodProduction === 'number' || typeof foodProduction === 'string') {
      return [foodType, Number(foodProduction)];
    }
    if (typeof foodProduction === 'object' && foodProduction !== null) {
      const urbanMap = this.dataManager.get('urban-map');
      if (urbanMap?.[y]?.[x] > 0 && foodProduction.urban) {
        return [foodType, Number(foodProduction.urban)];
      }
      const densityMap = this.dataManager.get('density-map');
      if (densityMap?.[y]?.[x] > 0) {
        return [foodType, Number(foodProduction?.[`density-${densityMap[y][x]}`] || 0)];
      }
    }
    return ['plant', 0];
  }

  calculate() {
    // Calculate the demand for livestock feed. Multiply the number of livestock tiles by the feed requirement per tile.
    const feedRequirementPerLivestockTile = Number(this.config.goals?.['food-production']?.['feed-per-livestock-tile']) || 4;
    const livestockTileCount = this.dataManager.get(`zones-livestock-count`);
    const feedRequired= livestockTileCount * feedRequirementPerLivestockTile;

    // Calculate the actual food production
    this.totalAnimalFoodProduction = 0;
    this.totalPlantFoodProduction = 0;

    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      const [foodType, foodAmount] = this.getTileFoodProduction(v, x, y);
      if (foodType === 'animal') {
        this.totalAnimalFoodProduction += foodAmount;
      }
      else if (foodType === 'plant') {
        this.totalPlantFoodProduction += foodAmount;
      }
    });

    const maxFeedPercentage = this.config.goals?.food?.['max-feed-percentage'] || 50;
    const maxFeedAmount = (maxFeedPercentage / 100) * this.totalPlantFoodProduction;
    this.totalFeedFoodProduction = Math.min(feedRequired, maxFeedAmount);
    this.feedPercentageSatisfied = feedRequired === 0 ? 100 : (this.totalFeedFoodProduction / feedRequired) * 100;

    this.totalFoodProduction = this.totalAnimalFoodProduction + this.totalPlantFoodProduction - this.totalFeedFoodProduction;

    const population = this.dataManager.get('population-total') || 1;
    this.foodProductionPerCapita = this.totalFoodProduction / population;
    this.foodProductionAnimalPerCapita = this.totalAnimalFoodProduction / population;

    // Assign the index by checking the threshold conditions met
    this.foodProductionIndex = 1;
    const thresholds = this.config.goals?.['food-production']?.['index-thresholds'] || {};
    const thresholdOrder = Object.keys(thresholds)
      .map(Number)
      .sort((a, b) => b - a);
    for (const idx of thresholdOrder) {
      const t = thresholds[idx];
      if (this.foodProductionPerCapita >= (t?.['min-food-per-capita'] || 0)
        && this.foodProductionAnimalPerCapita >= (t?.['min-animal-food-per-capita'] || 0)
        && this.feedPercentageSatisfied >= (t?.['min-feed-percent'] || 0)) {
        this.foodProductionIndex = idx;
        break;
      }
    }

    Array2D.forEach(this.city.map.cells, (v, x, y) => {
      this.foodProductionMap[y][x] = this.getTileFoodProduction(v, x, y)[1];
    });
  }

  getGoals() {
    const level5FoodPerCapita = this.config?.goals?.['food-production']?.['index-thresholds']?.[5]?.['min-food-per-capita'] || 0;
    const level5AnimalFoodPerCapita = this.config?.goals?.['food-production']?.['index-thresholds']?.[5]?.['min-animal-food-per-capita'] || 0;
    const level5FeedPercent = this.config?.goals?.['food-production']?.['index-thresholds']?.[5]?.['min-feed-percent'] || 0;
    return [
      {
        id: 'sufficient-food-production',
        category: 'food-production',
        priority: 1,
        condition: this.foodProductionPerCapita >= level5FoodPerCapita,
        progress: this.goalProgress(this.foodProductionPerCapita, level5FoodPerCapita),
      },
      {
        id: 'sufficient-animal-food-production',
        category: 'food-production',
        priority: 2,
        condition: this.foodProductionAnimalPerCapita >= level5AnimalFoodPerCapita,
        progress: this.goalProgress(this.foodProductionAnimalPerCapita, level5AnimalFoodPerCapita),
      },
      {
        id: 'sufficient-feed-percentage',
        category: 'food-production',
        priority: 3,
        condition: this.feedPercentageSatisfied >= level5FeedPercent,
        progress: this.goalProgress(this.feedPercentageSatisfied, level5FeedPercent),
      }
    ];
  }
}

module.exports = FoodProductionData;
