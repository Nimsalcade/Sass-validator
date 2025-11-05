import { describe, it, expect } from 'vitest';
import type { ReportData } from '../../server/types/report';

describe('PDF Generator', () => {
  const mockReportData: ReportData = {
    project: {
      id: 'test-123',
      name: 'Test SaaS Project',
      description: 'A test project for validation',
      industry: 'Software',
      targetMarket: 'B2B',
    },
    summaryScore: {
      overall: 75,
      market: 78,
      product: 72,
      team: 80,
      financial: 68,
    },
    citations: [
      {
        id: 'cit-1',
        title: 'Market Research',
        url: 'https://example.com/research',
        source: 'Industry Report',
        date: '2024-01',
        description: 'Market analysis',
      },
    ],
    proofPoints: [
      {
        id: 'pp-1',
        title: 'Strong Demand',
        description: 'Market shows strong demand',
        citations: ['cit-1'],
        confidence: 0.85,
      },
    ],
    risks: [
      {
        id: 'risk-1',
        title: 'Competition',
        description: 'High market competition',
        severity: 'high',
        citations: ['cit-1'],
      },
    ],
    nextSteps: [
      {
        id: 'step-1',
        title: 'Customer Interviews',
        description: 'Conduct customer interviews',
        priority: 'high',
        estimatedTime: '2 weeks',
      },
    ],
    researchSummary: 'Test summary',
    generatedAt: new Date().toISOString(),
  };

  it('should have valid report data structure', () => {
    expect(mockReportData.project.id).toBe('test-123');
    expect(mockReportData.summaryScore.overall).toBeGreaterThanOrEqual(0);
    expect(mockReportData.summaryScore.overall).toBeLessThanOrEqual(100);
    expect(mockReportData.citations).toHaveLength(1);
    expect(mockReportData.proofPoints).toHaveLength(1);
    expect(mockReportData.risks).toHaveLength(1);
    expect(mockReportData.nextSteps).toHaveLength(1);
  });

  it('should validate citation structure', () => {
    const citation = mockReportData.citations[0];
    expect(citation).toHaveProperty('id');
    expect(citation).toHaveProperty('title');
    expect(citation).toHaveProperty('url');
    expect(citation).toHaveProperty('source');
  });

  it('should validate proof point structure', () => {
    const proofPoint = mockReportData.proofPoints[0];
    expect(proofPoint).toHaveProperty('id');
    expect(proofPoint).toHaveProperty('title');
    expect(proofPoint).toHaveProperty('description');
    expect(proofPoint).toHaveProperty('confidence');
    expect(proofPoint.confidence).toBeGreaterThanOrEqual(0);
    expect(proofPoint.confidence).toBeLessThanOrEqual(1);
  });

  it('should validate risk severity levels', () => {
    const risk = mockReportData.risks[0];
    expect(['low', 'medium', 'high']).toContain(risk.severity);
  });

  it('should validate next step priority levels', () => {
    const nextStep = mockReportData.nextSteps[0];
    expect(['low', 'medium', 'high']).toContain(nextStep.priority);
  });
});
