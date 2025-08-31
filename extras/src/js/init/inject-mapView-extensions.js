/* globals PIXI */
const DraftingOverlay = require('../drafting-overlay');
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
}

module.exports = injectMapViewExtensions;
