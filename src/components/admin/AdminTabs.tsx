
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  CreditCard,
  Gamepad2,
  Settings,
  TrendingUp,
} from "lucide-react";
import { UserManagement } from "./UserManagement";
import { PaymentManagement } from "./PaymentManagement";
import { GameManagement } from "./GameManagement";
import { AdminSettings } from "./AdminSettings";
import { SystemOverview } from "./SystemOverview";
import type { Tables } from "@/integrations/supabase/types";

type AdminUser = Tables<"admin_users">;

interface AdminTabsProps {
  adminUser: AdminUser;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminTabs = ({ adminUser, activeTab, onTabChange }: AdminTabsProps) => {
  const hasPermission = (permission: string) => {
    return adminUser.permissions?.[permission] === true;
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full bg-transparent"
    >
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-600 p-2 rounded-xl wood-shadow">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-lg bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all duration-200 min-h-[52px] rounded-lg border-2 border-amber-600 font-semibold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
        >
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Overview</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger
          value="users"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-700 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all duration-200 min-h-[52px] rounded-lg border-2 border-amber-600 font-semibold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!hasPermission("users")}
        >
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Users</span>
          <span className="sm:hidden">Users</span>
        </TabsTrigger>
        <TabsTrigger
          value="payments"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-700 data-[state=active]:to-amber-700 data-[state=active]:text-white data-[state=active]:shadow-lg bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all duration-200 min-h-[52px] rounded-lg border-2 border-amber-600 font-semibold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!hasPermission("payments")}
        >
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Payments</span>
          <span className="sm:hidden">Pay</span>
        </TabsTrigger>
        <TabsTrigger
          value="games"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-700 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all duration-200 min-h-[52px] rounded-lg border-2 border-amber-600 font-semibold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!hasPermission("games")}
        >
          <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Games</span>
          <span className="sm:hidden">Games</span>
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-800 data-[state=active]:to-yellow-800 data-[state=active]:text-white data-[state=active]:shadow-lg bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all duration-200 min-h-[52px] rounded-lg border-2 border-amber-600 font-semibold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed col-span-2 sm:col-span-1"
          disabled={!hasPermission("full_access")}
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Settings</span>
          <span className="sm:hidden">Settings</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="overview"
        className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 w-full"
      >
        <div className="min-h-[300px] w-full">
          <SystemOverview adminUser={adminUser} />
        </div>
      </TabsContent>

      <TabsContent
        value="users"
        className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 w-full"
      >
        <div className="min-h-[300px] w-full">
          <UserManagement adminUser={adminUser} />
        </div>
      </TabsContent>

      <TabsContent
        value="payments"
        className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 w-full"
      >
        <div className="min-h-[300px] w-full bg-amber-50/30 rounded-lg p-2">
          <PaymentManagement adminUser={adminUser} />
        </div>
      </TabsContent>

      <TabsContent
        value="games"
        className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 w-full"
      >
        <div className="min-h-[300px] w-full">
          <GameManagement adminUser={adminUser} />
        </div>
      </TabsContent>

      <TabsContent
        value="settings"
        className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 w-full"
      >
        <div className="min-h-[300px] w-full">
          <AdminSettings adminUser={adminUser} />
        </div>
      </TabsContent>
    </Tabs>
  );
};
