import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

export default function RootLayout() {
	const { user } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			navigate('/signin');
		}
	}, [user, navigate]);

	return (
		<>
			<main>
				<Outlet />
			</main>
		</>
	);
}
