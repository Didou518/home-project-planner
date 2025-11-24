import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import Home from './pages/Home.tsx';
import RootLayout from './pages/Root.tsx';
import { action as logoutAction } from './pages/Logout.tsx';
import { AuthProvider } from './components/AuthProvider.tsx';
import Auth, { action as authAction } from './pages/Auth.tsx';
import { Toaster } from './components/ui/sonner.tsx';

const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <Home />,
			},
		],
	},
	{
		path: '/signin',
		element: <Auth />,
		action: authAction,
	},
	{
		path: '/signup',
		element: <Auth />,
		action: authAction,
	},
	{
		path: 'logout',
		element: <RootLayout />,
		action: logoutAction,
	},
]);

export default function App() {
	return (
		<AuthProvider>
			<RouterProvider router={router} />
			<Toaster />
		</AuthProvider>
	);
}
