import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	useProjectFiles,
	useProjectFileMutations,
} from '@/hooks/useProjectFiles';
import type { ProjectFile } from '@/types/ProjectFile';
import { getProjectFileUrl } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';

/** Vignette d'une photo via URL signée (bucket privé). */
function SignedImage({ file }: { file: ProjectFile }) {
	const { data: url } = useQuery({
		queryKey: ['signed_url', file.path],
		queryFn: () => getProjectFileUrl(file.path),
		staleTime: 1000 * 60 * 50,
	});

	if (!url) {
		return <Skeleton className="aspect-square w-full rounded-md" />;
	}

	return (
		<a href={url} target="_blank" rel="noreferrer">
			<img
				src={url}
				alt={file.name}
				className="aspect-square w-full rounded-md object-cover"
			/>
		</a>
	);
}

export default function ProjectPhotos({ projectId }: { projectId: string }) {
	const { data, isLoading, error } = useProjectFiles(projectId);
	const { uploadFile, deleteFile } = useProjectFileMutations(projectId);
	const inputRef = useRef<HTMLInputElement>(null);

	const photos = ((data ?? []) as ProjectFile[]).filter(
		(f) => f.kind === 'photo'
	);

	const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		files.forEach((file) => uploadFile.mutate({ kind: 'photo', file }));
		e.target.value = '';
	};

	if (isLoading) {
		return (
			<p className="py-4 text-sm text-muted-foreground">
				Chargement des fichiers…
			</p>
		);
	}
	if (error) {
		return (
			<p className="py-4 text-sm text-destructive">
				Impossible de charger les fichiers.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Photos du projet (avant / après)
				</p>
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					multiple
					className="hidden"
					onChange={onPick}
				/>
				<Button
					size="sm"
					onClick={() => inputRef.current?.click()}
					disabled={uploadFile.isPending}
				>
					{uploadFile.isPending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<ImagePlus className="mr-2 h-4 w-4" />
					)}
					Ajouter des photos
				</Button>
			</div>

			{photos.length > 0 ? (
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{photos.map((file) => (
						<li key={file.id} className="group relative">
							<SignedImage file={file} />
							<Button
								variant="destructive"
								size="icon"
								className="absolute right-1 top-1 h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
								onClick={() => deleteFile.mutate(file)}
								aria-label={`Supprimer la photo : ${file.name}`}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</li>
					))}
				</ul>
			) : (
				<p className="py-2 text-sm text-muted-foreground">
					Aucune photo. Ajoutez des photos avant/après.
				</p>
			)}
		</div>
	);
}
