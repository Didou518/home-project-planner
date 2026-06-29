import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import PageMessage from '@/components/PageMessage';
import ProjectForm from '@/components/ProjectForm';
import { useParams } from 'react-router';
import { useProperty } from '@/hooks/useProperty';

export default function NewProjectPage() {
	const { id: propertyId } = useParams();
	const {
		data: property,
		isLoading,
		error,
	} = useProperty(propertyId ?? '');

	if (isLoading) {
		return <PageMessage loading />;
	}
	if (error) {
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
				description="Impossible de créer un projet : ce bien n'existe pas ou n'est plus accessible."
				backTo="/properties"
				backLabel="Voir mes biens"
			/>
		);
	}

	const breadcrumbs: Crumb[] = [
		{ label: 'Accueil', to: '/' },
		{ label: 'Biens', to: '/properties' },
		{ label: property.name, to: `/properties/${property.id}` },
		{
			label: 'Nouveau projet',
			to: `/properties/${property.id}/projects/new`,
		},
	];

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<Heading1>Nouveau projet</Heading1>
					<ProjectForm method="post" />
				</div>
			</PageTemplate>
		</>
	);
}
