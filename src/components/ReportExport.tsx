import { useState } from 'react';

interface ProjectData {
  id: string;
  name: string;
  description: string;
  industry?: string;
  targetMarket?: string;
  url?: string;
}

interface ReportExportProps {
  projectData: ProjectData;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function ReportExport({ projectData }: ReportExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setIsGenerating(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project: projectData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const data = await response.json();
      
      if (data.success && data.downloadUrl) {
        const fullDownloadUrl = `${API_BASE_URL}${data.downloadUrl}`;
        setDownloadUrl(fullDownloadUrl);
        
        const link = document.createElement('a');
        link.href = fullDownloadUrl;
        link.download = `validation-report-${projectData.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="report-export">
      <h3>Export Validation Report</h3>
      <p>Generate a comprehensive PDF report including summary score, proof points, risks, and citations.</p>
      
      {error && (
        <div className="error" role="alert" data-testid="export-error">
          {error}
        </div>
      )}
      
      {downloadUrl && (
        <div className="success" data-testid="export-success">
          Report generated successfully! Download should start automatically.
        </div>
      )}
      
      <button
        type="button"
        onClick={handleExport}
        disabled={isGenerating}
        className="export-button"
        data-testid="export-button"
      >
        {isGenerating ? 'Generating Report...' : 'Export PDF Report'}
      </button>
    </div>
  );
}
