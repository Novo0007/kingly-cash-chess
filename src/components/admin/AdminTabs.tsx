
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminInvitations } from "./AdminInvitations";
import { AdminSettings } from "./AdminSettings";
import { SystemOverview } from "./SystemOverview";
import { UserManagement } from "./UserManagement";
import { GameManagement } from "./GameManagement";
import { TournamentManagement } from "./TournamentManagement";
import { PaymentManagement } from "./PaymentManagement";
import type { Tables } from "@/integrations/supabase/types";

type AdminUser = Tables<"admin_users">;

interface AdminPermissions {
  payments?: boolean;
  withdrawals?: boolean;
  users?: boolean;
  games?: boolean;
  full_access?: boolean;
  invite_admins?: boolean;
}

interface AdminTabsProps {
  adminUser: AdminUser;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminTabs = ({ adminUser, activeTab, onTabChange }: AdminTabsProps) => {
  const permissions = adminUser.permissions as AdminPermissions | null;
  const isSuperAdmin = adminUser.role === 'super_admin';
  
  // Permission checks
  const canInviteAdmins = permissions?.invite_admins || isSuperAdmin;
  const canManageUsers = permissions?.users || permissions?.full_access || isSuperAdmin;
  const canManageGames = permissions?.games || permissions?.full_access || isSuperAdmin;
  const canManagePayments = permissions?.payments || permissions?.full_access || isSuperAdmin;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-7 bg-amber-100/50 border border-amber-200/50">
        <TabsTrigger 
          value="overview" 
          className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
        >
          Overview
        </TabsTrigger>
        
        {canManageUsers && (
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
          >
            Users
          </TabsTrigger>
        )}
        
        {canManageGames && (
          <TabsTrigger 
            value="games" 
            className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
          >
            Games
          </TabsTrigger>
        )}
        
        {canManageGames && (
          <TabsTrigger 
            value="tournaments" 
            className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
          >
            Tournaments
          </TabsTrigger>
        )}
        
        {canManagePayments && (
          <TabsTrigger 
            value="payments" 
            className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
          >
            Payments
          </TabsTrigger>
        )}
        
        {canInviteAdmins && (
          <TabsTrigger 
            value="admins" 
            className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
          >
            Admins
          </TabsTrigger>
        )}
        
        <TabsTrigger 
          value="settings" 
          className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
        >
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <SystemOverview adminUser={adminUser} />
      </TabsContent>
      
      {canManageUsers && (
        <TabsContent value="users">
          <UserManagement adminUser={adminUser} />
        </TabsContent>
      )}
      
      {canManageGames && (
        <TabsContent value="games">
          <GameManagement adminUser={adminUser} />
        </TabsContent>
      )}
      
      {canManageGames && (
        <TabsContent value="tournaments">
          <TournamentManagement />
        </TabsContent>
      )}
      
      {canManagePayments && (
        <TabsContent value="payments">
          <PaymentManagement adminUser={adminUser} />
        </TabsContent>
      )}

      {canInviteAdmins && (
        <TabsContent value="admins">
          <AdminInvitations currentAdminUser={adminUser} />
        </TabsContent>
      )}

      <TabsContent value="settings">
        <AdminSettings adminUser={adminUser} />
      </TabsContent>
    </Tabs>
  );
};
