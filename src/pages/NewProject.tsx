import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';

const breadcrumbs: Crumb[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Projets', to: '/projects' },
	{ label: 'Nouveau Projet', to: '/projects/new' },
];

export default function NewProjectPage() {
	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<Heading1>Nouveau Projet</Heading1>
			</PageTemplate>
		</>
	);
}
