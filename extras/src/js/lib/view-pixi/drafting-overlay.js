const MapView = require('./map-view');

const EndpointMode = Object.freeze({
  CENTER: "center", // line stops/starts at cell center
  FULL: "full",     // line spans full cell edge-to-edge
});

const CrossAlignment = Object.freeze({
  CENTER: "center", // runs through the middle of the cells
  LEFT: "left",     // runs along the left side (POV of line direction)
  RIGHT: "right",   // runs along the right side (POV of line direction)
});

class DraftingOverlay {
  constructor(config, mapView) {
    this.config = config;
    this.mapView = mapView;
    this.endpointMode = EndpointMode.FULL;
    this.crossAlignment = CrossAlignment.CENTER;

    this.displayObject = new PIXI.Container();
    this.displayObject.zIndex = 300;
    this.draft = new PIXI.Graphics();
    this.displayObject.addChild(this.draft);
    this.draft.x = 0;
    this.draft.y = 0;
    this.draft.width = this.mapView.city.map.width * MapView.TILE_SIZE;
    this.draft.height = this.mapView.city.map.height * MapView.TILE_SIZE;
    this.draft.alpha = 0.75;

    this.mapView.addGraphicsOverlay(this.displayObject);
  }

  setLineMode(endpointMode, crossAlignment) {
    this.endpointMode = endpointMode;
    this.crossAlignment = crossAlignment;
  }

  parseLineWidth(width) {
    if (typeof width === 'string' && width.endsWith('%')) {
      return parseFloat(width) / 100 * MapView.TILE_SIZE;
    }
    return width;
  }

  drawLine(start, end, color, width) {
    if (start.x !== end.x && start.y !== end.y) {
      throw new Error('Only horizontal or vertical lines are supported');
    }
    if (start.x === end.x && start.y === end.y) {
      throw new Error('Start and end points must be different');
    }
    if (this.mapView.city.map.isValidCoords(start.x, start.y) === false) {
      throw new Error(`Start point ${start.x},${start.y} is out of map bounds (${mapWidth}x${mapHeight})`);
    }
    if (this.mapView.city.map.isValidCoords(end.x, end.y) === false) {
      throw new Error(`End point ${end.x},${end.y} is out of map bounds (${mapWidth}x${mapHeight})`);
    }

    const displayCoordinates = this.mapToDisplayCoords(start, end);

    this.draft.lineStyle(this.parseLineWidth(width), color, 1, this.getPixiLineAlignment());
    this.draft.moveTo(displayCoordinates.start.x, displayCoordinates.start.y);
    this.draft.lineTo(displayCoordinates.end.x, displayCoordinates.end.y);
  }

  getPixiLineAlignment() {
    if (this.crossAlignment === CrossAlignment.LEFT) {
      return 0;
    } else if (this.crossAlignment === CrossAlignment.RIGHT) {
      return 1;
    } else {
      return 0.5;
    }
  }

  mapToDisplayCoords(start, end) {
    const lineIsVertical = start.x === end.x;
    const lineIsHorizontal = start.y === end.y;
    const directionIsPositive = (lineIsVertical ? (end.y - start.y) : (end.x - start.x)) > 0;

    let startXOffset = 0;
    let startYOffset = 0;
    let endXOffset = 0;
    let endYOffset = 0;
    if (lineIsHorizontal) {
      if (directionIsPositive) {
        startXOffset = (this.endpointMode === EndpointMode.FULL) ? 0 : 0.5;
        endXOffset = (this.endpointMode === EndpointMode.FULL) ? 1 : 0.5;
        startYOffset = endYOffset = (this.crossAlignment === CrossAlignment.CENTER) ? 0.5 :
          (this.crossAlignment === CrossAlignment.LEFT) ? 0 : 1;
        endYOffset = startYOffset;
      } else {
        startXOffset = (this.endpointMode === EndpointMode.FULL) ? 1 : 0.5;
        endXOffset = (this.endpointMode === EndpointMode.FULL) ? 0 : 0.5;
        startYOffset = endYOffset = (this.crossAlignment === CrossAlignment.CENTER) ? 0.5 :
          (this.crossAlignment === CrossAlignment.LEFT) ? 1 : 0;
        endYOffset = startYOffset;
      }
    } else {
      if (directionIsPositive) {
        startYOffset = (this.endpointMode === EndpointMode.FULL) ? 0 : 0.5;
        endYOffset = (this.endpointMode === EndpointMode.FULL) ? 1 : 0.5;
        startXOffset = endXOffset = (this.crossAlignment === CrossAlignment.CENTER) ? 0.5 :
          (this.crossAlignment === CrossAlignment.LEFT) ? 1 : 0;
        endXOffset = startXOffset;
      } else {
        startYOffset = (this.endpointMode === EndpointMode.FULL) ? 1 : 0.5;
        endYOffset = (this.endpointMode === EndpointMode.FULL) ? 0 : 0.5;
        startXOffset = endXOffset = (this.crossAlignment === CrossAlignment.CENTER) ? 0.5 :
          (this.crossAlignment === CrossAlignment.LEFT) ? 0 : 1;
        endXOffset = startXOffset;
      }
    }

    return {
      start: {
        x: (start.x + startXOffset) * MapView.TILE_SIZE,
        y: (start.y + startYOffset) * MapView.TILE_SIZE,
      },
      end: {
        x: (end.x + endXOffset) * MapView.TILE_SIZE,
        y: (end.y + endYOffset) * MapView.TILE_SIZE,
      }
    }
  }
}

DraftingOverlay.EndpointMode = EndpointMode;
DraftingOverlay.CrossAlignment = CrossAlignment;

module.exports = DraftingOverlay;
