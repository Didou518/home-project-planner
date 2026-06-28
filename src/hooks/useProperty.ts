import { getProperty } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useProperty = (id: string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['property', id],
		queryFn: () => getProperty(id),
		enabled: !!id,
	});

	return { data, isLoading, error };
};
