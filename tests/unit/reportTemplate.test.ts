import { describe, it, expect } from 'vitest';
import { generateReportHTML } from '../../server/templates/reportTemplate';
import type { ReportData } from '../../server/types/report';

describe('Report Template', () => {
  const mockReportData: ReportData = {
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
    citations: [
      {
        id: 'cit-1',
        title: 'Test Citation',
        url: 'https://example.com',
        source: 'Test Source',
      },
    ],
    proofPoints: [
      {
        id: 'pp-1',
        title: 'Test Proof',
        description: 'Test proof description',
        citations: ['cit-1'],
        confidence: 0.85,
      },
    ],
    risks: [
      {
        id: 'risk-1',
        title: 'Test Risk',
        description: 'Test risk description',
        severity: 'high',
        citations: ['cit-1'],
      },
    ],
    nextSteps: [
      {
        id: 'step-1',
        title: 'Test Step',
        description: 'Test step description',
        priority: 'high',
      },
    ],
    researchSummary: 'Test research summary',
    generatedAt: new Date().toISOString(),
  };

  it('should generate valid HTML', () => {
    const html = generateReportHTML(mockReportData);
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
  });

  it('should include project name in title', () => {
    const html = generateReportHTML(mockReportData);
    
    expect(html).toContain('Test Project');
  });

  it('should include all score sections', () => {
    const html = generateReportHTML(mockReportData);
    
    expect(html).toContain('75/100');
    expect(html).toContain('78/100');
    expect(html).toContain('72/100');
    expect(html).toContain('80/100');
    expect(html).toContain('68/100');
  });

  it('should include citations section first', () => {
    const html = generateReportHTML(mockReportData);
    
    const citationsIndex = html.indexOf('Citations');
    const proofPointsIndex = html.indexOf('Key Proof Points');
    const risksIndex = html.indexOf('Identified Risks');
    
    expect(citationsIndex).toBeGreaterThan(0);
    expect(citationsIndex).toBeLessThan(proofPointsIndex);
    expect(proofPointsIndex).toBeLessThan(risksIndex);
  });

  it('should include citation in list', () => {
    const html = generateReportHTML(mockReportData);
    
    expect(html).toContain('Test Citation');
    expect(html).toContain('https://example.com');
  });

  it('should include risk with severity badge', () => {
    const html = generateReportHTML(mockReportData);
    
    expect(html).toContain('Test Risk');
    expect(html).toContain('badge-high');
  });

  it('should include next steps', () => {
    const html = generateReportHTML(mockReportData);
    
    expect(html).toContain('Test Step');
    expect(html).toContain('Test step description');
  });
});
