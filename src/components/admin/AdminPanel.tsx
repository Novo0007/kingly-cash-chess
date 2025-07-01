import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield,
  Users,
  CreditCard,
  Gamepad2,
  Settings,
  AlertTriangle,
  TrendingUp,
  Database,
} from "lucide-react";
import { UserManagement } from "./UserManagement";
import { PaymentManagement } from "./PaymentManagement";
import { GameManagement } from "./GameManagement";
import { AdminSettings } from "./AdminSettings";
import { SystemOverview } from "./SystemOverview";
import type { Tables } from "@/integrations/supabase/types";

type AdminUser = Tables<"admin_users">;

interface AdminPanelProps {
  userEmail: string;
}

export const AdminPanel = ({ userEmail }: AdminPanelProps) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAdminUser();
  }, [userEmail]);

  const fetchAdminUser = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", userEmail)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching admin user:", error);
        return;
      }

      setAdminUser(data);
    } catch (error) {
      console.error("Error fetching admin user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-amber-900 font-body">Loading admin lodge...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-600">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-red-300">
            You don't have admin privileges or your account is not active.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasPermission = (permission: string) => {
    return adminUser.permissions?.[permission] === true;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Admin Header - Mobile Friendly */}
      <Card className="wood-card wood-plank border-amber-700">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-amber-900 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 font-heading">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700" />
              <span className="text-base sm:text-lg">Admin Lodge</span>
            </div>
            <Badge className="bg-amber-700 text-amber-50 text-xs sm:text-sm">
              {adminUser.role.replace("_", " ").toUpperCase()}
            </Badge>
          </CardTitle>
          <p className="text-amber-800 text-sm sm:text-base">
            Welcome back, Administrator. Manage your gaming lodge from here.
          </p>
        </CardHeader>
      </Card>

      {/* Admin Tabs - Mobile Responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 bg-amber-100 border-amber-300 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50 text-xs sm:text-sm wood-button min-h-[48px] flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
          >
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden text-xs">Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-green-700 data-[state=active]:text-amber-50 text-xs sm:text-sm wood-button min-h-[48px] flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
            disabled={!hasPermission("users")}
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden text-xs">Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-yellow-700 data-[state=active]:text-amber-50 text-xs sm:text-sm wood-button min-h-[48px] flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
            disabled={!hasPermission("payments")}
          >
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Payments</span>
            <span className="sm:hidden text-xs">Pay</span>
          </TabsTrigger>
          <TabsTrigger
            value="games"
            className="data-[state=active]:bg-orange-700 data-[state=active]:text-amber-50 text-xs sm:text-sm wood-button min-h-[48px] flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
            disabled={!hasPermission("games")}
          >
            <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Games</span>
            <span className="sm:hidden text-xs">Games</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-amber-800 data-[state=active]:text-amber-50 text-xs sm:text-sm wood-button min-h-[48px] flex flex-col sm:flex-row items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1"
            disabled={!hasPermission("full_access")}
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden text-xs">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SystemOverview adminUser={adminUser} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement adminUser={adminUser} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentManagement adminUser={adminUser} />
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <GameManagement adminUser={adminUser} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminSettings adminUser={adminUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
