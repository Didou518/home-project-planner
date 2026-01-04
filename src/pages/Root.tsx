import AppSidebar from '@/components/sidebar/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

export default function RootLayout() {
	const { user, isLoading } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !user) {
			navigate('/signin');
		}
	}, [user, navigate, isLoading]);

	return (
		<>
			<SidebarProvider>
				<AppSidebar />
				<main>
					<Outlet />
				</main>
			</SidebarProvider>
		</>
	);
}
