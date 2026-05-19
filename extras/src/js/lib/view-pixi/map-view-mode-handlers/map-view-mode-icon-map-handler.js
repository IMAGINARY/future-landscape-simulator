/* globals PIXI */
const MapViewModeHandler = require('./map-view-mode-handler');
const IconMapOverlay = require('../icon-map-overlay');

class IconMapViewModeHandler extends MapViewModeHandler {
  constructor(config, mapView, { textureBundle, dataMapper, overlayOptions } = {}) {
    super();
    if (typeof dataMapper !== 'function') {
      throw new Error('IconMapViewModeHandler requires a dataMapper function.');
    }
    if (!textureBundle || typeof textureBundle !== 'object') {
      throw new Error('IconMapViewModeHandler requires a textureBundle object.');
    }
    this.config = config;
    this.mapView = mapView;
    this.dataMapper = dataMapper;
    this.iconOverlay = new IconMapOverlay(this.mapView, textureBundle, overlayOptions);
    PIXI.Ticker.shared.add((time) => this.iconOverlay.animate(time));
  }

  mapData(data) {
    return this.dataMapper.call(this, data);
  }

  onEnter(currentMode, data) {
    this.iconOverlay.show(this.mapData(data));
  }

  onExit() {
    this.iconOverlay.hide();
  }

  onDataUpdate(data) {
    this.iconOverlay.update(this.mapData(data));
  }
}

module.exports = IconMapViewModeHandler;
