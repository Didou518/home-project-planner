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
} from '../ui/sidebar';
import { Button } from '../ui/button';
import { LayoutDashboard, LogOut } from 'lucide-react';
import PropertyMenu from './PropertyMenu';
import ProjectMenu from './ProjectMenu';
import { useProperties } from '@/hooks/useProperties';

const menuItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		to: '/',
	},
];

export default function AppSidebar() {
	const location = useLocation();

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
