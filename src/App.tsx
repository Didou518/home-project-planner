import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import HomePage from './pages/Home.tsx';
import RootLayout, { loader as rootLoader } from './pages/Root.tsx';
import { action as logoutAction } from './pages/Logout.tsx';
import { AuthProvider } from './components/AuthProvider.tsx';
import Auth, { action as authAction } from './pages/Auth.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import NewPropertyPage from './pages/properties/NewProperty.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import EditPropertyPage from './pages/properties/EditProperty.tsx';
import PropertiesPage from './pages/properties/Properties.tsx';
import { action as manipulatePropertyAction } from './components/PropertyForm.tsx';
import NewProjectPage from './pages/projects/NewProject.tsx';
import ProjectsPage from './pages/projects/Projects.tsx';
import EditProjectPage from './pages/projects/EditProject.tsx';
import { action as manipulateProjectAction } from './components/ProjectForm.tsx';
import PropertyPage from './pages/properties/Property.tsx';
import ProjectPage from './pages/projects/Project.tsx';

function HydrateFallback() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
				<p className="mt-4 text-gray-600">Chargement...</p>
			</div>
		</div>
	);
}

const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		errorElement: <ErrorPage />,
		hydrateFallbackElement: <HydrateFallback />,
		id: 'root',
		loader: rootLoader,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: 'properties',
				children: [
					{
						index: true,
						element: <PropertiesPage />,
					},
					{
						path: ':id',
						children: [
							{
								index: true,
								element: <PropertyPage />,
								action: manipulatePropertyAction,
							},
							{
								path: 'edit',
								element: <EditPropertyPage />,
								action: manipulatePropertyAction,
							},
							{
								path: 'projects',
								children: [
									{
										index: true,
										element: <ProjectsPage />,
									},
									{
										path: 'new',
										element: <NewProjectPage />,
										action: manipulateProjectAction,
									},
									{
										path: ':projectId',
										element: <ProjectPage />,
										children: [
											{
												path: 'edit',
												element: <EditProjectPage />,
												action: manipulateProjectAction,
											},
										],
									},
								],
							},
						],
					},
					{
						path: 'new',
						element: <NewPropertyPage />,
						action: manipulatePropertyAction,
					},
				],
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
