# Report Export Feature

## Overview

The Report Export feature allows users to generate comprehensive PDF reports of their SaaS validation analysis. Reports are generated server-side using Playwright's PDF generation capabilities and include all key metrics, citations, and recommendations.

## Architecture

### Frontend
- **Component**: `src/components/ReportExport.tsx`
- Displays an export button that triggers the report generation
- Handles the download flow and user feedback
- Shows loading states and error messages

### Backend
- **Server**: `server/index.ts`
- **Routes**: `server/routes/report.ts`
- **Services**: 
  - `server/services/reportGenerator.ts` - Compiles project data into report structure
  - `server/services/pdfGenerator.ts` - Uses Playwright to generate PDF from HTML
- **Templates**: `server/templates/reportTemplate.ts` - HTML template with styling

## Report Contents

Generated reports include the following sections in order:

1. **Citations** (First Section)
   - Numbered list of all sources
   - Includes title, URL, source, and date
   - Referenced throughout the report

2. **Summary Score**
   - Overall validation score (0-100)
   - Breakdown by category: Market, Product, Team, Financial
   - Displayed with visual score cards

3. **Key Proof Points**
   - Evidence supporting the business opportunity
   - Confidence levels for each point
   - Citations for supporting data

4. **Identified Risks**
   - Potential challenges and concerns
   - Severity levels (low, medium, high)
   - Mitigation strategies
   - Supporting citations

5. **Recommended Next Steps**
   - Actionable recommendations
   - Priority levels
   - Estimated time requirements

6. **Research Summary**
   - Comprehensive analysis narrative
   - Overall assessment and recommendations

## API Endpoints

### POST `/api/reports/generate`

Generates a new report PDF.

**Request Body:**
```json
{
  "project": {
    "id": "string",
    "name": "string",
    "description": "string",
    "industry": "string (optional)",
    "targetMarket": "string (optional)",
    "url": "string (optional)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "report-123-1234567890.pdf",
  "downloadUrl": "/api/reports/download/report-123-1234567890.pdf"
}
```

### GET `/api/reports/download/:fileId`

Downloads a generated report PDF.

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="validation-report-{timestamp}.pdf"`
- Automatically deleted after download

## Security Features

1. **Temporary File Storage**: PDFs are stored in a secure temp directory
2. **Automatic Cleanup**: Files are automatically deleted after:
   - 5 minutes after generation
   - Immediately after download
3. **File ID Validation**: Only valid PDF file IDs are accepted
4. **Path Traversal Prevention**: File paths are validated and sanitized

## Styling & Branding

The report template follows brand guidelines with:
- Blue (#2563eb) as the primary brand color
- Professional typography using system fonts
- Consistent spacing and layout
- Print-optimized CSS with page break controls
- Gradient backgrounds for score cards
- Color-coded sections (green for proof points, red for risks, purple for next steps)

## Usage

### Development

1. Start the backend server:
```bash
pnpm run dev:server
```

2. Start the frontend:
```bash
pnpm run dev
```

3. Or run both concurrently:
```bash
pnpm run dev:all
```

### Production

1. Build both frontend and backend:
```bash
pnpm run build
pnpm run build:server
```

2. Start the server:
```bash
pnpm run start:server
```

## Testing

### Unit Tests
```bash
pnpm run test
```

### E2E Tests
```bash
pnpm run test:e2e
```

## Environment Variables

Add to `.env.development`:
```
VITE_API_URL=http://localhost:3001
```

## Future Enhancements

- [ ] Store reports in cloud storage (S3)
- [ ] Add report history/archive
- [ ] Allow custom branding/logos
- [ ] Support multiple export formats (Word, HTML)
- [ ] Add report scheduling/automation
- [ ] Include charts and graphs
- [ ] Support collaborative annotations
