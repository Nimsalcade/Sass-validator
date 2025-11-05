# File Upload & PDF Parser

A Next.js application with tRPC backend that provides file upload functionality with S3-compatible storage, PDF parsing, and content extraction.

## Features

- **File Upload**: Drag-and-drop file upload with progress tracking
- **S3 Integration**: Configurable S3-compatible storage (AWS S3, MinIO, etc.)
- **PDF Parsing**: Automatic PDF content extraction using pdf-parse
- **File Validation**: Size limits, MIME type validation, and basic PII detection
- **Real-time Updates**: Live file status updates during upload and parsing
- **Content Display**: View extracted text, metadata, and document information

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC, Zod validation
- **Storage**: AWS SDK v2 (S3-compatible)
- **PDF Processing**: pdf-parse, pdfjs-dist
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for local MinIO development)

### Development Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   For development with MinIO, the default `.env.local` is already configured.

3. **Start MinIO (for local S3-compatible storage)**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
   
   This starts MinIO on port 9000 with a web console on port 9001.

4. **Create the uploads bucket**:
   - Visit http://localhost:9001
   - Login with `minioadmin` / `minioadmin`
   - Create a bucket named `uploads`

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Files**: 
   - Drag and drop files onto the upload area
   - Or click to select files
   - Supported formats: PDF, JPEG, PNG
   - Maximum file size: 10MB

2. **PDF Parsing**:
   - PDF files are automatically parsed after upload
   - Extracted text, metadata, and document info are displayed
   - Click "Parse PDF" to manually trigger parsing

3. **File Management**:
   - View all uploaded files in the file list
   - Monitor upload and parsing progress
   - View extracted content and metadata

## Configuration

### Environment Variables

```bash
# AWS S3 Configuration (for production)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# For development with MinIO
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=uploads
```

### Production Deployment

For production deployment:

1. Configure real AWS S3 credentials
2. Set appropriate CORS policies on your S3 bucket
3. Ensure proper security measures are in place
4. Consider implementing authentication/authorization

## File Validation

The application includes several validation measures:

- **File Size**: Maximum 10MB per file
- **File Types**: Only PDF, JPEG, PNG allowed
- **PII Detection**: Basic regex patterns for sensitive data in filenames
  - Credit card numbers
  - Social Security Numbers
  - Email addresses

## API Endpoints

The application uses tRPC for type-safe API communication:

- `getPresignedUrl`: Generate S3 presigned upload URL
- `registerFile`: Register uploaded file metadata
- `parsePDF`: Extract content from PDF files
- `getFiles`: Retrieve list of uploaded files

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router
├── components/             # React components
├── server/                 # tRPC server configuration
├── services/              # Business logic services
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

### Adding New Features

1. Add new tRPC procedures in `src/server/index.ts`
2. Implement business logic in `src/server/services/`
3. Create React components in `src/components/`
4. Define types in `src/types/`

## Troubleshooting

### Common Issues

1. **MinIO Connection Errors**:
   - Ensure Docker is running
   - Check that MinIO container is up: `docker ps`
   - Verify bucket exists in MinIO console

2. **Upload Failures**:
   - Check file size and type validation
   - Verify S3 credentials and endpoint configuration
   - Check browser console for detailed error messages

3. **PDF Parsing Issues**:
   - Ensure file is a valid PDF
   - Check server logs for parsing errors
   - Large PDFs may take time to process

## License

This project is licensed under the MIT License.