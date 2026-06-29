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
					<p className="text-muted-foreground">
						Suivez l'avancement et le budget des projets de vos
						biens. Sélectionnez un bien dans le menu, ou créez-en un
						pour commencer.
					</p>
				</section>
			</PageTemplate>
		</>
	);
}
