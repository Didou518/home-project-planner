import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getProjectExpenses,
	createProjectExpense,
	deleteProjectExpense,
} from '@/integrations/supabase/client';
import type { ProjectExpense } from '@/types/ProjectExpense';
import { toast } from 'sonner';

/** Lecture des dépenses d'un projet. */
export const useProjectExpenses = (projectId: string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['project_expenses', projectId],
		queryFn: () => getProjectExpenses(projectId),
		enabled: !!projectId,
	});

	return { data, isLoading, error };
};

/** Mutations sur les dépenses (ajout / suppression — suppression optimiste). */
export const useProjectExpenseMutations = (projectId: string) => {
	const queryClient = useQueryClient();
	const key = ['project_expenses', projectId];

	const addExpense = useMutation({
		mutationFn: (expense: {
			label: string;
			amount: number;
			spent_at?: string;
		}) => createProjectExpense(projectId, expense),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
		onError: () => toast.error("Impossible d'ajouter la dépense"),
	});

	const deleteExpense = useMutation({
		mutationFn: (id: string) => deleteProjectExpense(id),
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: key });
			const prev = queryClient.getQueryData<ProjectExpense[]>(key);
			queryClient.setQueryData<ProjectExpense[]>(key, (old) =>
				(old ?? []).filter((e) => e.id !== id)
			);
			return { prev };
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
			toast.error('Impossible de supprimer la dépense');
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
	});

	return { addExpense, deleteExpense };
};
