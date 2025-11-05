import { chromium } from 'playwright';
import type { ReportData } from '../types/report.js';
import { generateReportHTML } from '../templates/reportTemplate.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateReportPDF(data: ReportData): Promise<Buffer> {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    const html = generateReportHTML(data);
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

export async function saveTempPDF(pdfBuffer: Buffer, reportId: string): Promise<string> {
  const tempDir = path.join(__dirname, '../../temp');
  
  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true });
  }

  const filename = `report-${reportId}-${Date.now()}.pdf`;
  const filepath = path.join(tempDir, filename);
  
  await fs.writeFile(filepath, pdfBuffer);
  
  return filepath;
}

export async function cleanupTempFile(filepath: string): Promise<void> {
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
}
