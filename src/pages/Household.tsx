import { useState } from 'react';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	useHouseholdMembers,
	useHouseholdMutations,
} from '@/hooks/useHousehold';
import type { HouseholdMember } from '@/types/HouseholdMember';
import { Users, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: Crumb[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Foyer', to: '/household' },
];

export default function HouseholdPage() {
	const { data, isLoading, error } = useHouseholdMembers();
	const { createInvite, redeem, leave } = useHouseholdMutations();
	const [code, setCode] = useState('');

	const members = (data ?? []) as HouseholdMember[];
	const shared = members.length > 1;

	const copyCode = async () => {
		if (!createInvite.data) return;
		await navigator.clipboard.writeText(createInvite.data);
		toast.success('Code copié');
	};

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex max-w-2xl flex-col gap-6">
					<Heading1>Foyer</Heading1>
					<p className="text-muted-foreground">
						Partagez vos biens et projets avec un proche. Une fois
						vos comptes liés, tout est visible et modifiable par les
						deux.
					</p>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Users className="h-5 w-5 text-muted-foreground" />
								<CardTitle>Membres</CardTitle>
							</div>
							<CardDescription>
								{shared
									? 'Votre foyer est partagé.'
									: 'Vous êtes seul dans votre foyer.'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<p className="text-sm text-muted-foreground">
									Chargement…
								</p>
							) : error ? (
								<p className="text-sm text-destructive">
									Impossible de charger le foyer.
								</p>
							) : (
								<ul className="space-y-2">
									{members.map((m) => (
										<li
											key={m.user_id}
											className="flex items-center gap-2 text-sm"
										>
											<span>{m.email}</span>
											{m.is_me && (
												<Badge variant="secondary">
													vous
												</Badge>
											)}
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Inviter un proche</CardTitle>
							<CardDescription>
								Génère un code à transmettre. Il le saisira pour
								rejoindre ton foyer (valable 7 jours).
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								onClick={() => createInvite.mutate()}
								disabled={createInvite.isPending}
							>
								{createInvite.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Générer un code
							</Button>
							{createInvite.data && (
								<div className="flex items-center gap-2">
									<code className="rounded bg-muted px-3 py-2 font-mono text-lg tracking-widest">
										{createInvite.data}
									</code>
									<Button
										variant="outline"
										size="icon"
										onClick={copyCode}
										aria-label="Copier le code"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Rejoindre un foyer</CardTitle>
							<CardDescription>
								Saisis le code reçu. Tes biens restent les tiens
								et deviennent partagés avec ce foyer.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const c = code.trim();
									if (c) redeem.mutate(c);
								}}
								className="flex items-end gap-2"
							>
								<div className="space-y-1">
									<Label htmlFor="code">Code du foyer</Label>
									<Input
										id="code"
										value={code}
										onChange={(e) => setCode(e.target.value)}
										placeholder="ABCD1234"
										className="w-48 font-mono tracking-widest"
									/>
								</div>
								<Button
									type="submit"
									disabled={redeem.isPending || !code.trim()}
								>
									{redeem.isPending && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Rejoindre
								</Button>
							</form>
						</CardContent>
					</Card>

					{shared && (
						<Card>
							<CardHeader>
								<CardTitle>Quitter le foyer</CardTitle>
								<CardDescription>
									Vous ne verrez plus les biens des autres
									membres (et inversement). Vos propres biens
									restent à vous.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="destructive"
									onClick={() => leave.mutate()}
									disabled={leave.isPending}
								>
									{leave.isPending && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Quitter le foyer
								</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</PageTemplate>
		</>
	);
}
