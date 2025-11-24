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
			<SidebarTrigger />
			<Breadcrumb>
				<BreadcrumbList>
					{crumbs.map((crumb, index) => (
						<Fragment key={index}>
							{index !== 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<NavLink to={crumb.to}>
										{crumb.label}
									</NavLink>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	);
}

export type { Crumb };
