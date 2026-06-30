import { NavLink } from 'react-router';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Fragment } from 'react/jsx-runtime';
import { SidebarTrigger } from './ui/sidebar';

type Crumb = {
	label: string;
	to: string;
};

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
	return (
		<div className="flex items-center gap-2 p-2">
			{/* Cible tactile ≥ 44px sur mobile (norme iOS HIG) ; compacte en desktop. */}
			<SidebarTrigger className="size-11 [&_svg]:size-5 sm:size-7 sm:[&_svg]:size-4" />
			<Breadcrumb>
				<BreadcrumbList>
					{crumbs.map((crumb, index) => {
						// Sur mobile : on ne montre que la page courante (le dernier
						// niveau), sinon le fil d'Ariane déborde. Complet en ≥ sm.
						const isLast = index === crumbs.length - 1;
						return (
							<Fragment key={index}>
								{index !== 0 && (
									<BreadcrumbSeparator className="hidden sm:flex" />
								)}
								<BreadcrumbItem
									className={isLast ? '' : 'hidden sm:flex'}
								>
									<BreadcrumbLink asChild>
										<NavLink to={crumb.to}>
											{crumb.label}
										</NavLink>
									</BreadcrumbLink>
								</BreadcrumbItem>
							</Fragment>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	);
}

export type { Crumb };
