import { useRef, useState } from 'react';
import {
	useProjectExpenses,
	useProjectExpenseMutations,
} from '@/hooks/useProjectExpenses';
import {
	useProjectFiles,
	useProjectFileMutations,
} from '@/hooks/useProjectFiles';
import type { ProjectExpense } from '@/types/ProjectExpense';
import type { ProjectFile } from '@/types/ProjectFile';
import {
	updateProject,
	queryClient,
	getProjectFileUrl,
} from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatEuro } from '@/lib/utils';
import { toast } from 'sonner';
import { Trash2, Plus, Loader2, Paperclip } from 'lucide-react';

/** Pièce jointe « devis » d'une dépense (upload / ouvrir / supprimer). */
function ExpenseDevis({
	file,
	onUpload,
	onDelete,
}: {
	file?: ProjectFile;
	onUpload: (f: File) => void;
	onDelete: (f: ProjectFile) => void;
}) {
	const ref = useRef<HTMLInputElement>(null);

	const openDevis = async () => {
		if (!file) return;
		const url = await getProjectFileUrl(file.path);
		window.open(url, '_blank', 'noopener');
	};

	return (
		<span className="flex items-center">
			<input
				ref={ref}
				type="file"
				accept="image/*,application/pdf"
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) onUpload(f);
					e.target.value = '';
				}}
			/>
			{file ? (
				<>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1 px-2"
						onClick={openDevis}
						title={file.name}
					>
						<Paperclip className="h-3.5 w-3.5" />{' '}
						<span className="hidden sm:inline">devis</span>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => onDelete(file)}
						aria-label="Supprimer le devis"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</>
			) : (
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1 px-2 text-muted-foreground"
					onClick={() => ref.current?.click()}
				>
					<Paperclip className="h-3.5 w-3.5" />{' '}
						<span className="hidden sm:inline">devis</span>
				</Button>
			)}
		</span>
	);
}

export default function ProjectBudget({
	projectId,
	budget,
}: {
	projectId: string;
	budget: number | null;
}) {
	const { data, isLoading, error } = useProjectExpenses(projectId);
	const { addExpense, deleteExpense } = useProjectExpenseMutations(projectId);

	// budget peut arriver en string (numeric Postgres) → on normalise.
	const budgetValue = budget == null ? null : Number(budget);

	const expenses = (data ?? []) as ProjectExpense[];
	const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
	const remaining = budgetValue != null ? budgetValue - spent : null;

	// Devis rattachés aux dépenses (kind='devis'), indexés par dépense.
	const { data: filesData } = useProjectFiles(projectId);
	const { uploadFile, deleteFile } = useProjectFileMutations(projectId);
	const devisByExpense = new Map<string, ProjectFile>();
	((filesData ?? []) as ProjectFile[]).forEach((f) => {
		if (f.kind === 'devis' && f.expense_id) {
			devisByExpense.set(f.expense_id, f);
		}
	});

	const [budgetInput, setBudgetInput] = useState(
		budgetValue != null ? String(budgetValue) : ''
	);
	const budgetMutation = useMutation({
		mutationFn: (value: number | null) =>
			updateProject(projectId, { budget: value }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
		onError: () => toast.error('Impossible de mettre à jour le budget'),
	});
	const saveBudget = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = budgetInput.trim();
		const value = trimmed === '' ? null : Number(trimmed);
		if (value != null && (Number.isNaN(value) || value < 0)) {
			toast.error('Budget invalide');
			return;
		}
		budgetMutation.mutate(value);
	};

	const today = new Date().toISOString().slice(0, 10);
	const [label, setLabel] = useState('');
	const [amount, setAmount] = useState('');
	const [spentAt, setSpentAt] = useState(today);
	const addRow = (e: React.FormEvent) => {
		e.preventDefault();
		const a = Number(amount);
		if (!label.trim() || Number.isNaN(a) || a <= 0) {
			toast.error('Libellé et montant (> 0) requis');
			return;
		}
		addExpense.mutate({ label: label.trim(), amount: a, spent_at: spentAt });
		setLabel('');
		setAmount('');
		setSpentAt(today);
	};

	if (isLoading) {
		return (
			<p className="py-4 text-sm text-muted-foreground">
				Chargement du budget…
			</p>
		);
	}
	if (error) {
		return (
			<p className="py-4 text-sm text-destructive">
				Impossible de charger le budget.
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<form
				onSubmit={saveBudget}
				className="flex flex-wrap items-end gap-4"
			>
				<div className="space-y-1">
					<Label htmlFor="budget">Budget prévu (€)</Label>
					<div className="flex items-center gap-2">
						<Input
							id="budget"
							type="number"
							min="0"
							step="0.01"
							value={budgetInput}
							onChange={(e) => setBudgetInput(e.target.value)}
							className="w-40"
							placeholder="—"
						/>
						<Button
							type="submit"
							variant="outline"
							size="sm"
							disabled={budgetMutation.isPending}
						>
							{budgetMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								'Enregistrer'
							)}
						</Button>
					</div>
				</div>
				<div className="pb-1 text-sm">
					<span className="text-muted-foreground">Dépensé : </span>
					<span className="font-medium">{formatEuro(spent)}</span>
					{remaining != null && (
						<>
							{' · '}
							<span className="text-muted-foreground">
								Reste :{' '}
							</span>
							<span
								className={
									remaining < 0
										? 'font-medium text-destructive'
										: 'font-medium text-green-600'
								}
							>
								{formatEuro(remaining)}
							</span>
						</>
					)}
				</div>
			</form>

			{expenses.length > 0 ? (
				<ul className="divide-y rounded-md border">
					{expenses.map((exp) => (
						<li
							key={exp.id}
							className="group flex items-center gap-2 px-3 py-2 text-sm sm:gap-3"
						>
							<span className="w-16 shrink-0 text-xs text-muted-foreground sm:w-24 sm:text-sm">
								{new Date(exp.spent_at).toLocaleDateString(
									'fr-FR'
								)}
							</span>
							<span className="min-w-0 flex-1 truncate">
								{exp.label}
							</span>
							<span className="shrink-0 whitespace-nowrap font-medium">
								{formatEuro(Number(exp.amount))}
							</span>
							<ExpenseDevis
								file={devisByExpense.get(exp.id)}
								onUpload={(f) =>
									uploadFile.mutate({
										kind: 'devis',
										file: f,
										expenseId: exp.id,
									})
								}
								onDelete={(f) => deleteFile.mutate(f)}
							/>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
								onClick={() => deleteExpense.mutate(exp.id)}
								aria-label={`Supprimer la dépense : ${exp.label}`}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</li>
					))}
				</ul>
			) : (
				<p className="text-sm text-muted-foreground">
					Aucune dépense. Ajoutez vos dépenses pour suivre le budget.
				</p>
			)}

			<form
					onSubmit={addRow}
					className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2"
				>
				<div className="space-y-1">
					<Label htmlFor="exp-date">Date</Label>
					<Input
						id="exp-date"
						type="date"
						value={spentAt}
						onChange={(e) => setSpentAt(e.target.value)}
						className="w-full sm:w-40"
					/>
				</div>
				<div className="min-w-[160px] flex-1 space-y-1">
					<Label htmlFor="exp-label">Libellé</Label>
					<Input
						id="exp-label"
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						placeholder="Ex : Acompte carreleur"
					/>
				</div>
				<div className="space-y-1">
					<Label htmlFor="exp-amount">Montant (€)</Label>
					<Input
						id="exp-amount"
						type="number"
						min="0"
						step="0.01"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="w-full sm:w-32"
						placeholder="0,00"
					/>
				</div>
				<Button
						type="submit"
						disabled={addExpense.isPending}
						className="w-full sm:w-auto"
					>
						{addExpense.isPending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Plus className="mr-2 h-4 w-4" />
						)}
						Ajouter
					</Button>
			</form>
		</div>
	);
}
