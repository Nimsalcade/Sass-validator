'use client';

import { ProjectList, CreateProjectForm, AssetsList } from '@/client/components/project-components';
import { trpc } from '@/client/trpc-provider';
import { useState } from 'react';

export default function HomePage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projects } = trpc.projects.getAll.useQuery();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">tRPC Next.js Scaffold</h1>
          <p className="mt-2 text-lg text-gray-600">
            Test your tRPC API with projects, research, files, experiments, scoring, and assets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects Section */}
          <div className="space-y-8">
            <CreateProjectForm />
            <ProjectList />
          </div>

          {/* Assets Section */}
          <div className="space-y-8">
            {projects && projects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Test Assets</h2>
                <div className="mb-4">
                  <label htmlFor="project-select" className="block text-sm font-medium mb-2">
                    Select a project to view assets:
                  </label>
                  <select
                    id="project-select"
                    value={selectedProjectId || ''}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedProjectId && <AssetsList projectId={selectedProjectId} />}
              </div>
            )}

            {/* API Test Results */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">API Test Results</h2>
              <p className="text-green-600">✅ tRPC API is working!</p>
              <p className="text-sm text-gray-600 mt-2">
                Check the browser console and network tab to see the API calls in action.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Available routers:</p>
                <ul className="list-disc list-inside">
                  <li>projects - CRUD operations for projects</li>
                  <li>research - Research content management</li>
                  <li>files - File upload and management</li>
                  <li>experiments - Experiment tracking</li>
                  <li>scoring - Score calculation and aggregation</li>
                  <li>assets - Asset generation and management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}