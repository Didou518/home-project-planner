import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import PageMessage from '@/components/PageMessage';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban } from 'lucide-react';
import { NavLink, useParams } from 'react-router';
import { useProjects } from '@/hooks/useProjects';
import { useProperty } from '@/hooks/useProperty';

export default function ProjectsPage() {
	const { id: propertyId } = useParams();
	const {
		data: property,
		isLoading: isPropertyLoading,
		error: propertyError,
	} = useProperty(propertyId ?? '');
	const {
		data: projects,
		isLoading: isProjectsLoading,
		error: projectsError,
	} = useProjects(propertyId ?? '');

	if (isPropertyLoading) {
		return <PageMessage loading />;
	}
	if (propertyError || projectsError) {
		return (
			<PageMessage
				title="Erreur de chargement"
				description="Impossible de charger ce bien et ses projets. Réessayez plus tard."
				backTo="/properties"
				backLabel="Voir mes biens"
			/>
		);
	}
	if (!property) {
		return (
			<PageMessage
				title="Bien introuvable"
				description="Ce bien n'existe pas ou n'est plus accessible."
				backTo="/properties"
				backLabel="Voir mes biens"
			/>
		);
	}

	const breadcrumbs: Crumb[] = [
		{ label: 'Accueil', to: '/' },
		{ label: 'Biens', to: '/properties' },
		{ label: property.name, to: `/properties/${property.id}` },
		{ label: 'Projets', to: `/properties/${property.id}/projects` },
	];

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<div className="flex items-start justify-between">
						<Heading1>Mes Projets</Heading1>
						<NavLink
							to={`/properties/${property.id}/projects/new`}
						>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Ajouter un projet
							</Button>
						</NavLink>
					</div>

					{isProjectsLoading ? (
						<p className="mt-8">Chargement...</p>
					) : (
						<Card>
							<CardHeader>
								<CardTitle>Liste des projets</CardTitle>
								<CardDescription>
									Projets associés au bien "{property.name}"
								</CardDescription>
							</CardHeader>
							<CardContent>
								{projects && projects.length > 0 ? (
									<ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{projects.map((project) => (
											<li key={project.id}>
												<NavLink
													to={`/properties/${property.id}/projects/${project.id}`}
													className="block"
												>
													<Card className="hover:bg-accent transition-colors cursor-pointer">
														<CardHeader>
															<div className="flex items-center gap-2">
																<FolderKanban className="h-4 w-4 text-muted-foreground" />
																<CardTitle className="text-base">
																	{
																		project.name
																	}
																</CardTitle>
															</div>
															{project.description && (
																<CardDescription className="mt-2">
																	{
																		project.description
																	}
																</CardDescription>
															)}
														</CardHeader>
													</Card>
												</NavLink>
											</li>
										))}
									</ul>
								) : (
									<div className="text-center py-8 text-muted-foreground">
										<FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>Aucun projet pour ce bien</p>
										<p className="text-sm mt-2">
											Créez votre premier projet pour
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
