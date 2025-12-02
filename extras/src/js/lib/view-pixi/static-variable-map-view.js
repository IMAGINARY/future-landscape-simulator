/* globals PIXI */
const Array2D = require('../data/array-2d');

const TILE_SIZE = 10;

class StaticVariableMapView {
  /**
   * Constructor
   *
   * @param {number} cols
   * @param {number} rows
   * @param {number[]} colors
   * @param {object|null} colorMapping
   * @param {object} options
   */
  constructor(cols, rows, colors, options= {}) {
    this.width = cols;
    this.height = rows;
    this.colors = colors;
    this.options = { ...StaticVariableMapView.defaultOptions, ...options };
    this.displayObject = new PIXI.Container();

    this.tiles = Array2D.create(cols, rows, null);
    this.values = Array2D.create(cols, rows, 0);

    Array2D.fill(this.tiles, (x, y) => {
      const newTile = new PIXI.Graphics();
      newTile.x = x * TILE_SIZE;
      newTile.y = y * TILE_SIZE;
      newTile.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      return newTile;
    });

    this.displayObject.addChild(...Array2D.flatten(this.tiles));
    Array2D.forEach(this.values, (value, x, y) => {
      this.renderTile(x, y, value);
    });
    this.displayObject.calculateBounds();
  }

  renderTile(x, y, value) {
    const color = this.colors[value] || 0xffffff;
    this.tiles[y][x]
      .clear()
      .beginFill(color)
      .drawRect(0, 0, TILE_SIZE, TILE_SIZE)
      .endFill();
  }

  update(data, reset = false) {
    Array2D.zip(this.values, data, (value, newValue, x, y) => {
      if (value !== newValue || reset) {
        this.values[y][x] = newValue;
        this.renderTile(x, y, newValue);
      }
    });
  }

  getWidth() {
    return this.width * TILE_SIZE;
  }

  getHeight() {
    return this.height * TILE_SIZE;
  }

  scaleToFit(width, height) {
    const scaleX = width / this.getWidth();
    const scaleY = height / this.getHeight();
    const scale = Math.min(scaleX, scaleY);
    this.displayObject.scale.set(scale);
  }
}

StaticVariableMapView.defaultOptions = {

};

module.exports = StaticVariableMapView;
