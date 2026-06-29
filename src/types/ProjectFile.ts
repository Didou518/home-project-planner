export type ProjectFileKind = 'photo' | 'devis';

export type ProjectFile = {
	id: string;
	project_id: string;
	expense_id: string | null;
	kind: ProjectFileKind;
	path: string;
	name: string;
	created_at: string;
};
