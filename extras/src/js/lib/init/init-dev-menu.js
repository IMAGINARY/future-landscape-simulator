// eslint-disable-next-line no-unused-vars
const DevMenu = require('../dev-tools/dev-menu');
const MapTextOverlay = require('../view-pixi/map-text-overlay');

function initDevMenu(config, mapView, mapEditorController, stats, powerUpMgr) {
  const dataMapOverlay = new MapTextOverlay(mapView);
  let currentMapVariable = null;
  const updateMap = () => {
    if (currentMapVariable) {
      dataMapOverlay.display(stats.get(currentMapVariable));
    }
  }
  mapView.city.events.on('update', () => {
    updateMap();
  });
  const showDataMapOverlay = (variable) => {
    currentMapVariable = variable;
    dataMapOverlay.display(stats.get(variable));
    dataMapOverlay.show();
  }
  const hideDataMapOverlay = () => {
    currentMapVariable = null;
    dataMapOverlay.hide();
  }

  const devMenu = new DevMenu('FLS Editor');
  devMenu.addDropdown('Map Data', {
    'None': () => { hideDataMapOverlay(); },
    'Density': () => { showDataMapOverlay('density-map'); },
    'Urban area': () => { showDataMapOverlay('urban-map'); }
  });

  return devMenu.$element;
}

module.exports = initDevMenu;
