const MapViewModeHandler = require('./map-view-mode-handler');

class CompositeMapViewModeHandler extends MapViewModeHandler {
  constructor(handlers) {
    super();
    if (!Array.isArray(handlers) || handlers.length === 0) {
      throw new Error('CompositeMapViewModeHandler requires a non-empty array of handlers.');
    }
    handlers.forEach((handler, index) => {
      if (!MapViewModeHandler.isValid(handler)) {
        throw new Error(`CompositeMapViewModeHandler: handler at index ${index} is not a valid map view mode handler.`);
      }
    });
    this.handlers = Object.freeze(handlers.slice());
  }

  onEnter(currentMode, data, previousMode) {
    this.handlers.forEach((handler) => {
      if (typeof handler.onEnter === 'function') {
        handler.onEnter(currentMode, data, previousMode);
      }
    });
  }

  onExit(currentMode, nextMode) {
    this.handlers.forEach((handler) => {
      if (typeof handler.onExit === 'function') {
        handler.onExit(currentMode, nextMode);
      }
    });
  }

  onMapUpdate(mode) {
    this.handlers.forEach((handler) => {
      if (typeof handler.onMapUpdate === 'function') {
        handler.onMapUpdate(mode);
      }
    });
  }

  onDataUpdate(data) {
    this.handlers.forEach((handler) => {
      if (typeof handler.onDataUpdate === 'function') {
        handler.onDataUpdate(data);
      }
    });
  }
}

module.exports = CompositeMapViewModeHandler;
