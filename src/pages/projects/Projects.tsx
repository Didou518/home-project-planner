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
import { Plus, FolderKanban } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
	const { selectedProperty, setSelectedProject } = useSelectionStore();
	const { data: projects, isLoading } = useProjects(
		selectedProperty?.id ?? ''
	);
	const navigate = useNavigate();

	if (!selectedProperty) {
		toast.error('Bien non sélectionné', {
			description: 'Veuillez sélectionner un bien pour voir ses projets',
		});
		navigate('/properties');
		return;
	}

	const breadcrumbs: Crumb[] = [
		{ label: 'Accueil', to: '/' },
		{ label: 'Propriétés', to: '/properties' },
		{
			label: selectedProperty?.name ?? '',
			to: `/properties/${selectedProperty?.id}`,
		},
		{
			label: 'Projets',
			to: `/properties/${selectedProperty?.id}/projects`,
		},
	];

	if (!selectedProperty) {
		return null;
	}

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<div className="flex items-start justify-between">
						<Heading1>Mes Projets</Heading1>
						<NavLink
							to={`/properties/${selectedProperty?.id}/projects/new`}
						>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Ajouter un projet
							</Button>
						</NavLink>
					</div>

					{isLoading ? (
						<p className="mt-8">Chargement...</p>
					) : (
						<Card>
							<CardHeader>
								<CardTitle>Liste des projets</CardTitle>
								<CardDescription>
									Projets associés au bien "
									{selectedProperty?.name}"
								</CardDescription>
							</CardHeader>
							<CardContent>
								{projects && projects.length > 0 ? (
									<ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{projects.map((project) => (
											<li key={project.id}>
												<NavLink
													to={`/properties/${selectedProperty?.id}/projects/${project.id}`}
													className="block"
													onClick={() =>
														setSelectedProject(
															project
														)
													}
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
