import { NavLink } from 'react-router';
import styles from './Home.module.css';
import LoginForm from '@/components/LoginForm';

export default function Home() {
	return (
		<>
			<section className={styles.home}>
				<div className={styles.home__left}>
					<h1 className="text-4xl font-bold">Home Project Planner</h1>
				</div>
				<div className={styles.home__right}>
					<NavLink className={styles.registerLink} to="/register">Créer un compte</NavLink>
					<section className={styles.loginForm}>
						<LoginForm />
					</section>
				</div>
			</section>
		</>
	);
}