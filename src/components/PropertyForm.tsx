import type { Property } from '@/types/Property';
import { Form, redirect, type Params } from 'react-router';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Home, Save } from 'lucide-react';

type PropertyFormProps = {
	method: 'post' | 'patch';
	property?: Property;
};
export default function PropertyForm({ method, property }: PropertyFormProps) {
	const isNew = method === 'post';

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Home className="h-5 w-5 text-muted-foreground" />
					<CardTitle>
						{isNew ? 'Créer un nouveau bien' : 'Modifier le bien'}
					</CardTitle>
				</div>
				<CardDescription>
					{isNew
						? 'Remplissez les informations ci-dessous pour créer un nouveau bien immobilier.'
						: 'Modifiez les informations de votre bien immobilier.'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form method={method} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="name">Nom du bien</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="Ex: Maison principale, Appartement Paris, Villa..."
							required
							defaultValue={property?.name ?? ''}
							className="w-full"
						/>
						<p className="text-sm text-muted-foreground">
							Choisissez un nom clair et descriptif pour identifier
							votre bien.
						</p>
					</div>
					<div className="flex gap-3 pt-2">
						<Button type="submit" className="min-w-[140px]">
							<Save className="mr-2 h-4 w-4" />
							{isNew ? 'Créer le bien' : 'Mettre à jour'}
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
