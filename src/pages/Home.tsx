import PageTemplate from '@/components/PageTemplate';
import styles from './Home.module.css';
import Breadcrumbs from '@/components/Breadcrumbs';
import { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';

const breadcrumbs: Crumb[] = [{ label: 'Accueil', to: '/' }];

export default function HomePage() {
	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<section className={styles.home}>
					<Heading1>Home Project Planner</Heading1>
					<p>Ha ci bo</p>
				</section>
			</PageTemplate>
		</>
	);
}
