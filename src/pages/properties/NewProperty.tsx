import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import PropertyForm from '@/components/PropertyForm';

const breadcrumbs: Crumb[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Propriétés', to: '/properties' },
	{ label: 'Nouveau bien', to: '/properties/new' },
];

export default function NewPropertyPage() {
	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<Heading1>Nouveau bien</Heading1>
					<PropertyForm method="post" />
				</div>
			</PageTemplate>
		</>
	);
}
