import type { ReportData } from '../types/report.js';

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background: #ffffff;
    padding: 40px;
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 50px;
    padding-bottom: 30px;
    border-bottom: 3px solid #2563eb;
  }

  .logo {
    font-size: 32px;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 10px;
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #1a1a1a;
  }

  .subtitle {
    font-size: 14px;
    color: #6b7280;
  }

  .section {
    margin-bottom: 40px;
    page-break-inside: avoid;
  }

  .section-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #1a1a1a;
    padding-bottom: 10px;
    border-bottom: 2px solid #e5e7eb;
  }

  .project-info {
    background: #f9fafb;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
  }

  .project-info h2 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #1a1a1a;
  }

  .project-info p {
    margin-bottom: 8px;
    color: #4b5563;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 30px;
  }

  .score-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }

  .score-card.overall {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  }

  .score-value {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .score-label {
    font-size: 14px;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .citations-list {
    list-style: none;
    counter-reset: citation-counter;
  }

  .citation {
    counter-increment: citation-counter;
    margin-bottom: 20px;
    padding: 15px;
    background: #f9fafb;
    border-left: 4px solid #2563eb;
    border-radius: 4px;
  }

  .citation::before {
    content: "[" counter(citation-counter) "] ";
    font-weight: 700;
    color: #2563eb;
  }

  .citation-title {
    font-weight: 600;
    margin-bottom: 5px;
    color: #1a1a1a;
  }

  .citation-url {
    font-size: 12px;
    color: #2563eb;
    word-break: break-all;
    text-decoration: none;
    display: block;
    margin-bottom: 5px;
  }

  .citation-meta {
    font-size: 12px;
    color: #6b7280;
  }

  .proof-point, .risk, .next-step {
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .proof-point {
    background: #ecfdf5;
    border-left: 4px solid #10b981;
  }

  .risk {
    background: #fef2f2;
    border-left: 4px solid #ef4444;
  }

  .risk.medium {
    background: #fef3c7;
    border-left-color: #f59e0b;
  }

  .risk.low {
    background: #f0f9ff;
    border-left-color: #3b82f6;
  }

  .next-step {
    background: #f5f3ff;
    border-left: 4px solid #8b5cf6;
  }

  .item-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1a1a1a;
  }

  .item-description {
    font-size: 14px;
    color: #4b5563;
    margin-bottom: 10px;
  }

  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .badge-high {
    background: #fee2e2;
    color: #991b1b;
  }

  .badge-medium {
    background: #fef3c7;
    color: #92400e;
  }

  .badge-low {
    background: #dbeafe;
    color: #1e40af;
  }

  .badge-confidence {
    background: #dbeafe;
    color: #1e40af;
    margin-left: 10px;
  }

  .research-summary {
    background: #f9fafb;
    padding: 20px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.8;
    color: #374151;
  }

  .footer {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
  }

  @media print {
    body {
      padding: 20px;
    }
    
    .section {
      page-break-inside: avoid;
    }
  }
`;

export function generateReportHTML(data: ReportData): string {
  const getCitationNumbers = (citationIds: string[]) => {
    return citationIds
      .map(id => {
        const index = data.citations.findIndex(c => c.id === id);
        return index !== -1 ? `[${index + 1}]` : '';
      })
      .filter(Boolean)
      .join(' ');
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaS Validation Report - ${data.project.name}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="logo">SaaS Validator</div>
      <h1 class="title">${data.project.name}</h1>
      <p class="subtitle">Validation Report - Generated ${new Date(data.generatedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
    </header>

    <section class="project-info">
      <h2>${data.project.name}</h2>
      <p>${data.project.description}</p>
      ${data.project.industry ? `<p><strong>Industry:</strong> ${data.project.industry}</p>` : ''}
      ${data.project.targetMarket ? `<p><strong>Target Market:</strong> ${data.project.targetMarket}</p>` : ''}
      ${data.project.url ? `<p><strong>URL:</strong> <a href="${data.project.url}">${data.project.url}</a></p>` : ''}
    </section>

    <section class="section">
      <h2 class="section-title">Summary Score</h2>
      <div class="score-grid">
        <div class="score-card overall">
          <div class="score-value">${data.summaryScore.overall}/100</div>
          <div class="score-label">Overall Score</div>
        </div>
        <div class="score-card">
          <div class="score-value">${data.summaryScore.market}/100</div>
          <div class="score-label">Market</div>
        </div>
        <div class="score-card">
          <div class="score-value">${data.summaryScore.product}/100</div>
          <div class="score-label">Product</div>
        </div>
        <div class="score-card">
          <div class="score-value">${data.summaryScore.team}/100</div>
          <div class="score-label">Team</div>
        </div>
        <div class="score-card">
          <div class="score-value">${data.summaryScore.financial}/100</div>
          <div class="score-label">Financial</div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Citations</h2>
      <ol class="citations-list">
        ${data.citations.map(citation => `
          <li class="citation">
            <div class="citation-title">${citation.title}</div>
            <a href="${citation.url}" class="citation-url">${citation.url}</a>
            <div class="citation-meta">
              ${citation.source}${citation.date ? ` • ${citation.date}` : ''}
            </div>
            ${citation.description ? `<div class="item-description">${citation.description}</div>` : ''}
          </li>
        `).join('')}
      </ol>
    </section>

    <section class="section">
      <h2 class="section-title">Key Proof Points</h2>
      ${data.proofPoints.map(point => `
        <div class="proof-point">
          <div class="item-title">
            ${point.title}
            <span class="badge badge-confidence">${Math.round(point.confidence * 100)}% confidence</span>
          </div>
          <div class="item-description">${point.description}</div>
          ${point.citations.length > 0 ? `<div class="citation-meta">Sources: ${getCitationNumbers(point.citations)}</div>` : ''}
        </div>
      `).join('')}
    </section>

    <section class="section">
      <h2 class="section-title">Identified Risks</h2>
      ${data.risks.map(risk => `
        <div class="risk ${risk.severity}">
          <div class="item-title">
            ${risk.title}
            <span class="badge badge-${risk.severity}">${risk.severity}</span>
          </div>
          <div class="item-description">${risk.description}</div>
          ${risk.mitigation ? `<div class="item-description"><strong>Mitigation:</strong> ${risk.mitigation}</div>` : ''}
          ${risk.citations.length > 0 ? `<div class="citation-meta">Sources: ${getCitationNumbers(risk.citations)}</div>` : ''}
        </div>
      `).join('')}
    </section>

    <section class="section">
      <h2 class="section-title">Recommended Next Steps</h2>
      ${data.nextSteps.map(step => `
        <div class="next-step">
          <div class="item-title">
            ${step.title}
            <span class="badge badge-${step.priority}">${step.priority} priority</span>
          </div>
          <div class="item-description">${step.description}</div>
          ${step.estimatedTime ? `<div class="citation-meta">Estimated time: ${step.estimatedTime}</div>` : ''}
        </div>
      `).join('')}
    </section>

    <section class="section">
      <h2 class="section-title">Research Summary</h2>
      <div class="research-summary">
        ${data.researchSummary}
      </div>
    </section>

    <footer class="footer">
      <p>Generated by SaaS Validator on ${new Date(data.generatedAt).toLocaleString()}</p>
      <p>This report is for informational purposes only and should not be considered as financial or investment advice.</p>
    </footer>
  </div>
</body>
</html>
  `.trim();
}
