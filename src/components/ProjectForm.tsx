import type { Project } from '@/types/Project';
import { Form, redirect, type Params } from 'react-router';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { createProject, updateProject } from '@/integrations/supabase/client';

type ProjectFormProps = {
	method: 'post' | 'patch';
	project?: Project;
};

export default function ProjectForm({ method, project }: ProjectFormProps) {
	const isNew = method === 'post';

	return (
		<Form method={method} className="mt-6 space-y-4 max-w-md">
			<div className="space-y-2">
				<Label htmlFor="name">Nom du projet</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="Ex: Rénovation cuisine"
					required
					defaultValue={project?.name ?? ''}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					name="description"
					placeholder="Description du projet..."
					rows={4}
					defaultValue={project?.description ?? ''}
				/>
			</div>
			<Button type="submit">
				{isNew ? 'Créer le projet' : 'Mettre à jour'}
			</Button>
		</Form>
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
		if (isNew) {
			// Pour la création, on a besoin de property_id depuis les params (id de la route parent)
			const propertyId = params.id;
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

			return redirect(`/properties/${propertyId}`);
		} else {
			const projectId = params.projectId;
			if (!projectId) {
				toast.error("Le projet n'a pas été trouvé");
				return redirect('/properties');
			}

			const updatedProject = await updateProject(projectId, {
				name: name.trim(),
				description: description?.trim() || null,
			});

			toast.success('Projet modifié avec succès', {
				description: `Le projet "${name}" a été modifié.`,
			});

			return redirect(`/properties/${updatedProject.property_id}`);
		}
	} catch (error) {
		let message = `Une erreur est survenue lors de ${isNew ? 'la création' : 'la modification'} du projet`;
		if (error instanceof Error) {
			message = error.message;
		}
		toast.error(message);
		return null;
	}
}
