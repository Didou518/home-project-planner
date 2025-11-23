import { Form } from 'react-router';
import styles from './LoginForm.module.css';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

export default function LoginForm() {
	return (
		<>
			<h2 className={styles.loginForm__title}>Me connecter</h2>
			<p className={styles.loginForm__description}>
				Connectez-vous à votre compte pour accéder à votre espace
				personnel.
			</p>
			<Form className={styles.loginForm}>
				<div className={styles.loginForm__inputGroup}>
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						required
					/>
				</div>
				<div className={styles.loginForm__inputGroup}>
					<div className="flex items-center">
						<Label htmlFor="password">Password</Label>
						{/* <a
							href="#"
							className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
						>
							Forgot your password?
						</a> */}
					</div>
					<Input id="password" type="password" required />
				</div>
				<Button type="submit" className={styles.loginForm__submit}>
					Me connecter
				</Button>
			</Form>
		</>
	);
}
