import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import ProjectForm from '@/components/ProjectForm';
import { useParams, useNavigate } from 'react-router';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function NewProjectPage() {
	const { id: propertyId } = useParams();
	const { selectedProperty } = useSelectionStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!selectedProperty && !propertyId) {
			toast.error('Bien non sélectionné', {
				description:
					'Veuillez sélectionner un bien pour créer un projet',
			});
			navigate('/properties');
		}
	}, [selectedProperty, propertyId, navigate]);

	const currentPropertyId = propertyId || selectedProperty?.id;
	const breadcrumbs: Crumb[] = [
		{ label: 'Accueil', to: '/' },
		{ label: 'Propriétés', to: '/properties' },
		{
			label: selectedProperty?.name ?? '',
			to: `/properties/${selectedProperty?.id}`,
		},
		{
			label: 'Nouveau projet',
			to: `/properties/${currentPropertyId}/projects/new`,
		},
	];

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<Heading1>Nouveau projet</Heading1>
				{currentPropertyId && <ProjectForm method="post" />}
			</PageTemplate>
		</>
	);
}
