import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { Edit, Calendar, Plus, FolderKanban } from 'lucide-react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';
import { useProperties } from '@/hooks/useProperties';
import DeleteModal from '@/components/DeleteModal';

export default function PropertyPage() {
	const { id: propertyId } = useParams();
	const { selectedProperty } = useSelectionStore();
	const { data: properties } = useProperties();
	const { data: projects, isLoading: isProjectsLoading } = useProjects(
		propertyId ?? ''
	);
	const navigate = useNavigate();

	// Trouver la propriété depuis le store ou depuis l'URL
	const property =
		selectedProperty ||
		(propertyId ? properties?.find((p) => p.id === propertyId) : null);

	// Rediriger si pas de propriété
	useEffect(() => {
		if (!property && propertyId) {
			toast.error('Bien non trouvé', {
				description:
					"Le bien demandé n'existe pas ou n'est plus disponible",
			});
			navigate('/properties');
		}
	}, [property, propertyId, navigate]);

	if (!property) {
		return null;
	}

	const breadcrumbs: Crumb[] = [
		{ label: 'Accueil', to: '/' },
		{ label: 'Propriétés', to: '/properties' },
		{
			label: property.name,
			to: `/properties/${property.id}`,
		},
	];

	// Formater les dates
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const handleDelete = async () => {
		toast.error("Cette fonctionnalité n'est pas encore disponible");
	};

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<div className="flex items-start justify-between">
						<div>
							<Heading1>{property.name}</Heading1>
						</div>
						<div className="flex justify-between gap-2">
							<NavLink to={`/properties/${property.id}/edit`}>
								<Button>
									<Edit className="mr-2 h-4 w-4" />
									Éditer le bien
								</Button>
							</NavLink>
							<DeleteModal onDelete={handleDelete} />
						</div>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Informations du bien</CardTitle>
							<CardDescription>
								Détails et métadonnées du bien
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">
									Créé le :
								</span>
								<span>{formatDate(property.created_at)}</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Projets</CardTitle>
									<CardDescription>
										Liste des projets associés à ce bien
									</CardDescription>
								</div>
								<NavLink
									to={`/properties/${property.id}/projects/new`}
								>
									<Button size="sm">
										<Plus className="mr-2 h-4 w-4" />
										Ajouter un projet
									</Button>
								</NavLink>
							</div>
						</CardHeader>
						<CardContent>
							{!isProjectsLoading &&
							projects &&
							projects.length > 0 ? (
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
																{project.name}
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
				</div>
			</PageTemplate>
		</>
	);
}
