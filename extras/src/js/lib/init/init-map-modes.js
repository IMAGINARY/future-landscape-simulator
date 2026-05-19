const StaticVariableMapViewModeHandler = require('../view-pixi/map-view-mode-handlers/map-view-mode-static-var-map-handler');
const IconMapViewModeHandler = require('../view-pixi/map-view-mode-handlers/map-view-mode-icon-map-handler');
const CompositeMapViewModeHandler = require('../view-pixi/map-view-mode-handlers/map-view-mode-composite-handler');
const Array2D = require('../data/array-2d');
const { getTileTypeId } = require('../data/config-helpers');

function initMapModes(config, mapView, mapViewModeMgr) {
  const varMapHandler = new StaticVariableMapViewModeHandler(config, mapView);

  const cropIconMapper = function cropIconMapper(data) {
    const cropsId = getTileTypeId(this.config, 'crops');
    const cityMap = this.mapView.city.map;
    return Array2D.map(data, (_value, x, y) => (cityMap.get(x, y) === cropsId ? 'apple' : null));
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
