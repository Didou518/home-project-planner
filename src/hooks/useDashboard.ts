import { useQuery } from '@tanstack/react-query';
import {
	getProperties,
	getAllProjects,
	getAllExpenses,
} from '@/integrations/supabase/client';

type DashboardProject = {
	id: string;
	property_id: string;
	name: string;
	status: string;
};

/** Agrégats du tableau de bord (biens, projets en cours, total dépensé). */
export const useDashboard = () => {
	const properties = useQuery({
		queryKey: ['properties'],
		queryFn: getProperties,
	});
	const projects = useQuery({
		queryKey: ['all_projects'],
		queryFn: getAllProjects,
	});
	const expenses = useQuery({
		queryKey: ['all_expenses'],
		queryFn: getAllExpenses,
	});

	const allProjects = (projects.data ?? []) as DashboardProject[];
	const inProgress = allProjects.filter((p) => p.status === 'in_progress');
	const totalSpent = ((expenses.data ?? []) as { amount: number }[]).reduce(
		(sum, e) => sum + Number(e.amount),
		0
	);

	return {
		isLoading:
			properties.isLoading || projects.isLoading || expenses.isLoading,
		error: properties.error || projects.error || expenses.error,
		biensCount: properties.data?.length ?? 0,
		projectsCount: allProjects.length,
		inProgress,
		totalSpent,
	};
};
