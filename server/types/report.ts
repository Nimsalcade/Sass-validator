export interface Citation {
  id: string;
  title: string;
  url: string;
  source: string;
  date?: string;
  description?: string;
}

export interface ProofPoint {
  id: string;
  title: string;
  description: string;
  citations: string[];
  confidence: number;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
  citations: string[];
}

export interface NextStep {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  industry?: string;
  targetMarket?: string;
  url?: string;
}

export interface ReportData {
  project: ProjectData;
  summaryScore: {
    overall: number;
    market: number;
    product: number;
    team: number;
    financial: number;
  };
  citations: Citation[];
  proofPoints: ProofPoint[];
  risks: Risk[];
  nextSteps: NextStep[];
  researchSummary: string;
  generatedAt: string;
}
