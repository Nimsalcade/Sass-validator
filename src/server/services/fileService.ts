import AWS from 'aws-sdk';
import { PDFParse } from 'pdf-parse';
import type { UploadedFile } from '@/types/file';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-key',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret',
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000', // MinIO default
  s3ForcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'uploads';

// Mock database for files
const files: Map<string, UploadedFile> = new Map();

// Ensure bucket exists
async function ensureBucket() {
  try {
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
  } catch {
    try {
      await s3.createBucket({ Bucket: BUCKET_NAME }).promise();
      console.log(`Created bucket: ${BUCKET_NAME}`);
    } catch (createError) {
      console.error('Failed to create bucket:', createError);
    }
  }
}

export async function getPresignedUrl(fileName: string, fileType: string, fileSize: number) {
  // Validate file size (10MB limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(fileType)) {
    throw new Error('Invalid file type');
  }

  const key = `uploads/${Date.now()}-${fileName}`;

  // Ensure bucket exists (for development)
  await ensureBucket();

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 60, // URL expires in 60 seconds
    ContentType: fileType,
  };

  try {
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    return {
      uploadUrl,
      key,
      bucket: BUCKET_NAME,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

export async function registerFile(fileData: {
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
}) {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const file: UploadedFile = {
    id: fileId,
    name: fileData.fileName,
    type: fileData.fileType,
    size: fileData.fileSize,
    s3Key: fileData.s3Key,
    uploadedAt: new Date().toISOString(),
    status: 'uploaded',
  };

  files.set(fileId, file);
  
  // Trigger PDF parsing if it's a PDF file
  if (fileData.fileType === 'application/pdf') {
    // In a real implementation, this would be a background job
    setTimeout(() => parsePDF(fileId), 1000);
  }

  return file;
}

export async function parsePDF(fileId: string) {
  const file = files.get(fileId);
  if (!file) {
    throw new Error('File not found');
  }

  if (file.type !== 'application/pdf') {
    throw new Error('File is not a PDF');
  }

  try {
    // Get the file from S3
    const s3Object = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key: file.s3Key,
    }).promise();

    if (!s3Object.Body) {
      throw new Error('File content is empty');
    }

    // Parse the PDF
    const pdfParser = new PDFParse({ data: s3Object.Body as Buffer });
    const textData = await pdfParser.getText();
    const infoData = await pdfParser.getInfo();
    
    // Update file with parsed content
    const updatedFile: UploadedFile = {
      ...file,
      status: 'parsed',
      parsed: {
        text: textData.text || '',
        pages: textData.pages?.length || 0,
        info: infoData,
        metadata: infoData,
      },
    };

    files.set(fileId, updatedFile);
    
    return updatedFile;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // Update file status to failed
    const failedFile: UploadedFile = {
      ...file,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to parse PDF',
    };
    
    files.set(fileId, failedFile);
    throw error;
  }
}

export function getFile(fileId: string): UploadedFile | undefined {
  return files.get(fileId);
}

export function getAllFiles(): UploadedFile[] {
  return Array.from(files.values());
}