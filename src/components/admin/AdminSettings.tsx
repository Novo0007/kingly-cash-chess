
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Settings,
  UserPlus,
  Shield,
  Database,
  Key,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

interface AdminSettingsProps {
  adminUser: Tables<"admin_users">;
}

export const AdminSettings = ({ adminUser }: AdminSettingsProps) => {
  const [adminUsers, setAdminUsers] = useState<Tables<"admin_users">[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.error("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  const inviteAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const { error } = await supabase
        .from("admin_users")
        .insert({
          email: newAdminEmail.trim(),
          role: "admin",
          invited_by: adminUser.user_id,
          permissions: {
            payments: true,
            withdrawals: true,
            users: true,
            games: true,
            full_access: false,
          },
        });

      if (error) throw error;
      
      toast.success("Admin user invited successfully");
      setNewAdminEmail("");
      fetchAdminUsers();
    } catch (error) {
      console.error("Error inviting admin:", error);
      toast.error("Failed to invite admin user");
    }
  };

  const toggleAdminStatus = async (adminId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: !isActive })
        .eq("id", adminId);

      if (error) throw error;
      
      toast.success(`Admin ${!isActive ? "activated" : "deactivated"} successfully`);
      fetchAdminUsers();
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update admin status");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-600 text-white";
      case "admin":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-600">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-3 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading admin settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Users Management */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-400" />
            Admin Users Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Invite New Admin */}
            {adminUser.permissions?.invite_admins && (
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-white">Invite New Admin</Label>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white mt-1"
                      />
                    </div>
                    <Button
                      onClick={inviteAdmin}
                      className="bg-blue-600 hover:bg-blue-700 mt-6"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Users List */}
            <div className="space-y-3">
              {adminUsers.map((admin) => (
                <Card key={admin.id} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {admin.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {admin.email}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(admin.role)}>
                              {admin.role.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge className={admin.is_active ? "bg-green-600" : "bg-red-600"}>
                              {admin.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">
                            Invited: {new Date(admin.invited_at || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {adminUser.role === "super_admin" && admin.id !== adminUser.id && (
                          <Button
                            size="sm"
                            onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                            className={
                              admin.is_active 
                                ? "bg-red-600 hover:bg-red-700" 
                                : "bg-green-600 hover:bg-green-700"
                            }
                          >
                            {admin.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-400" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-600">
              <div>
                <h4 className="text-white font-medium">Database Status</h4>
                <p className="text-slate-400 text-sm">Monitor database connection</p>
              </div>
              <Badge className="bg-green-600 text-white">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-600">
              <div>
                <h4 className="text-white font-medium">Real-time Updates</h4>
                <p className="text-slate-400 text-sm">Live game and payment updates</p>
              </div>
              <Badge className="bg-green-600 text-white">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-white font-medium">Admin Session</h4>
                <p className="text-slate-400 text-sm">Your current admin session</p>
              </div>
              <Badge className="bg-purple-600 text-white">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Warning */}
      <Card className="bg-gradient-to-br from-amber-900 to-orange-900 border-amber-600">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <div>
              <h4 className="text-white font-semibold">Security Notice</h4>
              <p className="text-amber-200 text-sm">
                Admin privileges grant access to sensitive user data and financial information. 
                Use responsibly and maintain confidentiality.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
