/**
 * Client Supabase et fonctions d'authentification
 */

import { createClient } from '@supabase/supabase-js';
import type { Property } from '@/types/Property';
import type { Project } from '@/types/Project';
import type { ProjectFileKind } from '@/types/ProjectFile';
import { compressImage } from '@/lib/imageCompression';
import { QueryClient } from '@tanstack/react-query';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	},
});

/**
 * Client Supabase configuré (session persistée dans localStorage)
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
	auth: {
		storage: localStorage,
		persistSession: true,
		autoRefreshToken: true,
	},
});

/**
 * Connecte un utilisateur avec email et mot de passe
 * @throws {AuthError} Si les identifiants sont incorrects
 */
export const signInWithPassword = async ({
	email,
	password,
}: {
	email: string;
	password: string;
}) => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw error;

	return data;
};

/**
 * Crée un nouveau compte utilisateur
 * @throws {AuthError} Si l'email existe déjà ou si le mot de passe est invalide
 */
export const signUpWithPassword = async ({
	email,
	password,
}: {
	email: string;
	password: string;
}) => {
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) throw error;

	return data;
};

/**
 * Déconnecte l'utilisateur actuel
 */
export const signOut = async () => {
	await supabase.auth.signOut();
};

/**
 * Récupère l'utilisateur connecté
 * @throws {Error} Si l'utilisateur n'est pas connecté ou si une erreur survient
 */
export const getUser = async () => {
	const { data, error } = await supabase.auth.getUser();
	if (error) throw error;
	return data.user;
};

/**
 * Récupère toutes les properties de l'utilisateur connecté
 * @throws {Error} Si l'utilisateur n'est pas connecté ou si une erreur survient
 */
export const getProperties = async () => {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error('User not found');
	}

	const { data, error } = await supabase
		.from('properties')
		.select('*')
		.eq('owner_id', user.id)
		.order('created_at', { ascending: false });

	if (error) throw error;

	return data || [];
};

/**
 * Récupère une property par son id (null si introuvable ou non accessible via RLS)
 * @throws {Error} Si une erreur survient
 */
export const getProperty = async (id: string) => {
	const { data, error } = await supabase
		.from('properties')
		.select('*')
		.eq('id', id)
		.maybeSingle();

	if (error) {
		// 22P02 = id mal formé (UUID invalide) → "introuvable", pas une erreur
		if (error.code === '22P02') return null;
		throw error;
	}

	return data;
};

/**
 * Crée une nouvelle property
 * @throws {Error} Si l'utilisateur n'est pas connecté ou si une erreur survient
 */
export const createProperty = async (
	property: Omit<Property, 'id' | 'created_at' | 'owner_id'>
) => {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error('User not found');
	}

	const { data, error } = await supabase
		.from('properties')
		.insert([{ ...property, owner_id: user.id }]);

	if (error) throw error;

	return data;
};

/**
 * Met à jour une property
 * @throws {Error} Si une erreur survient
 */
export const updateProperty = async (
	id: string,
	updates: Partial<Property>
) => {
	const { data, error } = await supabase
		.from('properties')
		.update(updates)
		.eq('id', id);

	if (error) throw error;

	return data;
};

/**
 * Supprime une property
 * @throws {Error} Si une erreur survient
 */
export const deleteProperty = async (id: string) => {
	const { error } = await supabase.from('properties').delete().eq('id', id);
	if (error) throw error;
};

/**
 * Récupère tous les projets d'une property
 * @throws {Error} Si une erreur survient
 */
export const getProjects = async (propertyId: string) => {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('property_id', propertyId)
		.order('created_at', { ascending: false });

	if (error) throw error;

	return data || [];
};

/**
 * Récupère un projet par son id (null si introuvable ou non accessible via RLS)
 * @throws {Error} Si une erreur survient
 */
export const getProject = async (id: string) => {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('id', id)
		.maybeSingle();

	if (error) {
		// 22P02 = id mal formé (UUID invalide) → "introuvable", pas une erreur
		if (error.code === '22P02') return null;
		throw error;
	}

	return data;
};

/**
 * Crée un nouveau projet
 * @throws {Error} Si une erreur survient
 */
export const createProject = async (
	project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'status' | 'budget'>
) => {
	const { data, error } = await supabase
		.from('projects')
		.insert([project])
		.select()
		.single();

	if (error) throw error;

	return data;
};

/**
 * Met à jour un projet
 * @throws {Error} Si une erreur survient
 */
export const updateProject = async (id: string, updates: Partial<Project>) => {
	const { data, error } = await supabase
		.from('projects')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;

	return data;
};

/**
 * Supprime un projet
 * @throws {Error} Si une erreur survient
 */
export const deleteProject = async (id: string) => {
	const { error } = await supabase.from('projects').delete().eq('id', id);

	if (error) throw error;
};

/**
 * Récupère les tâches d'un projet (triées par position puis date)
 * @throws {Error} Si une erreur survient
 */
export const getProjectTasks = async (projectId: string) => {
	const { data, error } = await supabase
		.from('project_tasks')
		.select('*')
		.eq('project_id', projectId)
		.order('position', { ascending: true })
		.order('created_at', { ascending: true });

	if (error) throw error;

	return data || [];
};

/**
 * Crée une tâche dans un projet
 * @throws {Error} Si une erreur survient
 */
export const createProjectTask = async (
	projectId: string,
	label: string,
	position = 0
) => {
	const { data, error } = await supabase
		.from('project_tasks')
		.insert([{ project_id: projectId, label, position }])
		.select()
		.single();

	if (error) throw error;

	return data;
};

/**
 * Coche / décoche une tâche
 * @throws {Error} Si une erreur survient
 */
export const setProjectTaskDone = async (id: string, isDone: boolean) => {
	const { data, error } = await supabase
		.from('project_tasks')
		.update({ is_done: isDone })
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;

	return data;
};

/**
 * Supprime une tâche
 * @throws {Error} Si une erreur survient
 */
export const deleteProjectTask = async (id: string) => {
	const { error } = await supabase
		.from('project_tasks')
		.delete()
		.eq('id', id);

	if (error) throw error;
};

/**
 * Récupère les dépenses d'un projet (plus récentes d'abord)
 * @throws {Error} Si une erreur survient
 */
export const getProjectExpenses = async (projectId: string) => {
	const { data, error } = await supabase
		.from('project_expenses')
		.select('*')
		.eq('project_id', projectId)
		.order('spent_at', { ascending: false })
		.order('created_at', { ascending: false });

	if (error) throw error;

	return data || [];
};

/**
 * Crée une dépense dans un projet
 * @throws {Error} Si une erreur survient
 */
export const createProjectExpense = async (
	projectId: string,
	expense: { label: string; amount: number; spent_at?: string }
) => {
	const { data, error } = await supabase
		.from('project_expenses')
		.insert([{ project_id: projectId, ...expense }])
		.select()
		.single();

	if (error) throw error;

	return data;
};

/**
 * Supprime une dépense
 * @throws {Error} Si une erreur survient
 */
export const deleteProjectExpense = async (id: string) => {
	const { error } = await supabase
		.from('project_expenses')
		.delete()
		.eq('id', id);

	if (error) throw error;
};

/**
 * Fichiers de projet (photos / devis) — octets dans Storage, métadonnées en table.
 */
const FILES_BUCKET = 'project-files';

const slugifyFileName = (name: string) =>
	name.replace(/[^a-zA-Z0-9._-]/g, '_');

/**
 * Récupère les fichiers d'un projet (métadonnées, plus récents d'abord)
 * @throws {Error} Si une erreur survient
 */
export const getProjectFiles = async (projectId: string) => {
	const { data, error } = await supabase
		.from('project_files')
		.select('*')
		.eq('project_id', projectId)
		.order('created_at', { ascending: false });

	if (error) throw error;

	return data || [];
};

/**
 * Upload un fichier (compresse les images) puis enregistre ses métadonnées.
 * Rollback de l'objet Storage si l'insertion des métadonnées échoue.
 * @throws {Error} Si une erreur survient
 */
export const uploadProjectFile = async ({
	projectId,
	expenseId,
	kind,
	file,
}: {
	projectId: string;
	expenseId?: string | null;
	kind: ProjectFileKind;
	file: File;
}) => {
	const isImage = file.type.startsWith('image/');
	const body = isImage ? await compressImage(file) : file;

	const folder =
		kind === 'devis' && expenseId
			? `${projectId}/expenses/${expenseId}`
			: `${projectId}/photos`;
	const path = `${folder}/${crypto.randomUUID()}-${slugifyFileName(file.name)}`;

	const { error: uploadError } = await supabase.storage
		.from(FILES_BUCKET)
		.upload(path, body, {
			contentType: isImage ? 'image/jpeg' : file.type || undefined,
			upsert: false,
		});

	if (uploadError) throw uploadError;

	const { data, error } = await supabase
		.from('project_files')
		.insert([
			{
				project_id: projectId,
				expense_id: expenseId ?? null,
				kind,
				path,
				name: file.name,
			},
		])
		.select()
		.single();

	if (error) {
		await supabase.storage.from(FILES_BUCKET).remove([path]);
		throw error;
	}

	return data;
};

/**
 * URL signée temporaire (1h) pour afficher/télécharger un fichier privé
 * @throws {Error} Si une erreur survient
 */
export const getProjectFileUrl = async (path: string) => {
	const { data, error } = await supabase.storage
		.from(FILES_BUCKET)
		.createSignedUrl(path, 3600);

	if (error) throw error;

	return data.signedUrl;
};

/**
 * Supprime un fichier (objet Storage + métadonnées)
 * @throws {Error} Si une erreur survient
 */
export const deleteProjectFile = async (file: { id: string; path: string }) => {
	const { error: removeError } = await supabase.storage
		.from(FILES_BUCKET)
		.remove([file.path]);

	if (removeError) throw removeError;

	const { error } = await supabase
		.from('project_files')
		.delete()
		.eq('id', file.id);

	if (error) throw error;
};
