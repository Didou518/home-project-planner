import { useState } from 'react';
import {
	useProjectTasks,
	useProjectTaskMutations,
} from '@/hooks/useProjectTasks';
import type { ProjectTask } from '@/types/ProjectTask';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Loader2 } from 'lucide-react';

export default function ProjectTasks({ projectId }: { projectId: string }) {
	const { data, isLoading, error } = useProjectTasks(projectId);
	const { addTask, toggleTask, deleteTask } =
		useProjectTaskMutations(projectId);
	const [label, setLabel] = useState('');

	const tasks = (data ?? []) as ProjectTask[];

	const handleAdd = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = label.trim();
		if (!trimmed) return;
		addTask.mutate(trimmed);
		setLabel('');
	};

	if (isLoading) {
		return (
			<p className="py-4 text-sm text-muted-foreground">
				Chargement des tâches…
			</p>
		);
	}
	if (error) {
		return (
			<p className="py-4 text-sm text-destructive">
				Impossible de charger les tâches.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			{tasks.length > 0 ? (
				<ul className="space-y-1">
					{tasks.map((task) => (
						<li
							key={task.id}
							className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
						>
							<Checkbox
								id={`task-${task.id}`}
								checked={task.is_done}
								className="size-5"
								onCheckedChange={(checked) =>
									toggleTask.mutate({
										id: task.id,
										isDone: checked === true,
									})
								}
							/>
							<label
								htmlFor={`task-${task.id}`}
								className={`flex-1 cursor-pointer text-sm ${
									task.is_done
										? 'text-muted-foreground line-through'
										: ''
								}`}
							>
								{task.label}
							</label>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
								onClick={() => deleteTask.mutate(task.id)}
								aria-label={`Supprimer la tâche : ${task.label}`}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</li>
					))}
				</ul>
			) : (
				<p className="py-2 text-sm text-muted-foreground">
					Aucune tâche. Ajoutez la première étape pour suivre
					l'avancement.
				</p>
			)}

			<form onSubmit={handleAdd} className="flex items-center gap-2">
				<Input
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					placeholder="Ajouter une tâche…"
					aria-label="Nouvelle tâche"
				/>
				<Button
					type="submit"
					size="icon"
					disabled={addTask.isPending || !label.trim()}
					aria-label="Ajouter la tâche"
				>
					{addTask.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Plus className="h-4 w-4" />
					)}
				</Button>
			</form>
		</div>
	);
}
