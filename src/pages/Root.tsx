import AppSidebar from '@/components/sidebar/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getProperties } from '@/integrations/supabase/client';
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
			<SidebarProvider>
				<AppSidebar />
				<main>
					<Outlet />
				</main>
			</SidebarProvider>
		</>
	);
}

export async function loader() {
	const properties = await getProperties();
	return { properties };
}
