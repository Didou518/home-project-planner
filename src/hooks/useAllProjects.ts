import { useMutation, useQuery } from '@tanstack/react-query';
import {
	getAllProjects,
	reorderProjects,
	queryClient,
} from '@/integrations/supabase/client';
import type { ProjectStatus } from '@/types/Project';

/** Projet tel que listé sur « Tous les projets » (sous-ensemble de colonnes). */
export type AllProjectsItem = {
	id: string;
	property_id: string;
	name: string;
	status: ProjectStatus;
	priority: number | null;
};

const ALL_PROJECTS_KEY = ['all_projects'] as const;

/**
 * Liste globale des projets (tous biens) ordonnée par priorité manuelle,
 * + mutation de réordonnancement drag&drop avec mise à jour optimiste.
 */
export const useAllProjects = () => {
	const query = useQuery({
		queryKey: ALL_PROJECTS_KEY,
		queryFn: getAllProjects,
	});

	const reorder = useMutation({
		// `next` = liste complète dans le nouvel ordre voulu.
		mutationFn: (next: AllProjectsItem[]) =>
			reorderProjects(next.map((p) => p.id)),
		onMutate: async (next) => {
			await queryClient.cancelQueries({ queryKey: ALL_PROJECTS_KEY });
			const previous =
				queryClient.getQueryData<AllProjectsItem[]>(ALL_PROJECTS_KEY);
			queryClient.setQueryData(ALL_PROJECTS_KEY, next);
			return { previous };
		},
		onError: (_err, _next, context) => {
			if (context?.previous) {
				queryClient.setQueryData(ALL_PROJECTS_KEY, context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ALL_PROJECTS_KEY });
		},
	});

	return {
		projects: (query.data ?? []) as AllProjectsItem[],
		isLoading: query.isLoading,
		error: query.error,
		reorder,
	};
};
