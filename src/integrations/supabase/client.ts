/**
 * Client Supabase et fonctions d'authentification
 */

import { createClient } from '@supabase/supabase-js';
import type { Property } from '@/types/Property';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
 * Crée une nouvelle property
 * @throws {Error} Si l'utilisateur n'est pas connecté ou si une erreur survient
 */
export const createProperty = async (
	property: Omit<Property, 'id' | 'created_at'>
) => {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error('User not found');
	}

	const { data, error } = await supabase
		.from('properties')
		.insert([{ ...property, owner_id: user.id }])
		.select()
		.single();

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
		.eq('id', id)
		.select()
		.single();

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
