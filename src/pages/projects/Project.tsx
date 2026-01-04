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
import { Edit, Calendar, Loader2 } from 'lucide-react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';
import { useProperties } from '@/hooks/useProperties';
import { deleteProject, queryClient } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import DeleteModal from '@/components/DeleteModal';

export default function ProjectPage() {
	const { id: propertyId, projectId } = useParams();
	const { selectedProperty, selectedProject } = useSelectionStore();
	const { data: properties, isLoading: isPropertiesLoading } =
		useProperties();
	const { data: projects, isLoading: isProjectsLoading } = useProjects(
		propertyId ?? ''
	);
	const navigate = useNavigate();

	// Trouver la propriété depuis le store ou depuis l'URL
	const property =
		selectedProperty ||
		(propertyId ? properties?.find((p) => p.id === propertyId) : null);

	// Trouver le projet depuis le store ou depuis l'URL
	const project =
		selectedProject ||
		(projectId ? projects?.find((p) => p.id === projectId) : null);

	const { mutate: deleteProjectMutation, isPending: isDeletingProject } =
		useMutation({
			mutationFn: () => deleteProject(project.id),
			onSuccess: () => {
				toast.success('Projet supprimé avec succès');
				queryClient.invalidateQueries({ queryKey: ['projects'] });
				navigate(`/properties/${propertyId}/projects`);
			},
			onError: () => {
				toast.error('Erreur lors de la suppression du projet');
			},
		});

	// Rediriger si pas de propriété ou projet
	useEffect(() => {
		if (!isPropertiesLoading && !property) {
			toast.error('Bien non sélectionné', {
				description:
					'Veuillez sélectionner un bien pour voir ses projets',
			});
			navigate('/properties');
			return;
		}

		if (!isProjectsLoading && !project && projectId) {
			toast.error('Projet non trouvé', {
				description:
					"Le projet demandé n'existe pas ou n'est plus disponible",
			});
			navigate(`/properties/${propertyId}/projects`);
		}
	}, [
		selectedProperty,
		project,
		projectId,
		propertyId,
		navigate,
		isProjectsLoading,
		isPropertiesLoading,
		property,
	]);

	if (!selectedProperty || !project) {
		return null;
	}

	const breadcrumbs: Crumb[] = [
		{ label: 'Accueil', to: '/' },
		{ label: 'Propriétés', to: '/properties' },
		{
			label: selectedProperty.name,
			to: `/properties/${selectedProperty.id}`,
		},
		{
			label: 'Projets',
			to: `/properties/${selectedProperty.id}/projects`,
		},
		{
			label: project.name,
			to: `/properties/${selectedProperty.id}/projects/${project.id}`,
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
		deleteProjectMutation();
	};

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<div className="flex items-start justify-between">
						<div>
							<Heading1>{project.name}</Heading1>
							{project.description && (
								<p className="mt-2 text-muted-foreground">
									{project.description}
								</p>
							)}
						</div>
						<div className="flex justify-between gap-2">
							<NavLink
								to={`/properties/${selectedProperty.id}/projects/${project.id}/edit`}
							>
								<Button>
									<Edit className="mr-2 h-4 w-4" />
									Éditer le projet
								</Button>
							</NavLink>
							{isDeletingProject ? (
								<Button disabled>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Suppression...
								</Button>
							) : (
								<DeleteModal onDelete={handleDelete} />
							)}
						</div>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Informations du projet</CardTitle>
							<CardDescription>
								Détails et métadonnées du projet
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">
									Créé le :
								</span>
								<span>{formatDate(project.created_at)}</span>
							</div>
							{project.updated_at !== project.created_at && (
								<div className="flex items-center gap-2 text-sm">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground">
										Modifié le :
									</span>
									<span>
										{formatDate(project.updated_at)}
									</span>
								</div>
							)}
							<div className="pt-4 border-t">
								<h2 className="text-base font-bold mb-2">
									Bien associé
								</h2>
								<NavLink
									to={`/properties/${selectedProperty.id}`}
									className="text-primary hover:underline"
								>
									{selectedProperty.name}
								</NavLink>
							</div>
						</CardContent>
					</Card>
				</div>
			</PageTemplate>
		</>
	);
}
