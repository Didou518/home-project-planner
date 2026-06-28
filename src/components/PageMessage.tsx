import { NavLink } from 'react-router';
import { Loader2 } from 'lucide-react';
import PageTemplate from './PageTemplate';
import { Button } from './ui/button';

type PageMessageProps = {
	/** Affiche un spinner de chargement (ignore les autres champs). */
	loading?: boolean;
	title?: string;
	description?: string;
	backTo?: string;
	backLabel?: string;
};

/**
 * État terminal d'une page : chargement, erreur, ou ressource introuvable.
 * Centralise l'UI répétée des pages détail/listes.
 */
export default function PageMessage({
	loading = false,
	title,
	description,
	backTo,
	backLabel,
}: PageMessageProps) {
	return (
		<PageTemplate>
			<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
				{loading ? (
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				) : (
					<>
						{title && (
							<h2 className="text-xl font-semibold">{title}</h2>
						)}
						{description && (
							<p className="text-muted-foreground">
								{description}
							</p>
						)}
						{backTo && (
							<NavLink to={backTo}>
								<Button variant="outline">
									{backLabel ?? 'Retour'}
								</Button>
							</NavLink>
						)}
					</>
				)}
			</div>
		</PageTemplate>
	);
}
