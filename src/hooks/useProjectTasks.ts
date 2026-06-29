import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getProjectTasks,
	createProjectTask,
	setProjectTaskDone,
	deleteProjectTask,
} from '@/integrations/supabase/client';
import type { ProjectTask } from '@/types/ProjectTask';
import { toast } from 'sonner';

/** Lecture des tâches d'un projet. */
export const useProjectTasks = (projectId: string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['project_tasks', projectId],
		queryFn: () => getProjectTasks(projectId),
		enabled: !!projectId,
	});

	return { data, isLoading, error };
};

/**
 * Mutations sur les tâches (ajout / coche / suppression).
 * Toggle et suppression sont optimistes (mise à jour immédiate du cache, rollback si erreur).
 */
export const useProjectTaskMutations = (projectId: string) => {
	const queryClient = useQueryClient();
	const key = ['project_tasks', projectId];

	const addTask = useMutation({
		mutationFn: (label: string) => createProjectTask(projectId, label),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
		onError: () => toast.error("Impossible d'ajouter la tâche"),
	});

	const toggleTask = useMutation({
		mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
			setProjectTaskDone(id, isDone),
		onMutate: async ({ id, isDone }) => {
			await queryClient.cancelQueries({ queryKey: key });
			const prev = queryClient.getQueryData<ProjectTask[]>(key);
			queryClient.setQueryData<ProjectTask[]>(key, (old) =>
				(old ?? []).map((t) =>
					t.id === id ? { ...t, is_done: isDone } : t
				)
			);
			return { prev };
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
			toast.error('Impossible de mettre à jour la tâche');
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
	});

	const deleteTask = useMutation({
		mutationFn: (id: string) => deleteProjectTask(id),
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: key });
			const prev = queryClient.getQueryData<ProjectTask[]>(key);
			queryClient.setQueryData<ProjectTask[]>(key, (old) =>
				(old ?? []).filter((t) => t.id !== id)
			);
			return { prev };
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
			toast.error('Impossible de supprimer la tâche');
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
	});

	return { addTask, toggleTask, deleteTask };
};
