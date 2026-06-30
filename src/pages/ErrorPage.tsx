import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import { Home } from 'lucide-react';
import { isRouteErrorResponse, NavLink, useRouteError } from 'react-router';

/**
 * Extrait un message + une trace lisibles depuis l'erreur capturée par le
 * routeur. Couvre les 3 cas : réponse de route (loader/action), Error JS
 * (crash de rendu), et valeur arbitraire jetée.
 */
function describeError(error: unknown): { detail: string; stack?: string } {
	if (isRouteErrorResponse(error)) {
		return {
			detail: `HTTP ${error.status} ${error.statusText}${
				error.data ? ` — ${JSON.stringify(error.data)}` : ''
			}`,
		};
	}
	if (error instanceof Error) {
		return { detail: `${error.name}: ${error.message}`, stack: error.stack };
	}
	try {
		return { detail: JSON.stringify(error) };
	} catch {
		return { detail: String(error) };
	}
}

export default function ErrorPage() {
	const error = useRouteError();

	let title = 'Une erreur est survenue';
	let message = 'Quelque chose s’est mal passé.';

	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			title = 'Introuvable';
			message = 'Cette page ou cette ressource n’existe pas.';
		} else if (error.data?.message) {
			message = error.data.message;
		}
	}

	const { detail, stack } = describeError(error);

	return (
		<>
			<PageTemplate>
				<section className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 text-center">
					<Heading1>Oups...</Heading1>
					<h3>{title}</h3>
					<p>{message}</p>
					<NavLink to="/" className="flex items-center gap-2">
						<Home />
						Retour à l'accueil
					</NavLink>

					{/* Détail technique — replié par défaut. Permet de récupérer
					    la cause exacte (utile pour les bugs propres à un
					    navigateur/appareil qu'on ne reproduit pas en local). */}
					<details className="mt-4 w-full text-left">
						<summary className="cursor-pointer text-sm text-muted-foreground">
							Détails techniques
						</summary>
						<pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-xs">
							{detail}
							{stack ? `\n\n${stack}` : ''}
						</pre>
					</details>
				</section>
			</PageTemplate>
		</>
	);
}
