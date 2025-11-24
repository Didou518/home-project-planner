import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import { Home } from 'lucide-react';
import { isRouteErrorResponse, NavLink, useRouteError } from 'react-router';

export default function ErrorPage() {
	const error = useRouteError();

	let title = 'An error occurred!';
	let message = 'Something went wrong!';

	if (isRouteErrorResponse(error)) {
		if (error.status === 500) {
			message = error.data.message;
		}

		if (error.status === 404) {
			title = 'Not found!';
			message = 'Could not find resource or page.';
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
						Go home
					</NavLink>
				</section>
			</PageTemplate>
		</>
	);
}
