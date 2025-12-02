// eslint-disable-next-line no-unused-vars
const DevMenuBar = require('../dev-tools/dev-menu-bar');
const randomizeMap = require('../editor/randomize-map');
const DataOverlayController = require('../dev-tools/data-overlay-controller');

function initDevMenu(config, mapView, mapViewModeMgr, mapEditorController, stats, powerUpMgr) {
  const dataOverlayController = new DataOverlayController(mapView, stats);

  const devMenuBar = new DevMenuBar('FMS Editor');
  devMenuBar.addMenu('map', 'Map');
  devMenuBar.addItem(
    'map',
    'Randomize',
    () => { randomizeMap(config, mapView.city); }
  );

  devMenuBar.addMenu('data', 'Data');
  devMenuBar.addItem('data', 'Default', () => { dataOverlayController.hide(); mapViewModeMgr.setMode('default');});
  devMenuBar.addItem('data', 'Density', () => { dataOverlayController.display('density-map'); });
  devMenuBar.addItem('data', 'Urban area', () => { dataOverlayController.display('urban-map'); });
  devMenuBar.addItem('data', 'Productivity', () => { dataOverlayController.display('productivity-map'); });
  devMenuBar.addItem('data', 'Productive Capacity', () => { dataOverlayController.display('productive-capacity-map'); });
  devMenuBar.addItem('data', 'Carbon', () => { dataOverlayController.display('carbon-map'); });
  devMenuBar.addItem('data', 'Biodiversity', () => { dataOverlayController.display('biodiversity-map'); });
  devMenuBar.addItem('data', 'Biodiversity (regions)', () => { dataOverlayController.display('biodiversity-region-map'); });
  devMenuBar.addItem('data', 'Pollution', () => { dataOverlayController.display('pollution-map'); });

  devMenuBar.addMenu('view', 'View');
  devMenuBar.addItem('view', 'Default', () => {
    mapViewModeMgr.setMode('default');
  }, {
    checked: () => mapViewModeMgr.getCurrentMode() === 'default',
  });
  devMenuBar.addItem('view', 'Food Production', () => {
    mapViewModeMgr.setMode('food-production', stats.get('food-production-map'));
  }, {
    checked: () => mapViewModeMgr.getCurrentMode() === 'food-production',
  });
  devMenuBar.addItem('view', 'Biodiversity', () => {
    mapViewModeMgr.setMode('biodiversity', stats.get('biodiversity-map'));
  }, {
    checked: () => mapViewModeMgr.getCurrentMode() === 'biodiversity',
  });
  devMenuBar.addItem('view', 'Carbon Balance', () => {
    mapViewModeMgr.setMode('carbon', stats.get('carbon-map'));
  }, {
    checked: () => mapViewModeMgr.getCurrentMode() === 'carbon',
  });

  return devMenuBar.$element;
}

module.exports = initDevMenu;
