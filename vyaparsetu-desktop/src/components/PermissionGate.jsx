import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

/**
 * PermissionGate
 * Wraps around UI components to conditionally render them based on the current staff's RBAC permissions.
 * @param {string} permission - The exact permission string required (e.g., 'EDIT_INVOICE', 'VIEW_PROFIT')
 * @param {string} type - 'block' (shows a warning box) or 'inline' (hides silently)
 */
export default function PermissionGate({ permission, children, fallback, type = 'block' }) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isAllowed = hasPermission(permission);

  // If the staff member has the permission (or is OWNER/ADMIN), render normally
  if (isAllowed) {
    return <>{children}</>;
  }

  // If a custom fallback is provided, render that instead
  if (fallback) {
    return <>{fallback}</>;
  }

  // If type is inline (like a button inside a row), fail silently
  if (type === 'inline') {
    return null;
  }

  // Default block-level "Access Denied" UI for entire sections/pages
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-brand-dark/50 rounded-3xl border border-white/5 border-dashed text-center w-full animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-mac-red/10 flex items-center justify-center border border-mac-red/20 mb-4">
        <ShieldAlert size={32} className="text-mac-red" />
      </div>
      <h3 className="text-white font-bold text-xl tracking-tight mb-2">Access Restricted</h3>
      <p className="text-[#888888] text-sm max-w-sm leading-relaxed">
        Your current staff role does not have the required clearance (<span className="text-white font-mono">{permission}</span>) to view or modify this module.
      </p>
    </div>
  );
}