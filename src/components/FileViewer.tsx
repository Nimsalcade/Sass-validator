'use client';

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/components/TRPCProvider';
import type { UploadedFile } from '@/types/file';

interface FileViewerProps {
  file: UploadedFile;
  onUpdate?: (file: UploadedFile) => void;
}

export function FileViewer({ file, onUpdate }: FileViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const parsePDF = trpc.parsePDF.useMutation();

  const handleParsePDF = useCallback(async () => {
    try {
      const updatedFile = await parsePDF.mutateAsync({ fileId: file.id });
      onUpdate?.(updatedFile);
    } catch (error) {
      console.error('Failed to parse PDF:', error);
    }
  }, [file.id, parsePDF, onUpdate]);

  useEffect(() => {
    if (file.status === 'uploaded' && file.type === 'application/pdf') {
      // Trigger parsing if not already done
      handleParsePDF();
    }
  }, [file.id, file.status, file.type, handleParsePDF]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      return newExpanded;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploaded':
        return 'bg-blue-100 text-blue-800';
      case 'parsing':
        return 'bg-yellow-100 text-yellow-800';
      case 'parsed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* File Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{file.name}</h3>
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
            <span>{formatFileSize(file.size)}</span>
            <span>{file.type}</span>
            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
          {file.status}
        </span>
      </div>

      {/* Error Display */}
      {file.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{file.error}</p>
        </div>
      )}

      {/* PDF Content */}
      {file.type === 'application/pdf' && (
        <div className="space-y-4">
          {/* Parse Button */}
          {file.status === 'uploaded' && (
            <button
              onClick={handleParsePDF}
              disabled={parsePDF.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {parsePDF.isPending ? 'Parsing...' : 'Parse PDF'}
            </button>
          )}

          {/* Parsed Content */}
          {file.parsed && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">Parsed Content</h4>
                <div className="text-sm text-gray-500">
                  {file.parsed.pages} pages
                </div>
              </div>

              {/* Metadata */}
              {file.parsed.metadata && Object.keys(file.parsed.metadata).length > 0 && (
                <div className="border border-gray-200 rounded-md">
                  <button
                    onClick={() => toggleSection('metadata')}
                    className="w-full px-4 py-2 text-left font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Metadata</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedSections.has('metadata') ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.has('metadata') && (
                    <div className="px-4 pb-3 border-t border-gray-200">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(file.parsed.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Text */}
              {file.parsed.text && (
                <div className="border border-gray-200 rounded-md">
                  <button
                    onClick={() => toggleSection('text')}
                    className="w-full px-4 py-2 text-left font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Extracted Text</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedSections.has('text') ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.has('text') && (
                    <div className="px-4 pb-3 border-t border-gray-200 max-h-96 overflow-y-auto">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {file.parsed.text}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Info */}
              {file.parsed.info && Object.keys(file.parsed.info).length > 0 && (
                <div className="border border-gray-200 rounded-md">
                  <button
                    onClick={() => toggleSection('info')}
                    className="w-full px-4 py-2 text-left font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>Document Info</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedSections.has('info') ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.has('info') && (
                    <div className="px-4 pb-3 border-t border-gray-200">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(file.parsed.info, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Non-PDF Files */}
      {file.type !== 'application/pdf' && (
        <div className="text-sm text-gray-500">
          File uploaded successfully. Preview is only available for PDF files.
        </div>
      )}
    </div>
  );
}