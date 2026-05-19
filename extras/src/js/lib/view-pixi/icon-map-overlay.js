/* global PIXI */
const Array2D = require('../data/array-2d');
const MapView = require('./map-view');
const SpriteGrid = require('./sprite-grid');
const IconMapOverlayTransition = require('./icon-map-overlay-transition');

class IconMapOverlay {
  constructor(mapView, textureBundle, options = {}) {
    this.mapView = mapView;
    this.textureBundle = textureBundle;
    this.options = { ...IconMapOverlay.defaultOptions, ...options };

    this.transition = null;
    this.warnedMissing = new Set();

    this.spriteGrid = new SpriteGrid(
      mapView.city.map.width,
      mapView.city.map.height,
      MapView.TILE_SIZE
    );
    Array2D.forEach(this.spriteGrid.sprites, (sprite) => {
      sprite.visible = false;
    });

    this.displayObject = new PIXI.Container();
    this.displayObject.addChild(this.spriteGrid.displayObject);
    this.displayObject.zIndex = 250;
    this.displayObject.alpha = 0;

    this.mapView.addDataOverlay(this.displayObject);
  }

  applyData(data) {
    Array2D.forEach(data, (name, x, y) => {
      if (typeof name === 'string' && name.length > 0) {
        const texture = this.textureBundle[name];
        if (texture) {
          this.spriteGrid.setTexture(x, y, texture);
          return;
        }
        if (!this.warnedMissing.has(name)) {
          this.warnedMissing.add(name);
          // eslint-disable-next-line no-console
          console.warn(`IconMapOverlay: texture "${name}" not found in bundle`);
        }
      }
      this.spriteGrid.clearTile(x, y);
    });
  }

  show(data) {
    if (this.transition !== null) {
      this.transition.finish();
    }
    this.applyData(data);
    this.transition = new IconMapOverlayTransition(
      this.options.transitionDuration * 60,
      this.displayObject,
      () => {
        this.transition = null;
      }
    );
  }

  update(data) {
    this.applyData(data);
  }

  hide() {
    if (this.transition) {
      this.transition.finish();
    }
    this.transition = new IconMapOverlayTransition(
      this.options.transitionDuration * 60,
      this.displayObject,
      () => {
        this.transition = null;
      },
      true
    );
  }

  animate(time) {
    if (this.transition !== null) {
      this.transition.animate(time);
    }
  }
}

IconMapOverlay.defaultOptions = {
  transitionDuration: 1,
};

module.exports = IconMapOverlay;
