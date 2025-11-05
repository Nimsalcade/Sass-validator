# Quick Start Guide - Report Export Feature

This guide will help you quickly set up and test the report export feature.

## Prerequisites

- Node.js 18+
- pnpm installed (`npm install -g pnpm`)
- Playwright system dependencies (will be installed below)

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Install system dependencies for Playwright:
```bash
sudo apt-get install -y libnspr4 libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 \
  libcups2t64 libxkbcommon0 libatspi2.0-0t64 libxcomposite1 libxdamage1 \
  libxfixes3 libxrandr2 libgbm1 libcairo2 libpango-1.0-0 libasound2t64
```

## Running the Application

### Option 1: Run Both Services Concurrently (Recommended)

```bash
pnpm run dev:all
```

This starts both the frontend (port 5173) and backend server (port 3001).

### Option 2: Run Separately

Terminal 1 - Backend:
```bash
pnpm run dev:server
```

Terminal 2 - Frontend:
```bash
pnpm run dev
```

## Testing the Feature

1. Open your browser to `http://localhost:5173`

2. Sign in with demo credentials:
   - Email: `demo@example.com`
   - Password: `password123`

3. After signing in, you'll see the "Export Validation Report" section

4. Click "Export PDF Report" button

5. A PDF will be generated and downloaded automatically

## Running Tests

### Unit Tests
```bash
pnpm run test
```

### E2E Tests
```bash
pnpm run test:e2e
```

### Type Checking
```bash
pnpm run typecheck
```

### Linting
```bash
pnpm run lint
```

## What's Included in the Report

The generated PDF report includes:

1. **Citations** - All referenced sources (displayed first)
2. **Summary Score** - Overall validation score with category breakdowns
3. **Key Proof Points** - Evidence supporting the business opportunity
4. **Identified Risks** - Potential challenges with severity levels
5. **Recommended Next Steps** - Actionable recommendations
6. **Research Summary** - Comprehensive analysis narrative

## API Documentation

### Generate Report

**Endpoint:** `POST http://localhost:3001/api/reports/generate`

**Request Body:**
```json
{
  "project": {
    "id": "proj-123",
    "name": "My SaaS Project",
    "description": "Project description",
    "industry": "Software",
    "targetMarket": "B2B",
    "url": "https://example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "report-proj-123-1234567890.pdf",
  "downloadUrl": "/api/reports/download/report-proj-123-1234567890.pdf"
}
```

### Download Report

**Endpoint:** `GET http://localhost:3001/api/reports/download/:fileId`

Returns the PDF file for download.

## Troubleshooting

### Issue: Playwright browser not launching

**Solution:** Ensure system dependencies are installed:
```bash
sudo apt-get update
sudo apt-get install -y libnspr4 libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 \
  libcups2t64 libxkbcommon0 libatspi2.0-0t64 libxcomposite1 libxdamage1 \
  libxfixes3 libxrandr2 libgbm1 libcairo2 libpango-1.0-0 libasound2t64
```

### Issue: Port already in use

**Solution:** Kill the process using the port:
```bash
# For frontend (port 5173)
lsof -ti:5173 | xargs kill -9

# For backend (port 3001)
lsof -ti:3001 | xargs kill -9
```

### Issue: PDF generation fails

**Solution:** Check that:
1. Backend server is running on port 3001
2. `temp/` directory is writable
3. Playwright is properly installed

## Project Structure

```
├── server/                    # Backend server
│   ├── index.ts              # Express server entry point
│   ├── routes/               # API routes
│   │   └── report.ts         # Report generation endpoints
│   ├── services/             # Business logic
│   │   ├── pdfGenerator.ts   # PDF generation with Playwright
│   │   └── reportGenerator.ts # Report data compilation
│   ├── templates/            # HTML templates
│   │   └── reportTemplate.ts # Report HTML template with styling
│   └── types/                # TypeScript types
│       └── report.ts         # Report data types
├── src/                      # Frontend
│   ├── components/           # React components
│   │   └── ReportExport.tsx  # Export button component
│   ├── App.tsx               # Main app component
│   └── styles.css            # Global styles
└── tests/                    # Test files
    ├── unit/                 # Unit tests
    └── e2e/                  # End-to-end tests
```

## Next Steps

- Customize the report template in `server/templates/reportTemplate.ts`
- Modify report data in `server/services/reportGenerator.ts`
- Add custom branding and styling
- Integrate with real data sources
- Add authentication and authorization

## Support

For more detailed information, see:
- [Report Export Documentation](docs/REPORT_EXPORT.md)
- [Main README](README.md)
