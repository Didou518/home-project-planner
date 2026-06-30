import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { NavLink } from 'react-router';
import { FolderKanban } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useProperties } from '@/hooks/useProperties';

const breadcrumbs: Crumb[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Projets en cours', to: '/projects/in-progress' },
];

export default function InProgressProjectsPage() {
	const { inProgress, isLoading, error } = useDashboard();
	const { data: properties } = useProperties();

	const bienName = (id: string) =>
		properties?.find((p) => p.id === id)?.name ?? '';

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<Heading1>Projets en cours</Heading1>

					{isLoading ? (
						<p className="text-muted-foreground">Chargement…</p>
					) : error ? (
						<p className="text-destructive">
							Impossible de charger les projets.
						</p>
					) : inProgress.length > 0 ? (
						<ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{inProgress.map((p) => (
								<li key={p.id}>
									<NavLink
										to={`/properties/${p.property_id}/projects/${p.id}`}
										className="block"
									>
										<Card className="transition-colors hover:bg-accent">
											<CardHeader>
												<div className="flex items-center gap-2">
													<FolderKanban className="h-4 w-4 text-muted-foreground" />
													<CardTitle className="text-base">
														{p.name}
													</CardTitle>
												</div>
												<CardDescription>
													{bienName(p.property_id)}
												</CardDescription>
											</CardHeader>
										</Card>
									</NavLink>
								</li>
							))}
						</ul>
					) : (
						<p className="text-muted-foreground">
							Aucun projet en cours.
						</p>
					)}
				</div>
			</PageTemplate>
		</>
	);
}
