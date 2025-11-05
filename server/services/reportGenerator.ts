import type { ReportData, ProjectData } from '../types/report.js';

export function makeReport(projectData: ProjectData): ReportData {
  const mockCitations = [
    {
      id: 'cit-1',
      title: 'Market Research: SaaS Industry Growth 2024',
      url: 'https://example.com/market-research',
      source: 'Industry Report',
      date: '2024-01',
      description: 'Comprehensive analysis of SaaS market trends and growth projections',
    },
    {
      id: 'cit-2',
      title: 'Competitive Analysis: Similar Products',
      url: 'https://example.com/competitive-analysis',
      source: 'Market Analysis',
      date: '2024-02',
      description: 'Detailed comparison of competing products in the market',
    },
    {
      id: 'cit-3',
      title: 'Customer Feedback and Reviews',
      url: 'https://example.com/customer-reviews',
      source: 'User Research',
      date: '2024-03',
      description: 'Aggregated customer feedback from multiple sources',
    },
    {
      id: 'cit-4',
      title: 'Technical Architecture Review',
      url: 'https://example.com/tech-review',
      source: 'Technical Documentation',
      date: '2024-01',
      description: 'Analysis of technical implementation and scalability',
    },
    {
      id: 'cit-5',
      title: 'Financial Projections and Market Size',
      url: 'https://example.com/financial-projections',
      source: 'Financial Analysis',
      date: '2024-02',
      description: 'Market size estimation and revenue projections',
    },
  ];

  const mockProofPoints = [
    {
      id: 'pp-1',
      title: 'Strong Market Demand',
      description: 'Market analysis shows significant demand for this type of solution, with a growing TAM of $2.5B and 25% YoY growth.',
      citations: ['cit-1', 'cit-5'],
      confidence: 0.85,
    },
    {
      id: 'pp-2',
      title: 'Positive User Feedback',
      description: 'Early adopters and beta users report high satisfaction rates (4.5/5 average) and strong willingness to recommend.',
      citations: ['cit-3'],
      confidence: 0.78,
    },
    {
      id: 'pp-3',
      title: 'Competitive Advantage',
      description: 'Product offers unique features not available in competing solutions, providing clear differentiation.',
      citations: ['cit-2'],
      confidence: 0.72,
    },
    {
      id: 'pp-4',
      title: 'Scalable Architecture',
      description: 'Technical infrastructure is built on modern, scalable technologies that can support growth to 100k+ users.',
      citations: ['cit-4'],
      confidence: 0.80,
    },
  ];

  const mockRisks = [
    {
      id: 'risk-1',
      title: 'Market Competition',
      description: 'Several established players already exist in this market with significant resources and market share.',
      severity: 'high' as const,
      mitigation: 'Focus on unique features and target underserved market segments. Build strong brand differentiation.',
      citations: ['cit-2'],
    },
    {
      id: 'risk-2',
      title: 'Customer Acquisition Cost',
      description: 'Current CAC is higher than industry average, which may impact profitability in the short term.',
      severity: 'medium' as const,
      mitigation: 'Implement referral program and focus on organic growth channels. Optimize conversion funnel.',
      citations: ['cit-5'],
    },
    {
      id: 'risk-3',
      title: 'Technical Debt',
      description: 'Some areas of the codebase need refactoring to ensure long-term maintainability.',
      severity: 'low' as const,
      mitigation: 'Allocate 20% of development time to technical improvements and code quality.',
      citations: ['cit-4'],
    },
  ];

  const mockNextSteps = [
    {
      id: 'step-1',
      title: 'Conduct Customer Interviews',
      description: 'Interview 20-30 potential customers to validate problem-solution fit and gather detailed feedback on features.',
      priority: 'high' as const,
      estimatedTime: '2-3 weeks',
    },
    {
      id: 'step-2',
      title: 'Develop MVP Feature Set',
      description: 'Prioritize and develop core features identified as most valuable by target customers.',
      priority: 'high' as const,
      estimatedTime: '6-8 weeks',
    },
    {
      id: 'step-3',
      title: 'Launch Beta Program',
      description: 'Recruit 50-100 beta users to test the product and provide feedback before full launch.',
      priority: 'medium' as const,
      estimatedTime: '4 weeks',
    },
    {
      id: 'step-4',
      title: 'Refine Pricing Strategy',
      description: 'Test different pricing models and tiers to optimize for customer acquisition and revenue.',
      priority: 'medium' as const,
      estimatedTime: '2 weeks',
    },
    {
      id: 'step-5',
      title: 'Build Marketing Funnel',
      description: 'Create content marketing strategy and build automated email nurture sequences.',
      priority: 'high' as const,
      estimatedTime: '3-4 weeks',
    },
  ];

  const baseScore = 75;
  const marketScore = 78;
  const productScore = 72;
  const teamScore = 80;
  const financialScore = 68;

  const researchSummary = `
    This validation report provides a comprehensive analysis of ${projectData.name} based on extensive market research, 
    competitive analysis, and technical review. The overall assessment indicates a moderately strong opportunity with 
    several key strengths and some areas requiring attention.

    The market analysis reveals strong demand for this type of solution, with significant growth potential in the coming years. 
    The product demonstrates clear differentiation from competitors and has received positive feedback from early users. 
    The technical foundation is solid and scalable, though some areas require attention to ensure long-term maintainability.

    Key success factors include focusing on unique value propositions, maintaining close relationships with early customers, 
    and executing efficiently on the go-to-market strategy. The most significant risks relate to market competition and 
    customer acquisition costs, both of which have clear mitigation strategies.

    Overall, this project shows promise and warrants continued investment, with recommended focus on customer validation 
    and MVP development in the near term.
  `.trim();

  return {
    project: projectData,
    summaryScore: {
      overall: baseScore,
      market: marketScore,
      product: productScore,
      team: teamScore,
      financial: financialScore,
    },
    citations: mockCitations,
    proofPoints: mockProofPoints,
    risks: mockRisks,
    nextSteps: mockNextSteps,
    researchSummary,
    generatedAt: new Date().toISOString(),
  };
}
