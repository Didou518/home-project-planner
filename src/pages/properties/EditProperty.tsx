import PageTemplate from '@/components/PageTemplate';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageMessage from '@/components/PageMessage';
import PropertyForm from '@/components/PropertyForm';
import { useParams } from 'react-router';
import { useProperty } from '@/hooks/useProperty';

export default function EditPropertyPage() {
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
		{ label: 'Modifier', to: `/properties/${property.id}/edit` },
	];

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<Heading1>Modifier le bien</Heading1>
					<PropertyForm
						key={property.id}
						method="patch"
						property={property}
					/>
				</div>
			</PageTemplate>
		</>
	);
}
