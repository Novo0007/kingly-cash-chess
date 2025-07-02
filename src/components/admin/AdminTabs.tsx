import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminInvitations } from "./AdminInvitations";
import type { Tables } from "@/integrations/supabase/types";

type AdminUser = Tables<"admin_users">;

interface AdminTabsProps {
  adminUser: AdminUser;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminTabs = ({ adminUser, activeTab, onTabChange }: AdminTabsProps) => {
  const canInviteAdmins = adminUser.permissions?.invite_admins || 
    adminUser.role === 'super_admin';

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-6 bg-amber-100/50 border border-amber-200/50">
        <TabsTrigger 
          value="overview" 
          className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="users" 
          className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
        >
          Users
        </TabsTrigger>
        <TabsTrigger 
          value="games" 
          className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
        >
          Games
        </TabsTrigger>
        <TabsTrigger 
          value="payments" 
          className="data-[state=active]:bg-amber-200/80 data-[state=active]:text-amber-900"
        >
          Payments
        </TabsTrigger>
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
        <p>Overview content</p>
      </TabsContent>
      <TabsContent value="users">
        <p>Users content</p>
      </TabsContent>
      <TabsContent value="games">
        <p>Games content</p>
      </TabsContent>
      <TabsContent value="payments">
        <p>Payments content</p>
      </TabsContent>

      {canInviteAdmins && (
        <TabsContent value="admins">
          <AdminInvitations currentAdminUser={adminUser} />
        </TabsContent>
      )}

      <TabsContent value="settings">
        <p>Settings content</p>
      </TabsContent>
    </Tabs>
  );
};
