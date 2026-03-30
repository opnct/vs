
import { create } from 'zustand';
export const useAppStore = create((set) => ({
  activeTab: 'POSBilling.txt',
  openTabs: ['POSBilling.txt', 'Vouchers.txt', 'Ledgers.txt', 'Inventory.txt', 'Reports.txt', 'Config.txt'],
  zoomLevel: 100,
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  openFile: (fileName) => set((state) => ({ 
    activeTab: fileName, 
    openTabs: state.openTabs.includes(fileName) ? state.openTabs : [...state.openTabs, fileName] 
  })),
  closeFile: (fileName) => set((state) => {
    const newTabs = state.openTabs.filter(t => t !== fileName);
    return { openTabs: newTabs, activeTab: state.activeTab === fileName ? (newTabs[0] || '') : state.activeTab };
  })
}));
