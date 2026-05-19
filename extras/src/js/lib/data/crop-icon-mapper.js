const Array2D = require('./array-2d');
const { findRegions } = require('./regions');
const { getTileTypeId } = require('./config-helpers');

// xmur3 string hash (public domain, by bryc). Maps a string to a
// uint32, used here as a deterministic seed for icon selection so we
// can avoid pulling in a PRNG dependency for what amounts to a single
// modulo pick per region.
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

// Splits m items across n buckets as evenly as possible, putting any
// remainder in the earliest buckets. Combined with the size-descending
// region sort in buildCropIconMap, this gives the largest regions to
// the highest-priority crop group.
function distributeCounts(m, n) {
  if (n <= 0) return [];
  const base = Math.floor(m / n);
  const extra = m - n * base;
  return Array.from({ length: n }, (_, i) => (i < extra ? base + 1 : base));
}

// Lex-smallest [x, y] cell in a region. findRegions makes no guarantee
// about cell order within a region, so we need a stable anchor to seed
// the hash — otherwise the same physical region could pick different
// icons across runs.
function canonicalAnchor(region) {
  let best = region[0];
  for (let i = 1; i < region.length; i += 1) {
    const cell = region[i];
    if (cell[0] < best[0] || (cell[0] === best[0] && cell[1] < best[1])) {
      best = cell;
    }
  }
  return best;
}

// Assigns a crop icon to every crop cell on the map. The selection
// process is:
//
//   1. Build a composite map where each crop cell is keyed by
//      `${typeId}:${orientation}`. findRegions then treats cells of
//      different orientation as separate regions, so visually distinct
//      patches don't get merged into one icon.
//   2. Sort regions by size descending. distributeCounts then splits
//      them across the priority groups defined in config.crops.priorities
//      — largest regions go to the highest-priority group, smaller ones
//      to lower-priority groups.
//   3. Within each group, pick an icon from that group's list using a
//      hash of (anchor x, anchor y, region size, hour). The anchor +
//      size make the pick stable for an unchanged region; the hour
//      term lets icons drift over the course of a day while staying
//      stable within an hour.
function buildCropIconMap(config, city, hour = new Date().getHours()) {
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

  // Largest regions first; ties broken by findRegions' original order
  // so the assignment is deterministic across runs.
  const sorted = regions
    .map((region, idx) => ({ region, idx }))
    .sort((a, b) => (b.region.length - a.region.length) || (a.idx - b.idx));

  const counts = distributeCounts(sorted.length, n);

  let cursor = 0;
  counts.forEach((k, g) => {
    if (k === 0) return;
    const entry = priorities[g];
    const list = Array.isArray(entry) ? entry : [entry];
    for (let j = 0; j < k; j += 1) {
      const { region } = sorted[cursor];
      cursor += 1;
      const anchor = canonicalAnchor(region);
      const seed = xmur3(`${anchor[0]}:${anchor[1]}:${region.length}:${hour}`);
      const icon = list[seed % list.length];
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
};
