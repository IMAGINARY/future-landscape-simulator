const MapTextOverlay = require('../view-pixi/map-text-overlay');

class DataOverlayController {
  constructor(mapView, stats) {
    this.mapView = mapView;
    this.stats = stats;

    this.currentVariable = null;
    this.overlay = new MapTextOverlay(mapView);

    mapView.city.events.on('update', this.updateMap.bind(this));
  }

  updateMap() {
    if (this.currentVariable) {
      this.overlay.display(this.stats.get(this.currentVariable));
    }
  }

  display(variable) {
    this.currentVariable = variable;
    this.overlay.display(this.stats.get(variable));
    this.overlay.show();
  }

  hide() {
    this.currentVariable = null;
    this.overlay.hide();
  }
}

module.exports = DataOverlayController;
