import { Folders, Home, SquarePen } from 'lucide-react';
import {
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '../ui/sidebar';
import { NavLink } from 'react-router';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { useSelectionStore } from '@/stores/useSelectionStore';
import type { Property } from '@/types/Property';

export default function PropertyMenu({
	properties,
}: {
	properties: Property[];
}) {
	const { selectedProperty, setSelectedProperty } = useSelectionStore();

	function handlePropertyChange(value: string) {
		if (!value) {
			setSelectedProperty(null);
			return;
		}
		const property = properties.find((property) => property.id === value);
		if (property) {
			setSelectedProperty(property);
		}
	}
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
								<Home />
								Nouveau bien
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<Select
							onValueChange={handlePropertyChange}
							value={selectedProperty?.id ?? ''}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Choisir un bien" />
							</SelectTrigger>
							<SelectContent>
								{properties.map((property) => (
									<SelectItem
										key={property.id}
										value={property.id}
									>
										{property.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</SidebarMenuItem>
					{selectedProperty && (
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<NavLink
									to={`/properties/${selectedProperty.id}`}
								>
									<SquarePen />
									Editer le bien
								</NavLink>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
