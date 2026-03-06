import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: 'light',
  _hydrated: false,

  hydrate: () => {
    const theme = localStorage.getItem('theme') || 'light';
    set({ theme, _hydrated: true });
  },

  toggle: () => set((state) => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    return { theme: next };
  }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
}));

export default useThemeStore;
