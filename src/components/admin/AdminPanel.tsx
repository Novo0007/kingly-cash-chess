
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AdminHeader } from "./AdminHeader";
import { AdminTabs } from "./AdminTabs";
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
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
      <Card className="wood-card bg-gradient-to-br from-red-100 to-red-50 border-red-600 m-2 sm:m-4">
        <CardContent className="p-4 sm:p-6 text-center">
          <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-700 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-2 font-heading">
            Access Denied
          </h3>
          <p className="text-red-800 text-sm sm:text-base">
            You don't have admin privileges or your account is not active.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <AdminHeader adminUser={adminUser} />
      <AdminTabs 
        adminUser={adminUser} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
};
