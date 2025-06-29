
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Loading admin panel...</p>
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
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Shield className="h-6 w-6 text-purple-400" />
            <span>Admin Control Panel</span>
            <Badge className="bg-purple-600 text-white">
              {adminUser.role.replace("_", " ").toUpperCase()}
            </Badge>
          </CardTitle>
          <p className="text-purple-300">
            Welcome back, Administrator. Manage your gaming platform from here.
          </p>
        </CardHeader>
      </Card>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-600">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            disabled={!hasPermission("users")}
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            disabled={!hasPermission("payments")}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="games"
            className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            disabled={!hasPermission("games")}
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Games
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-slate-600 data-[state=active]:text-white"
            disabled={!hasPermission("full_access")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
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
