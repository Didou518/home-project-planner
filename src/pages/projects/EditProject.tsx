import PageTemplate from '@/components/PageTemplate';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageMessage from '@/components/PageMessage';
import ProjectForm from '@/components/ProjectForm';
import { useParams } from 'react-router';
import { useProperty } from '@/hooks/useProperty';
import { useProject } from '@/hooks/useProject';

export default function EditProjectPage() {
	const { id: propertyId, projectId } = useParams();
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
		{
			label: 'Modifier',
			to: `/properties/${property.id}/projects/${project.id}/edit`,
		},
	];

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<Heading1>Modifier le projet</Heading1>
					<ProjectForm
						key={project.id}
						method="patch"
						project={project}
					/>
				</div>
			</PageTemplate>
		</>
	);
}
