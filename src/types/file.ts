export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  s3Key: string;
  uploadedAt: string;
  status: 'uploading' | 'uploaded' | 'parsing' | 'parsed' | 'failed';
  parsed?: {
    text: string;
    pages: number;
    info?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
  error?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  bucket: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}