import { getProjects } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useProjects = (propertyId: string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['projects', propertyId],
		queryFn: () => getProjects(propertyId),
		enabled: !!propertyId,
	});

	return { data, isLoading, error };
};
