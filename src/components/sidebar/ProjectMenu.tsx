import { NavLink, useLocation } from 'react-router';
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '../ui/sidebar';
import { NotebookPen, Plus, FolderKanban } from 'lucide-react';
import { type Property } from '@/types/Property';
import { useProjectStore } from '@/stores/useProjectStore';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useEffect } from 'react';

export default function ProjectMenu({ property }: { property: Property }) {
	const { projects } = useProjectStore();
	const { setSelectedProject } = useSelectionStore();
	const location = useLocation();

	// Détecter automatiquement le projet depuis l'URL
	useEffect(() => {
		const pathMatch = location.pathname.match(
			/\/properties\/[^/]+\/projects\/([^/]+)/
		);
		if (pathMatch && pathMatch[1] && pathMatch[1] !== 'new') {
			const projectId = pathMatch[1];
			const project = projects.find((p) => p.id === projectId);
			if (project) {
				setSelectedProject(project);
			}
		}
	}, [location.pathname, projects, setSelectedProject]);

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Projets - {property.name}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<NavLink to={`/properties/${property.id}/projects`}>
								<NotebookPen />
								Voir tous les projets
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<NavLink
								to={`/properties/${property.id}/projects/new`}
							>
								<Plus />
								Ajouter un projet
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				{projects.length > 0 && (
					<SidebarMenu className="mt-2">
						<SidebarGroupLabel className="px-2 text-xs text-muted-foreground">
							Liste des projets
						</SidebarGroupLabel>
						{projects.map((project) => {
							const isActive = location.pathname.includes(
								`/projects/${project.id}`
							);
							return (
								<SidebarMenuItem key={project.id}>
									<SidebarMenuButton
										asChild
										isActive={isActive}
										tooltip={project.name}
									>
										<NavLink
											to={`/properties/${property.id}/projects/${project.id}`}
											onClick={() =>
												setSelectedProject(project)
											}
										>
											<FolderKanban className="h-4 w-4" />
											<span className="truncate">
												{project.name}
											</span>
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				)}
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
