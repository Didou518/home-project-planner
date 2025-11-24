import { signOut } from '@/integrations/supabase/client';
import { redirect } from 'react-router';

export function action() {
	console.log('logout');
	localStorage.removeItem('session');
	signOut();
	return redirect('/signin');
}
