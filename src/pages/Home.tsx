import { Form } from 'react-router';
import styles from './Home.module.css';
import { Button } from '@/components/ui/button';

export default function Home() {
	return (
		<>
			<section className={styles.home}>
				<h1 className="text-4xl font-bold">Home Project Planner</h1>
				<p>Ha ci bo</p>
			</section>
		</>
	);
}
