import { create } from 'zustand';
import type { Project } from '@/types/Project';
import {
	getProjects,
	createProject,
	updateProject as updateProjectInDb,
	deleteProject as deleteProjectInDb,
} from '@/integrations/supabase/client';

interface ProjectState {
	projects: Project[];
	isLoading: boolean;
	error: string | null;
	fetchProjects: (propertyId: string) => Promise<void>;
	addProject: (
		project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
	) => Promise<void>;
	updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;
	setProjects: (projects: Project[]) => void;
	setIsLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	reset: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
	projects: [],
	isLoading: false,
	error: null,

	fetchProjects: async (propertyId: string) => {
		set({ isLoading: true, error: null });
		try {
			const data = await getProjects(propertyId);
			set({ projects: data, isLoading: false });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to fetch projects';
			set({ error: message, isLoading: false });
			throw error;
		}
	},

	addProject: async (project) => {
		set({ isLoading: true, error: null });
		try {
			const data = await createProject(project);
			set((state) => ({
				projects: [data, ...state.projects],
				isLoading: false,
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to add project';
			set({ error: message, isLoading: false });
			throw error;
		}
	},

	updateProject: async (id, updates) => {
		set({ isLoading: true, error: null });
		try {
			const data = await updateProjectInDb(id, updates);
			set((state) => ({
				projects: state.projects.map((p) => (p.id === id ? data : p)),
				isLoading: false,
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to update project';
			set({ error: message, isLoading: false });
			throw error;
		}
	},

	deleteProject: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await deleteProjectInDb(id);
			set((state) => ({
				projects: state.projects.filter((p) => p.id !== id),
				isLoading: false,
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to delete project';
			set({ error: message, isLoading: false });
			throw error;
		}
	},

	setProjects: (projects) => set({ projects }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	reset: () => set({ projects: [], isLoading: false, error: null }),
}));
