export type ProjectStatus = 'todo' | 'in_progress' | 'done';

export type Project = {
	id: string;
	property_id: string;
	name: string;
	description: string | null;
	status: ProjectStatus;
	budget: number | null;
	priority: number | null;
	created_at: string;
	updated_at: string;
};

