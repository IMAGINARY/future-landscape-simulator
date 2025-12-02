const StaticVariableMapViewModeHandler = require('../view-pixi/map-view-mode-handlers/map-view-mode-static-var-map-handler');

function initMapModes(config, mapView, mapViewModeMgr) {
  const varMapHandler = new StaticVariableMapViewModeHandler(config, mapView);
  mapViewModeMgr.addMode('food-production', varMapHandler);
  mapViewModeMgr.addMode('biodiversity', varMapHandler);
  mapViewModeMgr.addMode('carbon', varMapHandler);
}

module.exports = initMapModes;
