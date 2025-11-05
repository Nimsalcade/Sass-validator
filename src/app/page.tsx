'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFileUploaded = () => {
    // Trigger a refresh of the file list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            File Upload & PDF Parser
          </h1>
          <p className="text-lg text-gray-600">
            Upload files and automatically parse PDF content
          </p>
        </div>

        <div className="space-y-8">
          <FileUpload onFileUploaded={handleFileUploaded} />
          <FileList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}