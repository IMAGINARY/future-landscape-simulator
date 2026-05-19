const Array2D = require('./array-2d');
const { findRegions } = require('./regions');
const { getTileTypeId } = require('./config-helpers');

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function distributeCounts(m, n) {
  if (n <= 0) return [];
  const base = Math.floor(m / n);
  const extra = m - n * base;
  return Array.from({ length: n }, (_, i) => (i < extra ? base + 1 : base));
}

function permutationSequence(list, k) {
  if (list.length === 0 || k <= 0) return [];
  const out = [];
  while (out.length < k) {
    out.push(...shuffleInPlace(list.slice()));
  }
  return out.slice(0, k);
}

function buildCropIconMap(config, city) {
  const { width, height } = city.map;
  const cropsId = getTileTypeId(config, 'crops');
  const { priorities } = config.crops;
  const n = priorities.length;

  const composite = Array2D.create(width, height, '');
  const includeSet = new Set();

  Array2D.forEach(city.map.cells, (typeId, x, y) => {
    if (typeId === cropsId) {
      const key = `${typeId}:${city.getCellOrientation(x, y)}`;
      composite[y][x] = key;
      includeSet.add(key);
    }
  });

  const result = Array2D.create(width, height, null);
  if (includeSet.size === 0) return result;

  const { regions } = findRegions(composite, Array.from(includeSet));
  if (regions.length === 0) return result;

  const sorted = regions
    .map((region, idx) => ({ region, idx }))
    .sort((a, b) => (b.region.length - a.region.length) || (a.idx - b.idx));

  const counts = distributeCounts(sorted.length, n);

  let cursor = 0;
  counts.forEach((k, g) => {
    if (k === 0) return;
    const entry = priorities[g];
    const list = Array.isArray(entry) ? entry : [entry];
    const picks = permutationSequence(list, k);
    for (let j = 0; j < k; j += 1) {
      const { region } = sorted[cursor];
      cursor += 1;
      const icon = picks[j];
      region.forEach(([x, y]) => {
        result[y][x] = icon;
      });
    }
  });

  return result;
}

module.exports = {
  buildCropIconMap,
  distributeCounts,
  permutationSequence,
};
