import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { useSelectionStore } from '@/stores/useSelectionStore';
import type { Property } from '@/types/Property';

const breadcrumbs: Crumb[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Propriétés', to: '/properties' },
];

export default function PropertiesPage() {
	const { properties } = usePropertyStore();
	const { setSelectedProperty } = useSelectionStore();

	function handlePropertyClick(property: Property) {
		setSelectedProperty(property);
	}

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<Heading1>Mes Biens</Heading1>
				{properties && (
					<ul className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
						{properties.map((property) => (
							<li
								key={property.id}
								onClick={() => handlePropertyClick(property)}
							>
								<Card key={property.id}>
									<CardHeader>
										<CardTitle>{property.name}</CardTitle>
									</CardHeader>
								</Card>
							</li>
						))}
					</ul>
				)}
			</PageTemplate>
		</>
	);
}
