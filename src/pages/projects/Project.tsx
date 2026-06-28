import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import PageMessage from '@/components/PageMessage';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Edit, Calendar, Loader2 } from 'lucide-react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useProperty } from '@/hooks/useProperty';
import { useProject } from '@/hooks/useProject';
import { deleteProject, queryClient } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import DeleteModal from '@/components/DeleteModal';

export default function ProjectPage() {
	const { id: propertyId, projectId } = useParams();
	const navigate = useNavigate();

	const {
		data: property,
		isLoading: isPropertyLoading,
		error: propertyError,
	} = useProperty(propertyId ?? '');
	const {
		data: project,
		isLoading: isProjectLoading,
		error: projectError,
	} = useProject(projectId ?? '');

	const { mutate: deleteProjectMutation, isPending: isDeletingProject } =
		useMutation({
			mutationFn: () => deleteProject(projectId ?? ''),
			onSuccess: () => {
				toast.success('Projet supprimé avec succès');
				queryClient.invalidateQueries({ queryKey: ['projects'] });
				navigate(`/properties/${propertyId}/projects`);
			},
			onError: () => {
				toast.error('Erreur lors de la suppression du projet');
			},
		});

	if (isPropertyLoading || isProjectLoading) {
		return <PageMessage loading />;
	}
	if (propertyError || projectError) {
		return (
			<PageMessage
				title="Erreur de chargement"
				description="Impossible de charger ce projet. Réessayez plus tard."
				backTo="/properties"
				backLabel="Voir mes biens"
			/>
		);
	}
	if (!property || !project) {
		return (
			<PageMessage
				title="Projet introuvable"
				description="Ce projet n'existe pas ou n'est plus accessible."
				backTo={
					property
						? `/properties/${property.id}/projects`
						: '/properties'
				}
				backLabel={property ? 'Voir les projets' : 'Voir mes biens'}
			/>
		);
	}

	const breadcrumbs: Crumb[] = [
		{ label: 'Accueil', to: '/' },
		{ label: 'Biens', to: '/properties' },
		{ label: property.name, to: `/properties/${property.id}` },
		{ label: 'Projets', to: `/properties/${property.id}/projects` },
		{
			label: project.name,
			to: `/properties/${property.id}/projects/${project.id}`,
		},
	];

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
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
								to={`/properties/${property.id}/projects/${project.id}/edit`}
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
								<DeleteModal
									onDelete={() => deleteProjectMutation()}
								/>
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
									<span>{formatDate(project.updated_at)}</span>
								</div>
							)}
							<div className="pt-4 border-t">
								<h2 className="text-base font-bold mb-2">
									Bien associé
								</h2>
								<NavLink
									to={`/properties/${property.id}`}
									className="text-primary hover:underline"
								>
									{property.name}
								</NavLink>
							</div>
						</CardContent>
					</Card>
				</div>
			</PageTemplate>
		</>
	);
}
