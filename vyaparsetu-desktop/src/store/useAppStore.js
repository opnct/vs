
import { create } from 'zustand';
export const useAppStore = create((set) => ({
  activeTab: 'POS_Billing.txt',
  openTabs: ['POS_Billing.txt', 'Ledgers_Master.txt', 'Inventory.txt', 'Reports.txt', 'System_Config.txt'],
  openFile: (fileName) => set((state) => ({ 
    activeTab: fileName, 
    openTabs: state.openTabs.includes(fileName) ? state.openTabs : [...state.openTabs, fileName] 
  })),
  closeFile: (fileName) => set((state) => {
    const newTabs = state.openTabs.filter(t => t !== fileName);
    return { openTabs: newTabs, activeTab: state.activeTab === fileName ? (newTabs[0] || '') : state.activeTab };
  })
}));
