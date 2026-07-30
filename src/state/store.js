import { create } from "zustand";

// Estado global mínimo (documento 05, sección 9): idioma activo,
// estado de reposo y la pila de navegación de hasta 3 niveles.
export const useStore = create((set) => ({
  language: "es",
  setLanguage: (language) => set({ language }),

  isIdle: true,
  setIdle: (isIdle) => set({ isIdle }),

  navStack: [],
  enter: (id) =>
    set((state) => ({
      navStack:
        state.navStack.length < 3
          ? [...state.navStack, { level: state.navStack.length + 1, id }]
          : state.navStack,
      isIdle: false,
    })),
  back: () =>
    set((state) => ({ navStack: state.navStack.slice(0, -1) })),
  home: () => set({ navStack: [] }),
  exit: () => set({ navStack: [], isIdle: true }),
}));
