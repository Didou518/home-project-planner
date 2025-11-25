import PageTemplate from '@/components/PageTemplate';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PropertyForm from '@/components/PropertyForm';
import { useNavigate } from 'react-router';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function EditPropertyPage() {
	const { selectedProperty } = useSelectionStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!selectedProperty) {
			toast.error('Bien non sélectionné', {
				description: 'Veuillez sélectionner un bien pour commencer',
			});
			navigate('/properties');
		}
	}, [selectedProperty, navigate]);

	const breadcrumbs: Crumb[] = [
		{
			label: 'Accueil',
			to: '/',
		},
		{
			label: 'Propriétés',
			to: '/properties',
		},
		{
			label: selectedProperty?.name ?? '',
			to: `/properties/${selectedProperty?.id}`,
		},
		{
			label: 'Modifier',
			to: `/properties/${selectedProperty?.id}/edit`,
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
					<Heading1>Modifier le bien</Heading1>
					<PropertyForm
						key={selectedProperty.id}
						method="patch"
						property={selectedProperty}
					/>
				</div>
			</PageTemplate>
		</>
	);
}
