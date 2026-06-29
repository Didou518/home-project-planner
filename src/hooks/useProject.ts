import { getProject } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useProject = (id: string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['project', id],
		queryFn: () => getProject(id),
		enabled: !!id,
	});

	return { data, isLoading, error };
};
