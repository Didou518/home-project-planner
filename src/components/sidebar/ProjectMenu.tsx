import { NavLink } from 'react-router';
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '../ui/sidebar';
import { Hammer } from 'lucide-react';

export default function ProjectMenu() {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Mes Projets</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<NavLink to="/projects/new">
								<Hammer />
								Ajouter un projet
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
