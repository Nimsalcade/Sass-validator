'use client';

import { trpc } from '@/components/TRPCProvider';
import { FileViewer } from './FileViewer';

export function FileList() {
  const { data: files = [], isLoading, error, refetch } = trpc.getFiles.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading files: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No files uploaded yet.</p>
      </div>
    );
  }

  const handleFileUpdate = () => {
    // Refetch the files list to show updated status
    refetch();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Uploaded Files</h2>
      {files.map((file) => (
        <FileViewer
          key={file.id}
          file={file}
          onUpdate={handleFileUpdate}
        />
      ))}
    </div>
  );
}