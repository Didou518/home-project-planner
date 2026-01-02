import { getProperties } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useProperties = () => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['properties'],
		queryFn: getProperties,
	});

	return { data, isLoading, error };
};
