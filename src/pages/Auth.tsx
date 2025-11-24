import {
	Form,
	NavLink,
	redirect,
	useLocation,
	useNavigate,
} from 'react-router';
import styles from './Auth.module.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
	signInWithPassword,
	signUpWithPassword,
} from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';

export default function Auth() {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { pathname } = useLocation();
	const isSignIn = pathname === '/signin';

	useEffect(() => {
		if (user) {
			navigate('/');
		}
	}, [user, navigate]);

	return (
		<>
			<section className={styles.auth}>
				<div className={styles.auth__left}>
					<h1 className="text-4xl font-bold">Home Project Planner</h1>
					<h2 className="text-2xl font-bold">
						{isSignIn ? 'Login' : 'Créer un compte'}
					</h2>
				</div>
				<div className={styles.auth__right}>
					<section className={styles.authForm}>
						<h2 className={styles.authForm__title}>
							{isSignIn ? 'Login' : 'Créer un compte'}
						</h2>
						<p className={styles.authForm__description}>
							{isSignIn
								? 'Connectez-vous à votre compte pour accéder à votre espace personnel.'
								: 'Créez un compte pour accéder à votre espace personnel.'}
							personnel.
						</p>
						<Form method="post" className={styles.authForm__form}>
							<div className={styles.authForm__inputGroup}>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
							</div>
							<div className={styles.authForm__inputGroup}>
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
								</div>
								<Input
									id="password"
									name="password"
									type="password"
									required
								/>
							</div>
							<Button
								type="submit"
								className={styles.authForm__submit}
							>
								{isSignIn ? 'Me connecter' : 'Créer un compte'}
							</Button>
						</Form>
						{isSignIn && (
							<NavLink
								className={styles.authForm__registerLink}
								to="/signup"
							>
								Pas encore de compte ? Créez-en un gratuitement
							</NavLink>
						)}
						{!isSignIn && (
							<NavLink
								className={styles.authForm__registerLink}
								to="/signin"
							>
								Vous avez déjà un compte ? Identifiez-vous !
							</NavLink>
						)}
					</section>
				</div>
			</section>
		</>
	);
}

export async function action({ request }: { request: Request }) {
	const isSignIn = request.url.includes('/signin');
	const formData = await request.formData();
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	if (!email || !password) {
		toast.error('Email and password are required');
		return null;
	}

	try {
		let data;
		if (isSignIn) {
			data = await signInWithPassword({ email, password });
		} else {
			data = await signUpWithPassword({ email, password });
		}

		if (isSignIn) {
			localStorage.setItem('session', JSON.stringify(data.session));
			toast.success('You are now logged in');

			return redirect('/');
		} else {
			toast.success('Your account has been created', {
				description:
					'You have received an email to confirm your account. Please check your inbox.',
			});
			return redirect('/signin');
		}
	} catch (error) {
		let message = 'An unknown error occurred';
		if (error instanceof Error) {
			message = error.message;
		}
		toast.error(message);
		return null;
	}
}
