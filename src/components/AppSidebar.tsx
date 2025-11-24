import { Form, NavLink } from 'react-router';
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
} from './ui/sidebar';
import { Button } from './ui/button';
import { Folder, Home, LogOut } from 'lucide-react';

const menuItems = [
	{
		label: 'Dashboard',
		icon: Home,
		to: '/',
	},
	{
		label: 'Projects',
		icon: Folder,
		to: '/projects',
	},
];

export default function AppSidebar() {
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
