import type { Project } from '@/types/Project';
import { Form, redirect, type Params } from 'react-router';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { toast } from 'sonner';
import {
	createProject,
	queryClient,
	updateProject,
} from '@/integrations/supabase/client';
import { FolderKanban, Save } from 'lucide-react';

type ProjectFormProps = {
	method: 'post' | 'patch';
	project?: Project;
};

export default function ProjectForm({ method, project }: ProjectFormProps) {
	const isNew = method === 'post';

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<div className="flex items-center gap-2">
					<FolderKanban className="h-5 w-5 text-muted-foreground" />
					<CardTitle>
						{isNew
							? 'Créer un nouveau projet'
							: 'Modifier le projet'}
					</CardTitle>
				</div>
				<CardDescription>
					{isNew
						? "Remplissez les informations ci-dessous pour créer un nouveau projet de rénovation ou d'amélioration."
						: 'Modifiez les informations de votre projet.'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form method={method} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="name">Nom du projet</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="Ex: Rénovation cuisine, Isolation des combles, Aménagement jardin..."
							required
							defaultValue={project?.name ?? ''}
							className="w-full"
						/>
						<p className="text-sm text-muted-foreground">
							Choisissez un nom clair et descriptif pour
							identifier votre projet.
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="Décrivez les détails de votre projet, les objectifs, le budget prévu, les étapes principales..."
							rows={6}
							defaultValue={project?.description ?? ''}
							className="w-full"
						/>
						<p className="text-sm text-muted-foreground">
							Une description détaillée vous aidera à suivre
							l'avancement et les objectifs de votre projet.
						</p>
					</div>
					<div className="flex gap-3 pt-2">
						<Button type="submit" className="min-w-[140px]">
							<Save className="mr-2 h-4 w-4" />
							{isNew ? 'Créer le projet' : 'Mettre à jour'}
						</Button>
					</div>
				</Form>
			</CardContent>
		</Card>
	);
}

export async function action({
	request,
	params,
}: {
	request: Request;
	params: Params;
}) {
	const formData = await request.formData();
	const name = formData.get('name') as string;
	const description = formData.get('description') as string;

	const method = request.method;
	const isNew = method === 'POST';

	if (!name || name.trim() === '') {
		toast.error('Le nom du projet est requis');
		return null;
	}

	try {
		const propertyId = params.id;

		if (isNew) {
			// Pour la création, on a besoin de property_id depuis les params (id de la route parent)
			if (!propertyId) {
				toast.error('Property ID manquant');
				return redirect('/properties');
			}

			await createProject({
				property_id: propertyId,
				name: name.trim(),
				description: description?.trim() || null,
			});

			toast.success('Projet créé avec succès', {
				description: `Le projet "${name}" a été créé.`,
			});
		} else {
			const projectId = params.projectId;
			if (!projectId) {
				toast.error("Le projet n'a pas été trouvé");
				return redirect('/properties');
			}

			await updateProject(projectId, {
				name: name.trim(),
				description: description?.trim() || null,
			});

			toast.success('Projet modifié avec succès', {
				description: `Le projet "${name}" a été modifié.`,
			});
		}

		queryClient.invalidateQueries({ queryKey: ['events'] });

		return redirect(`/properties/${propertyId}`);
	} catch (error) {
		let message = `Une erreur est survenue lors de ${isNew ? 'la création' : 'la modification'} du projet`;
		if (error instanceof Error) {
			message = error.message;
		}
		toast.error(message);
		return null;
	}
}
