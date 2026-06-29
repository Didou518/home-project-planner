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
	signInWithGoogle,
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

	const handleGoogle = async () => {
		try {
			await signInWithGoogle();
		} catch {
			toast.error('La connexion Google a échoué');
		}
	};

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
						<Button
							type="button"
							variant="outline"
							onClick={handleGoogle}
							className="w-full"
						>
							<svg
								className="mr-2 h-4 w-4"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									fill="#4285F4"
									d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.54-5.17 3.54-8.86z"
								/>
								<path
									fill="#34A853"
									d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A11.99 11.99 0 0 0 12 24z"
								/>
								<path
									fill="#FBBC05"
									d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.26a12 12 0 0 0 0 10.76l4.01-3.09z"
								/>
								<path
									fill="#EA4335"
									d="M12 4.74c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.26 6.62l4.01 3.09C6.22 6.85 8.87 4.74 12 4.74z"
								/>
							</svg>
							Continuer avec Google
						</Button>
						<div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
							<span className="h-px flex-1 bg-border" />
							ou
							<span className="h-px flex-1 bg-border" />
						</div>
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
		if (isSignIn) {
			await signInWithPassword({ email, password });
			toast.success('You are now logged in');
			return redirect('/');
		} else {
			await signUpWithPassword({ email, password });
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
