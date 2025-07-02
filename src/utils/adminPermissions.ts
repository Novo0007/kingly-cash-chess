
import type { Tables } from "@/integrations/supabase/types";

type AdminUser = Tables<"admin_users">;

export interface AdminPermissions {
  payments?: boolean;
  withdrawals?: boolean;
  users?: boolean;
  games?: boolean;
  full_access?: boolean;
  invite_admins?: boolean;
}

export const checkAdminPermission = (
  adminUser: AdminUser,
  permission: keyof AdminPermissions
): boolean => {
  const permissions = adminUser.permissions as AdminPermissions | null;
  const isSuperAdmin = adminUser.role === 'super_admin';
  
  // Super admins have all permissions
  if (isSuperAdmin) return true;
  
  // Check specific permission or full_access
  return permissions?.[permission] || permissions?.full_access || false;
};

export const getPermissionLabel = (permission: keyof AdminPermissions): string => {
  const labels: Record<keyof AdminPermissions, string> = {
    payments: 'Payment Management',
    withdrawals: 'Withdrawal Management', 
    users: 'User Management',
    games: 'Game Management',
    full_access: 'Full Access',
    invite_admins: 'Invite Admins'
  };
  
  return labels[permission] || permission;
};

export const validateAdminAction = (
  adminUser: AdminUser,
  requiredPermission: keyof AdminPermissions,
  actionName: string
): boolean => {
  const hasPermission = checkAdminPermission(adminUser, requiredPermission);
  
  if (!hasPermission) {
    console.warn(`Admin ${adminUser.email} attempted ${actionName} without ${requiredPermission} permission`);
    return false;
  }
  
  return true;
};

export const getAvailablePermissions = (): (keyof AdminPermissions)[] => {
  return ['payments', 'withdrawals', 'users', 'games', 'full_access', 'invite_admins'];
};
