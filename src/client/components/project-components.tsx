'use client';

import { trpc } from '@/client/trpc-provider';

export function ProjectList() {
  const { data: projects, isLoading, error } = trpc.projects.getAll.useQuery();

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Projects</h2>
      {projects?.length === 0 ? (
        <p>No projects found. Create your first project!</p>
      ) : (
        <div className="grid gap-4">
          {projects?.map((project) => (
            <div key={project.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{project.name}</h3>
              <p className="text-gray-600">{project.description}</p>
              <p className="text-sm text-gray-500">Status: {project.status}</p>
              <p className="text-xs text-gray-400">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreateProjectForm() {
  const createProject = trpc.projects.create.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createProject.mutateAsync({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        status: 'ACTIVE',
      });
      
      // Refresh the projects list
      utils.projects.getAll.invalidate();
      
      // Reset form
      e.currentTarget.reset();
      alert('Project created successfully!');
    } catch (error) {
      alert('Error creating project: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Create New Project</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Enter project name"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Enter project description"
          />
        </div>
        <button
          type="submit"
          disabled={createProject.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {createProject.isPending ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}

export function AssetsList({ projectId }: { projectId: string }) {
  const { data: assets, isLoading, error } = trpc.assets.getByProject.useQuery({ projectId });

  if (isLoading) return <div>Loading assets...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Assets</h3>
      {assets?.length === 0 ? (
        <p>No assets found for this project.</p>
      ) : (
        <div className="grid gap-4">
          {assets?.map((asset) => (
            <div key={asset.id} className="border p-4 rounded-lg">
              <h4 className="font-semibold">{asset.name}</h4>
              <p className="text-sm text-gray-600">Type: {asset.type}</p>
              <p className="text-sm text-gray-600">Status: {asset.status}</p>
              <p className="text-xs text-gray-400">
                Created: {new Date(asset.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}