import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getHouseholdMembers,
	createHouseholdInvite,
	redeemHouseholdInvite,
	leaveHousehold,
} from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useHouseholdMembers = () => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['household_members'],
		queryFn: getHouseholdMembers,
	});
	return { data, isLoading, error };
};

export const useHouseholdMutations = () => {
	const queryClient = useQueryClient();

	// Le partage change la visibilité des biens → on rafraîchit aussi la liste.
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ['household_members'] });
		queryClient.invalidateQueries({ queryKey: ['properties'] });
	};

	const createInvite = useMutation({
		mutationFn: createHouseholdInvite,
		onError: () => toast.error('Impossible de générer un code'),
	});

	const redeem = useMutation({
		mutationFn: (code: string) => redeemHouseholdInvite(code),
		onSuccess: () => {
			toast.success('Vous avez rejoint le foyer');
			refresh();
		},
		onError: (e: unknown) =>
			toast.error(
				e instanceof Error ? e.message : 'Code invalide ou expiré'
			),
	});

	const leave = useMutation({
		mutationFn: leaveHousehold,
		onSuccess: () => {
			toast.success('Vous avez quitté le foyer');
			refresh();
		},
		onError: () => toast.error('Impossible de quitter le foyer'),
	});

	return { createInvite, redeem, leave };
};
