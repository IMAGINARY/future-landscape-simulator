/* global PIXI */
const StaticVariableMapOverlayTransition = require('./static-variable-map-overlay-transition');
const StaticVariableMapView = require('./static-variable-map-view');

class StaticVariableMapOverlay {
  constructor(mapView, colors, options = {}) {
    this.mapView = mapView;
    this.options = { ...StaticVariableMapOverlay.defaultOptions, ...options };

    this.transition = null;
    const parentBounds = mapView.displayObject.getLocalBounds();
    this.view = new StaticVariableMapView(
      mapView.city.map.width,
      mapView.city.map.height,
      colors,
    );
    this.view.scaleToFit(parentBounds.width, parentBounds.height);

    this.displayObject = new PIXI.Container();
    this.displayObject.addChild(this.view.displayObject);
    this.displayObject.zIndex = 200;
    this.displayObject.alpha = 0;

    this.mapView.addDataOverlay(this.displayObject);
  }

  show(data) {
    if (this.transition !== null) {
      this.transition.finish();
    }
    this.view.update(data);
    this.transition = new StaticVariableMapOverlayTransition(
      this.options.transitionDuration * 60,
      this.mapView,
      this.displayObject,
      () => {
        this.transition = null;
      }
    );
  }

  update(data) {
    this.view.update(data);
  }

  hide() {
    if (this.transition) {
      this.transition.finish();
    }
    this.transition = new StaticVariableMapOverlayTransition(
      this.options.transitionDuration * 60,
      this.mapView,
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

StaticVariableMapOverlay.defaultOptions = {
  transitionDuration: 1,
}

module.exports = StaticVariableMapOverlay;
