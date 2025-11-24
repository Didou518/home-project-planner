import { redirect } from 'react-router';

export function getAuthSession() {
	const rawSession = localStorage.getItem('session');

	if (!rawSession) {
		return null;
	}

	const session = JSON.parse(rawSession);
	const duration = getSessionDuration(session.expires_at);

	if (duration < 0) {
		return 'EXPIRED';
	}

	return session;
}

export function checkAuthLoader() {
	const session = getAuthSession();
	if (!session) {
		return redirect('/signin');
	}
	return session;
}

export function getSessionDuration(expires_at: number) {
	const now = new Date();
	const duration = expires_at * 1000 - now.getTime();
	return duration;
}
