import { create } from 'zustand';

const useAuthStore = create((set) => ({
  admin: null,
  token: null,
  _hydrated: false,

  hydrate: () => {
    const admin = JSON.parse(localStorage.getItem('admin') || 'null');
    const token = localStorage.getItem('token');
    set({ admin, token, _hydrated: true });
  },

  login: (admin, token) => {
    localStorage.setItem('admin', JSON.stringify(admin));
    localStorage.setItem('token', token);
    set({ admin, token });
  },

  logout: () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('token');
    set({ admin: null, token: null });
  },
}));

export default useAuthStore;
