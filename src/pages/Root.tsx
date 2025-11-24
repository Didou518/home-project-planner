import { getSessionDuration } from '@/utils/auth';
import { useEffect } from 'react';
import { Outlet, useLoaderData, useSubmit } from 'react-router';

export default function RootLayout() {
	const session = useLoaderData();
	const submit = useSubmit();

	useEffect(() => {
		if (!session) {
			return;
		}

		if (session === 'EXPIRED') {
			submit(null, { method: 'POST', action: '/logout' });
			return;
		}

		const duration = getSessionDuration(session.expires_at);

		setTimeout(() => {
			submit(null, { method: 'POST', action: '/logout' });
		}, duration);
	}, [session, submit]);

	return (
		<>
			<main>
				<Outlet />
			</main>
		</>
	);
}
