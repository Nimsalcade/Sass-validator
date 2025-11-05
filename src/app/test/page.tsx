'use client';

import { trpc } from '@/client/trpc-provider';

export default function TestPage() {
  const { data: projects, isLoading, error } = trpc.projects.getAll.useQuery();
  const createProject = trpc.projects.create.useMutation();
  const utils = trpc.useUtils();

  const handleTestCreate = async () => {
    try {
      await createProject.mutateAsync({
        name: 'Test Project ' + Date.now(),
        description: 'This is a test project created via tRPC',
        status: 'ACTIVE',
      });
      utils.projects.getAll.invalidate();
      alert('Test project created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating project: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">tRPC API Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-600">Error: {error.message}</p>}
          {projects && (
            <div>
              <p className="text-green-600 mb-4">✅ Successfully connected to tRPC API!</p>
              <p>Found {projects.length} projects in database.</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Test Project</h2>
          <button
            onClick={handleTestCreate}
            disabled={createProject.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createProject.isPending ? 'Creating...' : 'Create Test Project'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium">Projects</h3>
              <ul className="text-gray-600">
                <li>• getAll - Get all user projects</li>
                <li>• getById - Get project by ID</li>
                <li>• create - Create new project</li>
                <li>• update - Update project</li>
                <li>• delete - Delete project</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Research</h3>
              <ul className="text-gray-600">
                <li>• getByProject - Get project research</li>
                <li>• getById - Get research by ID</li>
                <li>• create - Create research</li>
                <li>• update - Update research</li>
                <li>• delete - Delete research</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Files</h3>
              <ul className="text-gray-600">
                <li>• getByProject - Get project files</li>
                <li>• getById - Get file by ID</li>
                <li>• create - Upload file</li>
                <li>• update - Update file</li>
                <li>• delete - Delete file</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Experiments</h3>
              <ul className="text-gray-600">
                <li>• getByProject - Get project experiments</li>
                <li>• getById - Get experiment by ID</li>
                <li>• create - Create experiment</li>
                <li>• update - Update experiment</li>
                <li>• delete - Delete experiment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Scoring</h3>
              <ul className="text-gray-600">
                <li>• getByExperiment - Get experiment scores</li>
                <li>• getById - Get score by ID</li>
                <li>• create - Create score</li>
                <li>• update - Update score</li>
                <li>• getAggregated - Get aggregated scores</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Assets</h3>
              <ul className="text-gray-600">
                <li>• getByProject - Get project assets</li>
                <li>• getById - Get asset by ID</li>
                <li>• create - Create asset</li>
                <li>• generate - Generate AI asset</li>
                <li>• search - Search assets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}