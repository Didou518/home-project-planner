import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { Plus, Home } from 'lucide-react';
import { NavLink } from 'react-router';
import { useProperties } from '@/hooks/useProperties';

const breadcrumbs: Crumb[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Propriétés', to: '/properties' },
];

export default function PropertiesPage() {
	const { setSelectedProperty } = useSelectionStore();
	const { data: properties, isLoading, error } = useProperties();

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<div className="flex items-start justify-between">
						<Heading1>Mes Biens</Heading1>
						<NavLink to="/properties/new">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Ajouter un bien
							</Button>
						</NavLink>
					</div>

					{isLoading ? (
						<p className="mt-8">Chargement...</p>
					) : (
						<Card>
							<CardHeader>
								<CardTitle>Liste des biens</CardTitle>
								<CardDescription>
									Tous vos biens immobiliers
								</CardDescription>
							</CardHeader>
							<CardContent>
								{properties && properties.length > 0 ? (
									<ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{properties.map((property) => (
											<li key={property.id}>
												<NavLink
													to={`/properties/${property.id}`}
													className="block"
													onClick={() =>
														setSelectedProperty(
															property
														)
													}
												>
													<Card className="hover:bg-accent transition-colors cursor-pointer">
														<CardHeader>
															<div className="flex items-center gap-2">
																<Home className="h-4 w-4 text-muted-foreground" />
																<CardTitle className="text-base">
																	{
																		property.name
																	}
																</CardTitle>
															</div>
														</CardHeader>
													</Card>
												</NavLink>
											</li>
										))}
									</ul>
								) : (
									<div className="text-center py-8 text-muted-foreground">
										<Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>Aucun bien</p>
										<p className="text-sm mt-2">
											Créez votre premier bien pour
											commencer
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</PageTemplate>
		</>
	);
}
