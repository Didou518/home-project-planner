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
import { Edit, Calendar, Plus, FolderKanban, Loader2 } from 'lucide-react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';
import { useProperty } from '@/hooks/useProperty';
import DeleteModal from '@/components/DeleteModal';
import { useMutation } from '@tanstack/react-query';
import { deleteProperty, queryClient } from '@/integrations/supabase/client';

export default function PropertyPage() {
	const { id: propertyId } = useParams();
	const navigate = useNavigate();

	const {
		data: property,
		isLoading: isPropertyLoading,
		error: propertyError,
	} = useProperty(propertyId ?? '');
	const { data: projects, isLoading: isProjectsLoading } = useProjects(
		propertyId ?? ''
	);

	const { mutate: deletePropertyMutation, isPending: isDeletingProperty } =
		useMutation({
			mutationFn: () => deleteProperty(propertyId ?? ''),
			onSuccess: () => {
				toast.success('Bien supprimé avec succès');
				queryClient.invalidateQueries({ queryKey: ['properties'] });
				navigate('/properties');
			},
			onError: () => {
				toast.error('Erreur lors de la suppression du bien');
			},
		});

	if (isPropertyLoading) {
		return <PageMessage loading />;
	}
	if (propertyError) {
		return (
			<PageMessage
				title="Erreur de chargement"
				description="Impossible de charger ce bien. Réessayez plus tard."
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
					<div className="flex flex-wrap items-start justify-between gap-4">
						<Heading1>{property.name}</Heading1>
						<div className="flex w-full gap-2 sm:w-auto">
							<NavLink
								to={`/properties/${property.id}/edit`}
								className="flex-1 sm:flex-none"
							>
								<Button className="w-full">
									<Edit className="mr-2 h-4 w-4" />
									Éditer le bien
								</Button>
							</NavLink>
							{isDeletingProperty ? (
								<Button
									disabled
									className="flex-1 sm:flex-none"
								>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Suppression...
								</Button>
							) : (
								<DeleteModal
									onDelete={() => deletePropertyMutation()}
									className="flex-1 sm:flex-none"
								/>
							)}
						</div>
					</div>

					<Card>
						<CardHeader>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<CardTitle>Projets</CardTitle>
									<CardDescription>
										Liste des projets associés à ce bien
									</CardDescription>
								</div>
								<NavLink
									to={`/properties/${property.id}/projects/new`}
									className="w-full sm:w-auto"
								>
									<Button size="sm" className="w-full sm:w-auto">
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
										Créez votre premier projet pour commencer
									</p>
								</div>
							)}
						</CardContent>
					</Card>

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
				</div>
			</PageTemplate>
		</>
	);
}
