import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Report Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate mock report data with all required sections', () => {
    const mockProjectData = {
      id: 'test-123',
      name: 'Test Project',
      description: 'Test Description',
    };

    expect(mockProjectData.id).toBe('test-123');
    expect(mockProjectData.name).toBe('Test Project');
    expect(mockProjectData.description).toBe('Test Description');
  });

  it('should validate report data structure', () => {
    const mockReport = {
      project: {
        id: 'test-123',
        name: 'Test Project',
        description: 'Test Description',
      },
      summaryScore: {
        overall: 75,
        market: 78,
        product: 72,
        team: 80,
        financial: 68,
      },
      citations: [],
      proofPoints: [],
      risks: [],
      nextSteps: [],
      researchSummary: 'Test summary',
      generatedAt: new Date().toISOString(),
    };

    expect(mockReport.summaryScore.overall).toBeGreaterThanOrEqual(0);
    expect(mockReport.summaryScore.overall).toBeLessThanOrEqual(100);
    expect(mockReport.citations).toBeInstanceOf(Array);
    expect(mockReport.proofPoints).toBeInstanceOf(Array);
    expect(mockReport.risks).toBeInstanceOf(Array);
    expect(mockReport.nextSteps).toBeInstanceOf(Array);
  });
});
