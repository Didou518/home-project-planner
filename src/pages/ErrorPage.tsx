import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import { Home } from 'lucide-react';
import { isRouteErrorResponse, NavLink, useRouteError } from 'react-router';

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

	return (
		<>
			<PageTemplate>
				<section className="flex flex-col items-center justify-center gap-4">
					<Heading1>Oups...</Heading1>
					<h3>{title}</h3>
					<p>{message}</p>
					<NavLink to="/" className="flex items-center gap-2">
						<Home />
						Retour à l'accueil
					</NavLink>
				</section>
			</PageTemplate>
		</>
	);
}
