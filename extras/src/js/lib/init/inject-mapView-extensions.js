/* globals PIXI */
const DraftingOverlay = require('../view-pixi/drafting-overlay');
const MapTextOverlay = require('../view-pixi/map-text-overlay');
const Array2D = require('../data/array-2d');
const calculateDensityMap = require('../model/calculate-density-map');
const AquacultureHandler = require('../power-ups/aquaculture-handler');

const qs = new URLSearchParams(window.location.search);

function injectMapViewExtensions(config, textures, mapView, powerUpViewMgr) {
  powerUpViewMgr.registerHandler(new AquacultureHandler(config, mapView));

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
      densityOverlay.display(calculateDensityMap(mapView.city.map.cells, densities));
    });
  }
}

module.exports = injectMapViewExtensions;
