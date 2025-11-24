import { Form } from 'react-router';
import styles from './Home.module.css';
import { Button } from '@/components/ui/button';

export default function Home() {
	return (
		<>
			<section className={styles.home}>
				<div className={styles.home__left}>
					<h1 className="text-4xl font-bold">Home Project Planner</h1>
				</div>
				<div className={styles.home__right}>
					Ha ci bo
					<Form method="post" action="/logout">
						<Button type="submit">Logout</Button>
					</Form>
				</div>
			</section>
		</>
	);
}
