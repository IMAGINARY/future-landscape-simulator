/**
 * IntervalMapper class to map numerical values to defined intervals.
 *
 * Intervals are defined as an object where keys are interval ids and values are strings
 * that define the interval using mathematical notation, e.g.:
 * - "[0,10)" means values from 0 (inclusive) to 10 (exclusive)
 * - "(10,20]" means values from 10 (exclusive) to 20 (inclusive)
 * - "(-inf,0)" means values less than 0
 * - "[20,inf)" means values greater than or equal to 20
 */
class IntervalMapper {
  constructor(intervalDefinitions) {
    this.intervals = IntervalMapper.parseIntervalMapping(intervalDefinitions);
  }

  mapValueToInterval(value) {
    for (const interval of this.intervals) {
      const lowerCheck = interval.lowerInclusive ? value >= interval.lowerBound : value > interval.lowerBound;
      const upperCheck = interval.upperInclusive ? value <= interval.upperBound : value < interval.upperBound;
      if (lowerCheck && upperCheck) {
        return interval.id;
      }
    }
    return null; // Value does not fall within any defined interval
  }

  /**
   * Parses interval definitions and returns an array of interval objects.
   * @param {Object} intervalDefinitions
   * @param {boolean} allowGaps
   * @return {{lowerBound: number|number, upperBound: number, lowerInclusive: boolean, upperInclusive: boolean}[]}
   */
  static parseIntervalMapping(intervalDefinitions, allowGaps = false) {
    const intervals = Object.entries(intervalDefinitions).map(([id, definition]) => {
      const interval = IntervalMapper.parseIntervalDefinition(definition);
      interval.id = id;
      return interval;
    });

    // Sort intervals by lower bound for easier searching
    intervals.sort((a, b) => a.lowerBound - b.lowerBound);

    // Validate intervals do not overlap
    for (let i = 1; i < intervals.length; i++) {
      const prev = intervals[i - 1];
      const curr = intervals[i];
      // Overlap occurs if current lower bound is less than previous upper bound,
      // or if they are equal and both sides include the boundary (both inclusive).
      if (
        curr.lowerBound < prev.upperBound ||
        (curr.lowerBound === prev.upperBound && (prev.upperInclusive && curr.lowerInclusive))
      ) {
        throw new Error(`Intervals overlap between "${prev.id}" and "${curr.id}"`);
      }
    }

    if (!allowGaps) {
      // Validate intervals cover the entire number line
      if (intervals[0].lowerBound !== -Infinity) {
        throw new Error('Intervals do not cover the entire number line: missing lower bound');
      }
      if (intervals[intervals.length - 1].upperBound !== Infinity) {
        throw new Error('Intervals do not cover the entire number line: missing upper bound');
      }
      for (let i = 1; i < intervals.length; i++) {
        const prev = intervals[i - 1];
        const curr = intervals[i];
        if (prev.upperBound < curr.lowerBound ||
            (prev.upperBound === curr.lowerBound && !(prev.upperInclusive || curr.lowerInclusive))) {
          throw new Error(`Intervals do not cover the entire number line: gap detected between "${prev.id}" and "${curr.id}"`);
        }
      }
    }

    return intervals;
  }

  /**
   * Parses an interval definition string and returns an object with the interval details.
   *
   * @param definition
   */
  static parseIntervalDefinition(definition) {
    const intervalRegex = /^([\[(])(-?inf|-?\d+(\.\d+)?),\s*(-?inf|-?\d+(\.\d+)?)([\])])$/;
    const match = definition.match(intervalRegex);
    if (!match) {
      throw new Error(`Invalid interval definition: ${definition}`);
    }

    const lowerInclusive = match[1] === '[';
    const upperInclusive = match[6] === ']';
    const lowerBound = match[2] === '-inf' ? -Infinity : parseFloat(match[2]);
    const upperBound = match[4] === 'inf' ? Infinity : parseFloat(match[4]);

    if (lowerBound > upperBound) {
      throw new Error(`Invalid interval: lower bound ${lowerBound} is greater than upper bound ${upperBound}`);
    }

    return {
      lowerBound,
      upperBound,
      lowerInclusive,
      upperInclusive
    };
  }
}

module.exports = IntervalMapper;
