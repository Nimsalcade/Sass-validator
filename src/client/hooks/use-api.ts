'use client';

import { trpc } from '@/client/trpc-provider';

export function useProjects() {
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = trpc.projects.getAll.useQuery();

  const createProject = trpc.projects.create.useMutation();
  const updateProject = trpc.projects.update.useMutation();
  const deleteProject = trpc.projects.delete.useMutation();
  // Note: getProject needs to be called with an ID parameter

  return {
    projects,
    isLoading,
    error,
    refetch,
    createProject: async (data: Parameters<typeof createProject.mutateAsync>[0]) => {
      const result = await createProject.mutateAsync(data);
      await refetch();
      return result;
    },
    updateProject: async (data: Parameters<typeof updateProject.mutateAsync>[0]) => {
      const result = await updateProject.mutateAsync(data);
      await refetch();
      return result;
    },
    deleteProject: async (data: Parameters<typeof deleteProject.mutateAsync>[0]) => {
      const result = await deleteProject.mutateAsync(data);
      await refetch();
      return result;
    },
    getProject: (id: string) => trpc.projects.getById.useQuery({ id }),
  };
}

export function useResearch(projectId: string) {
  const {
    data: research,
    isLoading,
    error,
    refetch,
  } = trpc.research.getByProject.useQuery({ projectId });

  const createResearch = trpc.research.create.useMutation();
  const updateResearch = trpc.research.update.useMutation();
  const deleteResearch = trpc.research.delete.useMutation();

  return {
    research,
    isLoading,
    error,
    refetch,
    createResearch: async (data: Omit<Parameters<typeof createResearch.mutateAsync>[0], 'projectId'>) => {
      const result = await createResearch.mutateAsync({ ...data, projectId });
      await refetch();
      return result;
    },
    updateResearch: async (data: Parameters<typeof updateResearch.mutateAsync>[0]) => {
      const result = await updateResearch.mutateAsync(data);
      await refetch();
      return result;
    },
    deleteResearch: async (data: Parameters<typeof deleteResearch.mutateAsync>[0]) => {
      const result = await deleteResearch.mutateAsync(data);
      await refetch();
      return result;
    },
  };
}

export function useAssets(projectId: string) {
  const {
    data: assets,
    isLoading,
    error,
    refetch,
  } = trpc.assets.getByProject.useQuery({ projectId });

  const createAsset = trpc.assets.create.useMutation();
  const generateAsset = trpc.assets.generate.useMutation();
  const updateAsset = trpc.assets.update.useMutation();
  const deleteAsset = trpc.assets.delete.useMutation();
  // Note: searchAssets needs to be called with query parameters

  return {
    assets,
    isLoading,
    error,
    refetch,
    createAsset: async (data: Omit<Parameters<typeof createAsset.mutateAsync>[0], 'projectId'>) => {
      const result = await createAsset.mutateAsync({ ...data, projectId });
      await refetch();
      return result;
    },
    generateAsset: async (data: Omit<Parameters<typeof generateAsset.mutateAsync>[0], 'projectId'>) => {
      const result = await generateAsset.mutateAsync({ ...data, projectId });
      await refetch();
      return result;
    },
    updateAsset: async (data: Parameters<typeof updateAsset.mutateAsync>[0]) => {
      const result = await updateAsset.mutateAsync(data);
      await refetch();
      return result;
    },
    deleteAsset: async (data: Parameters<typeof deleteAsset.mutateAsync>[0]) => {
      const result = await deleteAsset.mutateAsync(data);
      await refetch();
      return result;
    },
    searchAssets: (query: string, filters?: { type?: "LANDING_PAGE" | "EMAIL_SEQUENCE" | "SOCIAL_MEDIA" | "BLOG_POST" | "OTHER"; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) => 
      trpc.assets.search.useQuery({ projectId, query, ...filters }),
  };
}