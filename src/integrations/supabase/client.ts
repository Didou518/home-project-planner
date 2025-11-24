import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
	auth: {
		storage: localStorage,
		persistSession: true,
		autoRefreshToken: true,
	},
});

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

export const signOut = async () => {
	await supabase.auth.signOut();
};
