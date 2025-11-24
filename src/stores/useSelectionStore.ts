import { create } from 'zustand';
import type { Property } from '@/types/Property';
import type { Project } from '@/types/Project';

interface SelectionState {
	selectedProperty: Property | null;
	selectedProject: Project | null;
	setSelectedProperty: (property: Property | null) => void;
	setSelectedProject: (project: Project | null) => void;
	clearSelection: () => void;
	clearProject: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
	selectedProperty: null,
	selectedProject: null,
	setSelectedProperty: (property) => {
		set({ selectedProperty: property });
		// Si on change de property, on efface le projet sélectionné
		set({ selectedProject: null });
	},
	setSelectedProject: (project) => set({ selectedProject: project }),
	clearSelection: () =>
		set({ selectedProperty: null, selectedProject: null }),
	clearProject: () => set({ selectedProject: null }),
}));
