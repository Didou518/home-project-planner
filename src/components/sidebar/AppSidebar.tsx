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
import { useEffect } from 'react';
import PropertyMenu from './PropertyMenu';
import ProjectMenu from './ProjectMenu';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useProperties } from '@/hooks/useProperties';

const menuItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		to: '/',
	},
];

export default function AppSidebar() {
	const { selectedProperty, setSelectedProperty } = useSelectionStore();
	const location = useLocation();

	const { data: properties, isLoading: isPropertiesLoading } =
		useProperties();

	// Détecter automatiquement la propriété depuis l'URL et charger les projets
	useEffect(() => {
		if (!isPropertiesLoading && properties) {
			const pathMatch = location.pathname.match(/\/properties\/([^/]+)/);
			if (pathMatch && pathMatch[1] && pathMatch[1] !== 'new') {
				const propertyId = pathMatch[1];
				const property = properties.find((p) => p.id === propertyId);

				if (property && property.id !== selectedProperty?.id) {
					setSelectedProperty(property);
				}
			}
		}
	}, [
		location.pathname,
		properties,
		selectedProperty,
		setSelectedProperty,
		isPropertiesLoading,
	]);

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
					{selectedProperty && (
						<ProjectMenu property={selectedProperty} />
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
