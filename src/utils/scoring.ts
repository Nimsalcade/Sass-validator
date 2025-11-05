export interface ScoreSummary {
  total: number;
  average: number;
  max: number;
  min: number;
  count: number;
}

export function calculateScore(values: Array<number | null | undefined>): ScoreSummary {
  const sanitized = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (sanitized.length === 0) {
    return {
      total: 0,
      average: 0,
      max: 0,
      min: 0,
      count: 0
    };
  }

  const total = sanitized.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...sanitized);
  const min = Math.min(...sanitized);
  const average = Number((total / sanitized.length).toFixed(2));

  return {
    total,
    average,
    max,
    min,
    count: sanitized.length
  };
}
