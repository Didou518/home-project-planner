import { create } from 'zustand';
import type { Property } from '@/types/Property';
import {
	getProperties,
	createProperty,
	updateProperty as updatePropertyInDb,
	deleteProperty as deletePropertyInDb,
} from '@/integrations/supabase/client';

interface PropertyState {
	properties: Property[];
	isLoading: boolean;
	error: string | null;
	fetchProperties: () => Promise<void>;
	addProperty: (
		property: Omit<Property, 'id' | 'created_at'>
	) => Promise<void>;
	updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
	deleteProperty: (id: string) => Promise<void>;
	setProperties: (properties: Property[]) => void;
	setIsLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	reset: () => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
	properties: [],
	isLoading: false,
	error: null,

	fetchProperties: async () => {
		set({ isLoading: true, error: null });
		try {
			const data = await getProperties();
			set({ properties: data, isLoading: false });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to fetch properties';
			set({ error: message, isLoading: false });
			throw error;
		}
	},

	addProperty: async (property) => {
		set({ isLoading: true, error: null });
		try {
			const data = await createProperty(property);
			set((state) => ({
				properties: [data, ...state.properties],
				isLoading: false,
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to add property';
			set({ error: message, isLoading: false });
			throw error;
		}
	},

	updateProperty: async (id, updates) => {
		set({ isLoading: true, error: null });
		try {
			const data = await updatePropertyInDb(id, updates);
			set((state) => ({
				properties: state.properties.map((p) =>
					p.id === id ? data : p
				),
				isLoading: false,
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to update property';
			set({ error: message, isLoading: false });
			throw error;
		}
	},

	deleteProperty: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await deletePropertyInDb(id);
			set((state) => ({
				properties: state.properties.filter((p) => p.id !== id),
				isLoading: false,
			}));
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to delete property';
			set({ error: message, isLoading: false });
			throw error;
		}
	},

	setProperties: (properties) => set({ properties }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	reset: () => set({ properties: [], isLoading: false, error: null }),
}));
