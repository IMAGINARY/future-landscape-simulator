// eslint-disable-next-line no-unused-vars
const DevMenu = require('../dev-tools/dev-menu');
const DataOverlayController = require('../dev-tools/data-overlay-controller');

function initDevMenu(config, mapView, mapEditorController, stats, powerUpMgr) {
  const dataOverlayController = new DataOverlayController(mapView, stats);

  const devMenu = new DevMenu('FLS Editor');
  devMenu.addDropdown('Map Data', {
    'None': () => { dataOverlayController.hide(); },
    'Density': () => { dataOverlayController.display('density-map'); },
    'Urban area': () => { dataOverlayController.display('urban-map'); },
    'Productivity': () => { dataOverlayController.display('productivity-map'); },
    'Productive Capacity': () => { dataOverlayController.display('productive-capacity-map'); },
    'Carbon': () => { dataOverlayController.display('carbon-map'); },
    'Biodiversity': () => { dataOverlayController.display('biodiversity-map'); },
    'Biodiversity (regions)': () => { dataOverlayController.display('biodiversity-region-map'); },
    'Pollution': () => { dataOverlayController.display('pollution-map'); },
  });

  return devMenu.$element;
}

module.exports = initDevMenu;
