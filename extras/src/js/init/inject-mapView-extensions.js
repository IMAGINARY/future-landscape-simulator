/* globals PIXI */
const DraftingOverlay = require('../drafting-overlay');
const MapTextOverlay = require('../map-text-overlay');
const Array2D = require('../lib/array-2d');
const createDensityMap = require('../lib/create-density-map');

const qs = new URLSearchParams(window.location.search);

function injectMapViewExtensions(config, textures, mapView, powerUpViewMgr) {

  if (qs.get('dev-routes')) {
    const draftingOverlay = new DraftingOverlay(config, mapView);
    draftingOverlay.setLineMode(
      DraftingOverlay.EndpointMode.FULL,
      DraftingOverlay.CrossAlignment.CENTER
    );
    draftingOverlay.drawLine({ x: 7, y: 1 }, { x: 7, y: 14 }, 0x660066, '33%');
  }

  if(qs.get('dev-density')) {
    const densityOverlay = new MapTextOverlay(mapView);
    const densities = Array2D.create(
      mapView.city.map.width,
      mapView.city.map.height,
      '1',
    );
    densityOverlay.display(densities);
    densityOverlay.show();
    mapView.city.events.on('update', () => {
      densityOverlay.display(createDensityMap(mapView.city.map.cells));
    });
  }
}

module.exports = injectMapViewExtensions;
