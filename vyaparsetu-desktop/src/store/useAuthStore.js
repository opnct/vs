import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  staff: null,
  isAuthenticated: false,

  // Authenticate Staff after PIN verification
  loginStaff: (staffData) => set({
    staff: staffData,
    isAuthenticated: true
  }),

  // Lock the POS terminal
  logoutStaff: () => set({
    staff: null,
    isAuthenticated: false
  }),

  // --- ROLE-BASED ACCESS CONTROL (RBAC) ENGINE ---
  hasPermission: (requiredPermission) => {
    const staff = get().staff;
    
    // Fail-safe block if no user is active
    if (!staff) return false;
    
    // Master Admin / Owner override
    if (staff.role === 'OWNER' || staff.role === 'ADMIN') return true;
    
    // Parse the JSON array stored in the SQLite `users.permissions` column
    try {
      const permissionsList = typeof staff.permissions === 'string' 
        ? JSON.parse(staff.permissions) 
        : staff.permissions;
        
      if (!Array.isArray(permissionsList)) return false;

      // Check if they have the specific permission or global 'ALL' access
      return permissionsList.includes(requiredPermission) || permissionsList.includes('ALL');
    } catch (error) {
      console.error("RBAC Parse Error: Malformed permissions array in SQLite.");
      return false; // Safely deny access if data is corrupt
    }
  }
}));