import { Form, NavLink, useRouteLoaderData } from 'react-router';
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
import { Folder, LayoutDashboard, LogOut } from 'lucide-react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { useEffect, useMemo } from 'react';
import type { Property } from '@/types/Property';
import PropertyMenu from './PropertyMenu';
import ProjectMenu from './ProjectMenu';

const menuItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		to: '/',
	},
	{
		label: 'Projects',
		icon: Folder,
		to: '/projects',
	},
];

export default function AppSidebar() {
	const { setProperties } = usePropertyStore();
	const loaderData = useRouteLoaderData<{ properties: Property[] }>('root');
	const properties = useMemo(
		() => loaderData?.properties ?? [],
		[loaderData]
	);

	useEffect(() => {
		setProperties(properties);
	}, [properties, setProperties]);

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
					<ProjectMenu />
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
