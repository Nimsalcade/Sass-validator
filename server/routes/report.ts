import express from 'express';
import { makeReport } from '../services/reportGenerator.js';
import { generateReportPDF, saveTempPDF, cleanupTempFile } from '../services/pdfGenerator.js';
import type { ProjectData } from '../types/report.js';

export const reportRouter = express.Router();

reportRouter.post('/generate', async (req, res) => {
  try {
    const projectData: ProjectData = req.body.project;

    if (!projectData || !projectData.name) {
      return res.status(400).json({ error: 'Project data is required' });
    }

    const reportData = makeReport(projectData);
    const pdfBuffer = await generateReportPDF(reportData);
    const reportId = projectData.id || 'unknown';
    const filepath = await saveTempPDF(pdfBuffer, reportId);

    const fileId = filepath.split('/').pop() || 'report.pdf';

    res.json({
      success: true,
      reportId: fileId,
      downloadUrl: `/api/reports/download/${fileId}`,
    });

    setTimeout(async () => {
      await cleanupTempFile(filepath);
    }, 5 * 60 * 1000);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

reportRouter.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId || !fileId.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const { promises: fs } = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filepath = path.join(__dirname, '../../temp', fileId);

    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ error: 'Report not found or has expired' });
    }

    const fileBuffer = await fs.readFile(filepath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="validation-report-${Date.now()}.pdf"`);
    res.send(fileBuffer);

    setTimeout(async () => {
      await cleanupTempFile(filepath);
    }, 1000);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ 
      error: 'Failed to download report',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
