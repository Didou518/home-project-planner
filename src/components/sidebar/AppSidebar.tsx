import { Form, NavLink, useLocation, useRouteLoaderData } from 'react-router';
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
import { usePropertyStore } from '@/stores/usePropertyStore';
import { useEffect, useMemo } from 'react';
import type { Property } from '@/types/Property';
import PropertyMenu from './PropertyMenu';
import ProjectMenu from './ProjectMenu';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useProjectStore } from '@/stores/useProjectStore';

const menuItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		to: '/',
	},
];

export default function AppSidebar() {
	const { setProperties, properties: storeProperties } = usePropertyStore();
	const { selectedProperty, setSelectedProperty } = useSelectionStore();
	const { setProjects, fetchProjects } = useProjectStore();
	const location = useLocation();
	const loaderData = useRouteLoaderData<{ properties: Property[] }>('root');
	const properties = useMemo(
		() => loaderData?.properties ?? [],
		[loaderData]
	);

	// Synchroniser les propriétés du loader avec le store
	useEffect(() => {
		setProperties(properties);
	}, [properties, setProperties]);

	// Détecter automatiquement la propriété depuis l'URL et charger les projets
	useEffect(() => {
		const pathMatch = location.pathname.match(/\/properties\/([^/]+)/);
		if (pathMatch && pathMatch[1] && pathMatch[1] !== 'new') {
			const propertyId = pathMatch[1];
			const property =
				storeProperties.find((p) => p.id === propertyId) ||
				properties.find((p) => p.id === propertyId);

			if (property && property.id !== selectedProperty?.id) {
				setSelectedProperty(property);
			}
		}
	}, [
		location.pathname,
		storeProperties,
		properties,
		selectedProperty,
		setSelectedProperty,
	]);

	// Charger les projets quand une propriété est sélectionnée
	useEffect(() => {
		if (selectedProperty) {
			fetchProjects(selectedProperty.id);
		} else {
			setProjects([]);
		}
	}, [selectedProperty, fetchProjects, setProjects]);

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
					<PropertyMenu properties={properties} />
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
