import PageTemplate from '@/components/PageTemplate';
import Breadcrumbs from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import ProjectForm from '@/components/ProjectForm';
import { useNavigate } from 'react-router';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { toast } from 'sonner';
import { useEffect } from 'react';

const breadcrumbs = [
	{
		label: 'Accueil',
		to: '/',
	},
	{
		label: 'Propriétés',
		to: '/properties',
	},
];

export default function EditProjectPage() {
	const { selectedProject } = useSelectionStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!selectedProject) {
			toast.error('Projet non sélectionné', {
				description: 'Veuillez sélectionner un projet pour commencer',
			});
			navigate('/properties');
		}
	}, [selectedProject, navigate]);

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<Heading1>Mon projet</Heading1>
				{selectedProject && (
					<ProjectForm
						key={selectedProject.id}
						method="patch"
						project={selectedProject}
					/>
				)}
			</PageTemplate>
		</>
	);
}
