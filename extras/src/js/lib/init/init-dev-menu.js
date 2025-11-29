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

  devMenuBar.addMenu('view', 'View');
  devMenuBar.addItem('view', 'Default', () => { dataOverlayController.hide(); });
  devMenuBar.addItem('view', 'Density', () => { dataOverlayController.display('density-map'); });
  devMenuBar.addItem('view', 'Urban area', () => { dataOverlayController.display('urban-map'); });
  devMenuBar.addItem('view', 'Productivity', () => { dataOverlayController.display('productivity-map'); });
  devMenuBar.addItem('view', 'Productive Capacity', () => { dataOverlayController.display('productive-capacity-map'); });
  devMenuBar.addItem('view', 'Carbon', () => { dataOverlayController.display('carbon-map'); });
  devMenuBar.addItem('view', 'Biodiversity', () => { dataOverlayController.display('biodiversity-map'); });
  devMenuBar.addItem('view', 'Biodiversity (regions)', () => { dataOverlayController.display('biodiversity-region-map'); });
  devMenuBar.addItem('view', 'Pollution', () => { dataOverlayController.display('pollution-map'); });

  return devMenuBar.$element;
}

module.exports = initDevMenu;
