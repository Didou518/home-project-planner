import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import Heading1 from '@/components/Heading1';
import PageTemplate from '@/components/PageTemplate';
import PageMessage from '@/components/PageMessage';
import ProjectTasks from '@/components/project/ProjectTasks';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Edit, Calendar, Loader2 } from 'lucide-react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useProperty } from '@/hooks/useProperty';
import { useProject } from '@/hooks/useProject';
import { useProjectTasks } from '@/hooks/useProjectTasks';
import {
	deleteProject,
	updateProject,
	queryClient,
} from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import DeleteModal from '@/components/DeleteModal';
import ProjectBudget from '@/components/project/ProjectBudget';
import ProjectPhotos from '@/components/project/ProjectPhotos';
import { useProjectExpenses } from '@/hooks/useProjectExpenses';
import { formatEuro } from '@/lib/utils';
import type { ProjectStatus } from '@/types/Project';
import type { ProjectTask } from '@/types/ProjectTask';
import type { ProjectExpense } from '@/types/ProjectExpense';

const STATUS_LABELS: Record<ProjectStatus, string> = {
	todo: 'À faire',
	in_progress: 'En cours',
	done: 'Terminé',
};

export default function ProjectPage() {
	const { id: propertyId, projectId } = useParams();
	const navigate = useNavigate();

	const {
		data: property,
		isLoading: isPropertyLoading,
		error: propertyError,
	} = useProperty(propertyId ?? '');
	const {
		data: project,
		isLoading: isProjectLoading,
		error: projectError,
	} = useProject(projectId ?? '');
	const { data: tasksData } = useProjectTasks(projectId ?? '');
	const { data: expensesData } = useProjectExpenses(projectId ?? '');

	const { mutate: deleteProjectMutation, isPending: isDeletingProject } =
		useMutation({
			mutationFn: () => deleteProject(projectId ?? ''),
			onSuccess: () => {
				toast.success('Projet supprimé avec succès');
				queryClient.invalidateQueries({ queryKey: ['projects'] });
				navigate(`/properties/${propertyId}/projects`);
			},
			onError: () => {
				toast.error('Erreur lors de la suppression du projet');
			},
		});

	const statusMutation = useMutation({
		mutationFn: (status: ProjectStatus) =>
			updateProject(projectId ?? '', { status }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['project', projectId] });
			queryClient.invalidateQueries({
				queryKey: ['projects', propertyId],
			});
		},
		onError: () => toast.error('Impossible de changer le statut'),
	});

	if (isPropertyLoading || isProjectLoading) {
		return <PageMessage loading />;
	}
	if (propertyError || projectError) {
		return (
			<PageMessage
				title="Erreur de chargement"
				description="Impossible de charger ce projet. Réessayez plus tard."
				backTo="/properties"
				backLabel="Voir mes biens"
			/>
		);
	}
	if (!property || !project) {
		return (
			<PageMessage
				title="Projet introuvable"
				description="Ce projet n'existe pas ou n'est plus accessible."
				backTo={
					property
						? `/properties/${property.id}/projects`
						: '/properties'
				}
				backLabel={property ? 'Voir les projets' : 'Voir mes biens'}
			/>
		);
	}

	const breadcrumbs: Crumb[] = [
		{ label: 'Accueil', to: '/' },
		{ label: 'Biens', to: '/properties' },
		{ label: property.name, to: `/properties/${property.id}` },
		{ label: 'Projets', to: `/properties/${property.id}/projects` },
		{
			label: project.name,
			to: `/properties/${property.id}/projects/${project.id}`,
		},
	];

	const tasks = (tasksData ?? []) as ProjectTask[];
	const doneCount = tasks.filter((t) => t.is_done).length;
	const totalCount = tasks.length;
	const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

	const expenses = (expensesData ?? []) as ProjectExpense[];
	const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
	const budgetValue = project.budget == null ? null : Number(project.budget);
	const remaining = budgetValue != null ? budgetValue - spent : null;

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<>
			<Breadcrumbs crumbs={breadcrumbs} />
			<PageTemplate>
				<div className="flex flex-col gap-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="space-y-2">
							<Heading1>{project.name}</Heading1>
							{project.description && (
								<p className="text-muted-foreground">
									{project.description}
								</p>
							)}
							<Select
								value={project.status}
								onValueChange={(v) =>
									statusMutation.mutate(v as ProjectStatus)
								}
							>
								<SelectTrigger className="w-[160px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(
										Object.keys(
											STATUS_LABELS
										) as ProjectStatus[]
									).map((s) => (
										<SelectItem key={s} value={s}>
											{STATUS_LABELS[s]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex gap-2">
							<NavLink
								to={`/properties/${property.id}/projects/${project.id}/edit`}
							>
								<Button>
									<Edit className="mr-2 h-4 w-4" />
									Éditer le projet
								</Button>
							</NavLink>
							{isDeletingProject ? (
								<Button disabled>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Suppression...
								</Button>
							) : (
								<DeleteModal
									onDelete={() => deleteProjectMutation()}
								/>
							)}
						</div>
					</div>

					{/* Bandeau KPI — Avancement + Budget (Fichiers : M4) */}
					<div className="grid gap-4 sm:grid-cols-2">
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Avancement</CardDescription>
								<CardTitle className="text-2xl">
									{pct}%
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Progress value={pct} />
								<p className="mt-2 text-sm text-muted-foreground">
									{doneCount} / {totalCount} tâche
									{totalCount > 1 ? 's' : ''} terminée
									{doneCount > 1 ? 's' : ''}
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Budget</CardDescription>
								<CardTitle className="text-2xl">
									{formatEuro(spent)}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{budgetValue != null && remaining != null ? (
									<p className="text-sm text-muted-foreground">
										sur {formatEuro(budgetValue)} · reste{' '}
										<span
											className={
												remaining < 0
													? 'font-medium text-destructive'
													: 'font-medium text-green-600'
											}
										>
											{formatEuro(remaining)}
										</span>
									</p>
								) : (
									<p className="text-sm text-muted-foreground">
										Aucun budget défini
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					<Tabs defaultValue="tasks">
						<TabsList>
							<TabsTrigger value="tasks">Tâches</TabsTrigger>
							<TabsTrigger value="budget">Budget</TabsTrigger>
							<TabsTrigger value="files">Fichiers</TabsTrigger>
							<TabsTrigger value="infos">Infos</TabsTrigger>
						</TabsList>
						<TabsContent value="tasks" className="pt-4">
							<ProjectTasks projectId={project.id} />
						</TabsContent>
						<TabsContent value="budget" className="pt-4">
							<ProjectBudget
								projectId={project.id}
								budget={project.budget}
							/>
						</TabsContent>
						<TabsContent value="files" className="pt-4">
							<ProjectPhotos projectId={project.id} />
						</TabsContent>
						<TabsContent value="infos" className="pt-4">
							<Card>
								<CardHeader>
									<CardTitle>Informations</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">
											Créé le :
										</span>
										<span>
											{formatDate(project.created_at)}
										</span>
									</div>
									{project.updated_at !==
										project.created_at && (
										<div className="flex items-center gap-2 text-sm">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">
												Modifié le :
											</span>
											<span>
												{formatDate(project.updated_at)}
											</span>
										</div>
									)}
									<div className="border-t pt-4">
										<h2 className="mb-2 text-base font-bold">
											Bien associé
										</h2>
										<NavLink
											to={`/properties/${property.id}`}
											className="text-primary hover:underline"
										>
											{property.name}
										</NavLink>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</PageTemplate>
		</>
	);
}
