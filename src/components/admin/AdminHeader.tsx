
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, User } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { AdminPermissions, checkAdminPermission } from "@/utils/adminPermissions";

type AdminUser = Tables<"admin_users">;

interface AdminHeaderProps {
  adminUser: AdminUser;
}

export const AdminHeader = ({ adminUser }: AdminHeaderProps) => {
  const permissions = adminUser.permissions as AdminPermissions | null;
  const isSuperAdmin = adminUser.role === 'super_admin';
  
  const activePermissions = permissions ? Object.entries(permissions)
    .filter(([_, value]) => value === true)
    .map(([key]) => key) : [];

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              {isSuperAdmin ? (
                <Crown className="h-6 w-6 text-amber-600" />
              ) : (
                <Shield className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Admin Panel
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{adminUser.email}</span>
                <Badge variant={isSuperAdmin ? "destructive" : "default"}>
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block">
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Active Permissions</p>
              <div className="flex flex-wrap gap-1 justify-end">
                {isSuperAdmin ? (
                  <Badge variant="destructive" className="text-xs">
                    All Permissions
                  </Badge>
                ) : activePermissions.length > 0 ? (
                  activePermissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Limited Access
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {!adminUser.is_active && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ Your admin account is currently deactivated. Some features may be limited.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
