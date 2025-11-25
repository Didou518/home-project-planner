import PageTemplate from '@/components/PageTemplate';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import ProjectForm from '@/components/ProjectForm';
import { useNavigate } from 'react-router';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function EditProjectPage() {
	const { selectedProject, selectedProperty } = useSelectionStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!selectedProject) {
			toast.error('Projet non sélectionné', {
				description: 'Veuillez sélectionner un projet pour commencer',
			});
			navigate('/properties');
		}
	}, [selectedProject, navigate]);

	if (!selectedProject || !selectedProperty) {
		return null;
	}

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
			label: selectedProperty.name,
			to: `/properties/${selectedProperty.id}`,
		},
		{
			label: 'Projets',
			to: `/properties/${selectedProperty.id}/projects`,
		},
		{
			label: selectedProject.name,
			to: `/properties/${selectedProperty.id}/projects/${selectedProject.id}`,
		},
		{
			label: 'Modifier',
			to: `/properties/${selectedProperty.id}/projects/${selectedProject.id}/edit`,
		},
	];

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<Heading1>Modifier le projet</Heading1>
					<ProjectForm
						key={selectedProject.id}
						method="patch"
						project={selectedProject}
					/>
				</div>
			</PageTemplate>
		</>
	);
}
