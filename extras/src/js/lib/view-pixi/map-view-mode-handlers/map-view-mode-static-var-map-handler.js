/* globals PIXI */
const MapViewModeHandler = require('./map-view-mode-handler');
const StaticVariableMapOverlay = require('../static-variable-map-overlay');
const IntervalMapper = require('../../helpers/interval-mapper');
const Array2D = require('../../data/array-2d');

class StaticVariableMapMapViewModeHandler extends MapViewModeHandler {
  constructor(config, mapView) {
    super();
    this.config = config;
    this.mapView = mapView;
    this.currentMode = null;
    this.mappers = Object.fromEntries(
        Object.entries(config?.inspectors?.variables)
          .filter(([_, vConfig]) => vConfig.mapping !== undefined)
          .map(([varName, vConfig]) => [varName, new IntervalMapper(vConfig.mapping)])
    );
    this.variableMapOverlay = new StaticVariableMapOverlay(
      this.mapView,
      config.inspectors.overlay.colors,
      {
        transitionDuration: config?.inspectors?.overlay?.transitionDuration ?? undefined,
      }
    );
    PIXI.Ticker.shared.add((time) => this.variableMapOverlay.animate(time));
  }

  mapData(data) {
    // If a mapper doesn't exist for the current mode, throw an error
    if (!this.mappers[this.currentMode]) {
      throw new Error(`No interval mapper defined for variable map mode '${this.currentMode}'`);
    }
    // Apply the mapper to the data
    return Array2D.map(data, (value) => this.mappers[this.currentMode].mapValueToInterval(value));
  }

  onEnter(currentMode, data) {
    this.currentMode = currentMode;
    this.variableMapOverlay.show(this.mapData(data));
  }

  onExit() {
    this.variableMapOverlay.hide();
    this.currentMode = null;
  }

  onDataUpdate(data) {
    this.variableMapOverlay.update(this.mapData(data));
  }
}

module.exports = StaticVariableMapMapViewModeHandler;
