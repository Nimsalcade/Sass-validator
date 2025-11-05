import { describe, expect, it } from 'vitest';
import { calculateScore } from '../../src/utils/scoring';

describe('calculateScore', () => {
  it('returns zeroed summary when no valid scores are provided', () => {
    expect(calculateScore([null, undefined, NaN])).toEqual({
      total: 0,
      average: 0,
      max: 0,
      min: 0,
      count: 0
    });
  });

  it('computes statistics for provided values', () => {
    expect(calculateScore([90, 75, 100, 88])).toEqual({
      total: 353,
      average: 88.25,
      max: 100,
      min: 75,
      count: 4
    });
  });

  it('ignores non-finite numbers', () => {
    expect(calculateScore([100, Infinity, 50, -Infinity, 0])).toEqual({
      total: 150,
      average: 50,
      max: 100,
      min: 0,
      count: 3
    });
  });
});
