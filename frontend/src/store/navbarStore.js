import { create } from "zustand";

export const useNavbarStore = create((set) => ({
    isMenuOpen: false,
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    closeMenu: () => set({ isMenuOpen: false }),
    setMenuOpen: (open) => set({ isMenuOpen: open })
}));