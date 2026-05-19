const StaticVariableMapViewModeHandler = require('../view-pixi/map-view-mode-handlers/map-view-mode-static-var-map-handler');
const IconMapViewModeHandler = require('../view-pixi/map-view-mode-handlers/map-view-mode-icon-map-handler');
const CompositeMapViewModeHandler = require('../view-pixi/map-view-mode-handlers/map-view-mode-composite-handler');
const { buildCropIconMap } = require('../data/crop-icon-mapper');

function initMapModes(config, mapView, mapViewModeMgr) {
  const varMapHandler = new StaticVariableMapViewModeHandler(config, mapView);

  const cropIconMapper = function cropIconMapper() {
    return buildCropIconMap(this.config, this.mapView.city);
  };

  const cropIconHandler = new IconMapViewModeHandler(config, mapView, {
    textureBundle: mapView.textures['crop-icons'],
    dataMapper: cropIconMapper,
  });

  mapViewModeMgr.addMode('food-production', new CompositeMapViewModeHandler([varMapHandler, cropIconHandler]));
  mapViewModeMgr.addMode('biodiversity', varMapHandler);
  mapViewModeMgr.addMode('carbon', varMapHandler);
}

module.exports = initMapModes;
