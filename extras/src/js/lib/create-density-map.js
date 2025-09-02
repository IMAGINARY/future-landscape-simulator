const Array2D = require('../lib/array-2d');

/**
 * Creates a density map from the given cells.
 *
 * We use an ad-hoc definition of "density", a value calculated for each cell, which identifies
 * how many cells of the same type are packed tightly around it.
 *
 * - Density 1 is the default.
 * - Density 2 means that the cell is part of a 2x2 block of the same type, or directly adjacent to
 *   one with density >= 2.
 * - Density 3 means that the cell is part of a 2x3 block of the same type.
 *
 * @param {[[Number]]} cells
 * @returns {[[Number]]} density map
 */
function createDensityMap(cells) {
  const height = cells.length;
  const width = cells[0].length;
  const directDensityMap = Array2D.create(width, height, 1);
  const densityMap = Array2D.create(width, height, 1);

  // First we iterate over the cells to find 2x2 blocks
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const cellType = cells[y][x];
      if (cellType !== 0
        && cells[y][x + 1] === cellType
        && cells[y + 1][x] === cellType
        && cells[y + 1][x + 1] === cellType) {
        // Found a 2x2 block
        // But also check if we can extend it to a 2x3 block
        const isHorizontalExtension = x < width - 2 && cells[y][x + 2] === cellType && cells[y + 1][x + 2] === cellType;
        const isVerticalExtension = y < height - 2 && cells[y + 2][x] === cellType && cells[y + 2][x + 1] === cellType;

        if (isHorizontalExtension && isVerticalExtension) {
          // 3x2 + 2x3 block (square minus far corner)
          directDensityMap[y][x] = 3;
          directDensityMap[y][x + 1] = 3;
          directDensityMap[y][x + 2] = 3;
          directDensityMap[y + 1][x] = 3;
          directDensityMap[y + 1][x + 1] = 3;
          directDensityMap[y + 1][x + 2] = 3;
          directDensityMap[y + 2][x] = 3;
          directDensityMap[y + 2][x + 1] = 3;
        } else if (isHorizontalExtension) {
          // 3x2 block
          directDensityMap[y][x] = 3;
          directDensityMap[y][x + 1] = 3;
          directDensityMap[y][x + 2] = 3;
          directDensityMap[y + 1][x] = 3;
          directDensityMap[y + 1][x + 1] = 3;
          directDensityMap[y + 1][x + 2] = 3;
        } else if (isVerticalExtension) {
          // 2x3 block
          directDensityMap[y][x] = 3;
          directDensityMap[y][x + 1] = 3;
          directDensityMap[y + 1][x] = 3;
          directDensityMap[y + 1][x + 1] = 3;
          directDensityMap[y + 2][x] = 3;
          directDensityMap[y + 2][x + 1] = 3;
        } else {
          // just a 2x2 block
          directDensityMap[y][x] = Math.max(directDensityMap[y][x], 2);
          directDensityMap[y][x + 1] = Math.max(directDensityMap[y][x + 1], 2);
          directDensityMap[y + 1][x] = Math.max(directDensityMap[y + 1][x], 2);
          directDensityMap[y + 1][x + 1] = Math.max(directDensityMap[y + 1][x + 1], 2);
        }
      }
    }
  }

  // Now we create the density map. Each cell gets density based on its own direct density
  // and whether it's adjacent to other cells of the same type with density >= 2
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cellType = cells[y][x];
      densityMap[y][x] = Math.max(
        directDensityMap[y][x],
        x > 0 && cells[y][x - 1] === cellType && directDensityMap[y][x - 1] >= 2 ? 2 : 1,
        x < width - 1 && cells[y][x + 1] === cellType && directDensityMap[y][x + 1] >= 2 ? 2 : 1,
        y > 0 && cells[y - 1][x] === cellType && directDensityMap[y - 1][x] >= 2 ? 2 : 1,
        y < height - 1 && cells[y + 1][x] === cellType && directDensityMap[y + 1][x] >= 2 ? 2 : 1,
      );
    }
  }

  return densityMap;
}

module.exports = createDensityMap;
