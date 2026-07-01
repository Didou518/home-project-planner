import { useEffect } from 'react';
import { Form, NavLink, useLocation } from 'react-router';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '../ui/sidebar';
import { Button } from '../ui/button';
import { LayoutDashboard, LogOut, Users, FolderKanban } from 'lucide-react';
import PropertyMenu from './PropertyMenu';
import ProjectMenu from './ProjectMenu';
import { useProperties } from '@/hooks/useProperties';

const menuItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		to: '/',
	},
	{
		label: 'Tous les projets',
		icon: FolderKanban,
		to: '/projects',
	},
	{
		label: 'Foyer',
		icon: Users,
		to: '/household',
	},
];

export default function AppSidebar() {
	const location = useLocation();
	const { isMobile, setOpenMobile } = useSidebar();

	// Sur mobile, la sidebar est un drawer (Sheet) : on le referme à chaque
	// navigation, sinon il reste ouvert et on ne voit pas que la page a changé.
	useEffect(() => {
		if (isMobile) setOpenMobile(false);
	}, [location.pathname, isMobile, setOpenMobile]);

	const { data: properties, isLoading: isPropertiesLoading } =
		useProperties();

	// Bien actif dérivé de l'URL (source de vérité) — pas de store.
	const pathMatch = location.pathname.match(/\/properties\/([^/]+)/);
	const activePropertyId =
		pathMatch && pathMatch[1] !== 'new' ? pathMatch[1] : undefined;
	const activeProperty = activePropertyId
		? properties?.find((p) => p.id === activePropertyId)
		: undefined;

	return (
		<>
			<Sidebar>
				<SidebarHeader>Home Project Planner</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Application</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{menuItems.map((item) => (
									<SidebarMenuItem key={item.label}>
										<SidebarMenuButton asChild>
											<NavLink to={item.to}>
												<item.icon />
												{item.label}
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
					{!isPropertiesLoading && properties && (
						<PropertyMenu properties={properties} />
					)}
					{activeProperty && (
						<ProjectMenu property={activeProperty} />
					)}
				</SidebarContent>
				<SidebarFooter>
					<Form method="post" action="/logout">
						<Button
							type="submit"
							variant="ghost"
							className="w-full justify-between"
						>
							Logout
							<LogOut />
						</Button>
					</Form>
				</SidebarFooter>
			</Sidebar>
		</>
	);
}
