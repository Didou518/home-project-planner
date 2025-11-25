import type { Property } from '@/types/Property';
import { Form, redirect, type Params } from 'react-router';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type PropertyFormProps = {
	method: 'post' | 'patch';
	property?: Property;
};
export default function PropertyForm({ method, property }: PropertyFormProps) {
	const isNew = method === 'post';

	return (
		<Form method={method} className="mt-6 space-y-4 max-w-md">
			<div className="space-y-2">
				<Label htmlFor="name">Nom du bien</Label>
				<Input
					id="name"
					name="name"
					type="text"
					placeholder="Ex: Maison principale"
					required
					defaultValue={property?.name ?? ''}
				/>
			</div>
			<Button type="submit">
				{isNew ? 'Créer le bien' : 'Mettre à jour'}
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

	const method = request.method;
	const isNew = method === 'POST';

	if (!name || name.trim() === '') {
		toast.error('Le nom du bien est requis');
		return null;
	}

	try {
		// Récupérer l'utilisateur actuel
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			toast.error(
				`Vous devez être connecté pour ${isNew ? 'créer' : 'modifier'} un bien`
			);
			return redirect('/signin');
		}

		if (isNew) {
			// Insérer la nouvelle propriété
			const { error } = await supabase
				.from('properties')
				.insert([{ name: name.trim(), owner_id: user.id }]);

			if (error) {
				throw error;
			}

			toast.success('Bien créé avec succès', {
				description: `Le bien "${name}" a été créé.`,
			});
		} else {
			const { id } = params;
			if (!id) {
				toast.error("Le bien n'a pas été trouvé");
				return redirect('/properties');
			}

			// Modifier la propriété
			const { error } = await supabase
				.from('properties')
				.update({ name: name.trim() })
				.eq('id', id);

			if (error) throw error;

			toast.success('Bien modifié avec succès', {
				description: `Le bien "${name}" a été modifié.`,
			});
		}

		return redirect('/');
	} catch (error) {
		let message = 'Une erreur est survenue lors de la création du bien';
		if (error instanceof Error) {
			message = error.message;
		}
		toast.error(message);
		return null;
	}
}
