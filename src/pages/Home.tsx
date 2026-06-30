import type { ReactNode } from 'react';
import PageTemplate from '@/components/PageTemplate';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { NavLink } from 'react-router';
import {
	Home as HomeIcon,
	FolderKanban,
	Wallet,
	ArrowRight,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { formatEuro } from '@/lib/utils';

const breadcrumbs: Crumb[] = [{ label: 'Accueil', to: '/' }];

function KpiCard({
	icon,
	label,
	value,
	to,
}: {
	icon: ReactNode;
	label: string;
	value: string;
	to?: string;
}) {
	const card = (
		<Card
			className={`h-full py-4 ${to ? 'transition-colors hover:bg-accent' : ''}`}
		>
			<CardHeader className="pb-2">
				<div className="flex items-center gap-2 text-muted-foreground">
					{icon}
					<CardDescription>{label}</CardDescription>
				</div>
				<CardTitle className="text-2xl">{value}</CardTitle>
			</CardHeader>
		</Card>
	);

	return to ? (
		<NavLink to={to} className="block">
			{card}
		</NavLink>
	) : (
		card
	);
}

export default function HomePage() {
	const { isLoading, error, biensCount, inProgress, totalSpent } =
		useDashboard();

	const v = (value: string) => (isLoading ? '…' : value);

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<Heading1>Tableau de bord</Heading1>

					{error ? (
						<p className="text-destructive">
							Impossible de charger le tableau de bord.
						</p>
					) : (
						<>
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
								<KpiCard
									icon={<HomeIcon className="h-4 w-4" />}
									label="Biens"
									value={v(String(biensCount))}
									to="/properties"
								/>
								<KpiCard
									icon={<FolderKanban className="h-4 w-4" />}
									label="Projets en cours"
									value={v(String(inProgress.length))}
									to="/projects/in-progress"
								/>
								<KpiCard
									icon={<Wallet className="h-4 w-4" />}
									label="Total dépensé"
									value={v(formatEuro(totalSpent))}
								/>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>Projets en cours</CardTitle>
									<CardDescription>
										Les projets actuellement « en cours »
										sur tous vos biens.
									</CardDescription>
								</CardHeader>
								<CardContent>
									{isLoading ? (
										<p className="text-sm text-muted-foreground">
											Chargement…
										</p>
									) : inProgress.length > 0 ? (
										<ul className="divide-y">
											{inProgress.map((p) => (
												<li key={p.id}>
													<NavLink
														to={`/properties/${p.property_id}/projects/${p.id}`}
														className="flex items-center justify-between gap-3 py-2 text-sm hover:underline"
													>
														<span className="min-w-0 truncate">
															{p.name}
														</span>
														<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
													</NavLink>
												</li>
											))}
										</ul>
									) : (
										<p className="text-sm text-muted-foreground">
											Aucun projet en cours.
										</p>
									)}
								</CardContent>
							</Card>
						</>
					)}
				</div>
			</PageTemplate>
		</>
	);
}
