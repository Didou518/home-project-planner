import { Folders, Home, Plus } from 'lucide-react';
import {
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '../ui/sidebar';
import { NavLink, useLocation } from 'react-router';
import { useSelectionStore } from '@/stores/useSelectionStore';
import type { Property } from '@/types/Property';

export default function PropertyMenu({
	properties,
}: {
	properties: Property[];
}) {
	const { setSelectedProperty } = useSelectionStore();
	const location = useLocation();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Mes biens</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<NavLink to="/properties">
								<Folders />
								Voir tous les biens
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<NavLink to="/properties/new">
								<Plus />
								Nouveau bien
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				{properties.length > 0 && (
					<SidebarMenu className="mt-2">
						<SidebarGroupLabel className="px-2 text-xs text-muted-foreground">
							Liste des biens
						</SidebarGroupLabel>
						{properties.map((property) => {
							const isActive =
								location.pathname.startsWith(
									`/properties/${property.id}`
								) && !location.pathname.includes('/projects/');
							return (
								<SidebarMenuItem key={property.id}>
									<SidebarMenuButton
										asChild
										isActive={isActive}
										tooltip={property.name}
									>
										<NavLink
											to={`/properties/${property.id}`}
											onClick={() =>
												setSelectedProperty(property)
											}
										>
											<Home className="h-4 w-4" />
											<span className="truncate">
												{property.name}
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
