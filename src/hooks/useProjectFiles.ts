import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getProjectFiles,
	uploadProjectFile,
	deleteProjectFile,
} from '@/integrations/supabase/client';
import type { ProjectFile, ProjectFileKind } from '@/types/ProjectFile';
import { toast } from 'sonner';

/** Lecture des fichiers (métadonnées) d'un projet. */
export const useProjectFiles = (projectId: string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['project_files', projectId],
		queryFn: () => getProjectFiles(projectId),
		enabled: !!projectId,
	});

	return { data, isLoading, error };
};

/** Mutations fichiers : upload (un par appel) + suppression optimiste. */
export const useProjectFileMutations = (projectId: string) => {
	const queryClient = useQueryClient();
	const key = ['project_files', projectId];

	const uploadFile = useMutation({
		mutationFn: (args: {
			kind: ProjectFileKind;
			file: File;
			expenseId?: string | null;
		}) => uploadProjectFile({ projectId, ...args }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
		onError: () => toast.error("Échec de l'envoi du fichier"),
	});

	const deleteFile = useMutation({
		mutationFn: (file: ProjectFile) => deleteProjectFile(file),
		onMutate: async (file) => {
			await queryClient.cancelQueries({ queryKey: key });
			const prev = queryClient.getQueryData<ProjectFile[]>(key);
			queryClient.setQueryData<ProjectFile[]>(key, (old) =>
				(old ?? []).filter((f) => f.id !== file.id)
			);
			return { prev };
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
			toast.error('Impossible de supprimer le fichier');
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
	});

	return { uploadFile, deleteFile };
};
