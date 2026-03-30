
import { create } from 'zustand';
export const useAppStore = create((set) => ({
  companyName: "Default Kirana Store",
  fyStart: "2025-04-01",
  currency: "INR",
  setCompanyData: (data) => set({ ...data }),
}));
