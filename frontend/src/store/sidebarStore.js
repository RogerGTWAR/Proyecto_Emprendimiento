import { create } from "zustand";

export const useSidebarStore = create((set) => ({
    isCollapsed: false,
    isSidebarOpen: false,
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    closeSidebar: () => set({ isSidebarOpen: false }),
    setSidebarOpen: (open) => set({ isSidebarOpen: open })
}));