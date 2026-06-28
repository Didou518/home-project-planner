import { signOut } from '@/integrations/supabase/client';
import { redirect } from 'react-router';

export async function action() {
	await signOut();
	return redirect('/signin');
}
