/* globals PIXI */
const PowerUpViewHandler = require('./power-up-view-handler');
const { getTileTypeId } = require('../data/config-helpers');
const MapView = require('../view-pixi/map-view');

const POWER_UP_ID = 'aquaculture';
const TEXTURE_BUNDLE = 'aquaculture';
const TEXTURE_NAME = 'aquaculture';

const DEFAULT_MAX_COVERAGE = 1 / 3;
const DEFAULT_RESTRICTED_ADJACENT_TYPES = ['urban-low', 'urban-mid', 'urban-high'];
const DEFAULT_PREFERRED_SCORES = {
  livestock: 1.5,
  crops: 1,
  industrial: 0.5,
  'solar-farm': 0.5,
  water: 0.5,
};

const tileKey = (x, y) => `${x},${y}`;

class AquacultureHandler extends PowerUpViewHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;
    this.enabled = false;

    const settings = (config.powerUps?.[POWER_UP_ID]?.settings) || {};
    this.maxCoverage = settings['max-coverage'] !== undefined
      ? Number(settings['max-coverage'])
      : DEFAULT_MAX_COVERAGE;

    const restrictedTypes = settings['restricted-adjacent-types']
      || DEFAULT_RESTRICTED_ADJACENT_TYPES;
    this.restrictedAdjacentTileIds = new Set(
      restrictedTypes
        .map(type => getTileTypeId(this.config, type))
        .filter(id => id !== null)
    );

    const preferredScores = settings['preferred-scores'] || DEFAULT_PREFERRED_SCORES;
    this.preferredScoresById = new Map();
    Object.entries(preferredScores).forEach(([type, score]) => {
      const id = getTileTypeId(this.config, type);
      if (id !== null) this.preferredScoresById.set(id, Number(score));
    });

    this.waterTileId = getTileTypeId(this.config, 'water');

    this.overlay = new PIXI.Container();
    this.overlay.visible = false;
    this.mapView.addGraphicsOverlay(this.overlay);

    this.farmSprites = new Map();

    this.handleMapUpdate = this.handleMapUpdate.bind(this);
    this.mapView.city.events.on('update', this.handleMapUpdate);
  }

  onEnable(powerUp) {
    if (powerUp !== POWER_UP_ID) return;
    this.enabled = true;
    this.overlay.visible = true;
    this.updateFarms();
  }

  onDisable(powerUp) {
    if (powerUp !== POWER_UP_ID) return;
    this.enabled = false;
    this.overlay.visible = false;
    this.clearFarmSprites();
  }

  handleMapUpdate() {
    if (!this.enabled) return;
    this.updateFarms();
  }

  clearFarmSprites() {
    this.farmSprites.forEach((sprite) => {
      this.overlay.removeChild(sprite);
      sprite.destroy({ children: true });
    });
    this.farmSprites.clear();
  }

  isEligible(x, y) {
    const grid = this.mapView.city.map;
    if (grid.get(x, y) !== this.waterTileId) return false;
    return !grid.adjacentCells(x, y)
      .some(([, , id]) => this.restrictedAdjacentTileIds.has(id));
  }

  scoreTile(x, y) {
    return this.mapView.city.map.adjacentCells(x, y)
      .reduce((acc, [, , id]) => acc + (this.preferredScoresById.get(id) || 0), 0);
  }

  updateFarms() {
    const grid = this.mapView.city.map;
    const waterTiles = [];
    const eligibleTiles = [];
    const eligibleKeys = new Set();
    grid.allCells().forEach(([x, y, id]) => {
      if (id !== this.waterTileId) return;
      waterTiles.push([x, y]);
      if (this.isEligible(x, y)) {
        eligibleTiles.push([x, y]);
        eligibleKeys.add(tileKey(x, y));
      }
    });

    const maxFarms = Math.min(
      eligibleTiles.length,
      Math.round(waterTiles.length * this.maxCoverage)
    );

    const selectedKeys = new Set();

    // Step 1: keep previously placed farms that are still eligible.
    this.farmSprites.forEach((_, key) => {
      if (selectedKeys.size < maxFarms && eligibleKeys.has(key)) {
        selectedKeys.add(key);
      }
    });

    // Step 2: only score remaining candidates if step 1 didn't fill all slots.
    if (selectedKeys.size < maxFarms) {
      const remaining = eligibleTiles
        .filter(([x, y]) => !selectedKeys.has(tileKey(x, y)))
        .map(([x, y]) => ({ x, y, score: this.scoreTile(x, y) }));
      remaining.sort((a, b) => b.score - a.score);
      const slotsLeft = maxFarms - selectedKeys.size;
      for (let i = 0; i < slotsLeft && i < remaining.length; i += 1) {
        selectedKeys.add(tileKey(remaining[i].x, remaining[i].y));
      }
    }

    // Remove sprites no longer selected.
    Array.from(this.farmSprites.keys()).forEach((key) => {
      if (selectedKeys.has(key)) return;
      const sprite = this.farmSprites.get(key);
      this.overlay.removeChild(sprite);
      sprite.destroy({ children: true });
      this.farmSprites.delete(key);
    });

    // Add sprites for newly selected tiles.
    selectedKeys.forEach((key) => {
      if (this.farmSprites.has(key)) return;
      const [xs, ys] = key.split(',');
      this.farmSprites.set(key, this.createFarmSprite(Number(xs), Number(ys)));
    });
  }

  createFarmSprite(x, y) {
    const texture = this.mapView.getTexture(TEXTURE_BUNDLE, TEXTURE_NAME);
    const container = new PIXI.Container();
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = MapView.TILE_SIZE / 2;
    sprite.y = MapView.TILE_SIZE / 2;
    container.addChild(sprite);
    container.x = x * MapView.TILE_SIZE;
    container.y = y * MapView.TILE_SIZE;
    this.overlay.addChild(container);
    return container;
  }
}

module.exports = AquacultureHandler;
