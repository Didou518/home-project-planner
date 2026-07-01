import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavLink } from 'react-router';
import { GripVertical } from 'lucide-react';
import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	restrictToParentElement,
	restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	useAllProjects,
	type AllProjectsItem,
} from '@/hooks/useAllProjects';
import { useProperties } from '@/hooks/useProperties';
import type { ProjectStatus } from '@/types/Project';

const breadcrumbs: Crumb[] = [
	{ label: 'Accueil', to: '/' },
	{ label: 'Tous les projets', to: '/projects' },
];

const STATUS_LABELS: Record<ProjectStatus, string> = {
	todo: 'À faire',
	in_progress: 'En cours',
	done: 'Terminé',
};

const STATUS_VARIANT: Record<
	ProjectStatus,
	'secondary' | 'default' | 'outline'
> = {
	todo: 'outline',
	in_progress: 'default',
	done: 'secondary',
};

/** Une ligne projet déplaçable (poignée dédiée pour préserver le scroll tactile). */
function SortableRow({
	project,
	bienName,
}: {
	project: AllProjectsItem;
	bienName: string;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: project.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<li ref={setNodeRef} style={style}>
			<Card
				className={`flex flex-row items-center gap-2 p-3 ${
					isDragging ? 'opacity-60 shadow-lg' : ''
				}`}
			>
				<button
					type="button"
					ref={setActivatorNodeRef}
					className="shrink-0 cursor-grab touch-none rounded p-2 text-muted-foreground hover:bg-accent active:cursor-grabbing"
					aria-label={`Déplacer le projet : ${project.name}`}
					{...attributes}
					{...listeners}
				>
					<GripVertical className="h-5 w-5" />
				</button>
				<NavLink
					to={`/properties/${project.property_id}/projects/${project.id}`}
					className="flex min-w-0 flex-1 items-center justify-between gap-3 hover:underline"
				>
					<div className="min-w-0">
						<p className="truncate font-medium">{project.name}</p>
						<p className="truncate text-sm text-muted-foreground">
							{bienName}
						</p>
					</div>
					<Badge
						variant={STATUS_VARIANT[project.status]}
						className="shrink-0"
					>
						{STATUS_LABELS[project.status]}
					</Badge>
				</NavLink>
			</Card>
		</li>
	);
}

export default function AllProjectsPage() {
	const { projects, isLoading, error, reorder } = useAllProjects();
	const { data: properties } = useProperties();

	const sensors = useSensors(
		// Distance d'activation : un simple tap/clic ne déclenche pas un drag
		// (sur mobile, le scroll de la liste reste possible hors poignée).
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const bienName = (id: string) =>
		properties?.find((p) => p.id === id)?.name ?? '';

	const onDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = projects.findIndex((p) => p.id === active.id);
		const newIndex = projects.findIndex((p) => p.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;
		reorder.mutate(arrayMove(projects, oldIndex, newIndex));
	};

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<div className="space-y-2">
						<Heading1>Tous les projets</Heading1>
						<p className="text-muted-foreground">
							Glissez les projets par la poignée pour les
							prioriser. L'ordre est partagé avec votre foyer.
						</p>
					</div>

					{isLoading ? (
						<p className="text-muted-foreground">Chargement…</p>
					) : error ? (
						<p className="text-destructive">
							Impossible de charger les projets.
						</p>
					) : projects.length > 0 ? (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							modifiers={[
								restrictToVerticalAxis,
								restrictToParentElement,
							]}
							onDragEnd={onDragEnd}
						>
							<SortableContext
								items={projects.map((p) => p.id)}
								strategy={verticalListSortingStrategy}
							>
								<ul className="flex flex-col gap-3">
									{projects.map((project) => (
										<SortableRow
											key={project.id}
											project={project}
											bienName={bienName(
												project.property_id
											)}
										/>
									))}
								</ul>
							</SortableContext>
						</DndContext>
					) : (
						<p className="text-muted-foreground">
							Aucun projet pour l'instant.
						</p>
					)}
				</div>
			</PageTemplate>
		</>
	);
}
