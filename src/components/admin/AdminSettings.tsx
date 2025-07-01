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
  AlertTriangle,
  Crown,
  Users,
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
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

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
      const { error } = await supabase.from("admin_users").insert({
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
      setInviteDialogOpen(false);
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

      toast.success(
        `Admin ${!isActive ? "activated" : "deactivated"} successfully`,
      );
      fetchAdminUsers();
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update admin status");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const hasInvitePermission = () => {
    if (!adminUser.permissions || typeof adminUser.permissions !== "object") {
      return false;
    }
    const permissions = adminUser.permissions as Record<string, any>;
    return permissions.full_access === true || adminUser.role === "super_admin";
  };

  if (loading) {
    return (
      <Card className="bg-card border border-border rounded-2xl">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Loading settings...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Admin Info */}
      <Card className="bg-card border border-border rounded-2xl">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Your Admin Profile
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Current administrative privileges
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {adminUser.email}
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="font-medium">Role:</span>
                  <Badge className={getRoleColor(adminUser.role)}>
                    {adminUser.role.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                    Active
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Since:</span>{" "}
                  {new Date(adminUser.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Management */}
      <Card className="wood-card border-amber-700">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-amber-900 flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-800" />
              Admin Users ({adminUsers.length})
            </div>
            {hasInvitePermission() && (
              <Dialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-amber-700 hover:bg-amber-800 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent className="wood-card border-2 border-amber-600">
                  <DialogHeader>
                    <DialogTitle className="text-amber-900">
                      Invite New Admin
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-amber-800">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="bg-amber-50 border-amber-300 text-amber-900"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={inviteAdmin}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        Send Invitation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNewAdminEmail("");
                          setInviteDialogOpen(false);
                        }}
                        className="border-amber-400 text-amber-800"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="space-y-3">
            {adminUsers.map((admin) => (
              <Card
                key={admin.id}
                className="bg-amber-50/30 border border-amber-300"
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {admin.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-900 text-sm">
                          {admin.email}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={`${getRoleColor(admin.role)} text-xs`}
                          >
                            {admin.role.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge
                            className={`text-xs ${
                              admin.is_active ? "bg-green-600" : "bg-red-600"
                            } text-white`}
                          >
                            {admin.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {adminUser.role === "super_admin" &&
                      admin.id !== adminUser.id && (
                        <Button
                          size="sm"
                          onClick={() =>
                            toggleAdminStatus(admin.id, admin.is_active)
                          }
                          className={`text-xs ${
                            admin.is_active
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {admin.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="wood-card border-amber-700">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-amber-900 flex items-center gap-2 text-base sm:text-lg">
            <Database className="h-4 w-4 sm:h-5 sm:w-5 text-amber-800" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-amber-200">
              <span className="text-amber-800 text-sm">
                Database Connection
              </span>
              <Badge className="bg-green-600 text-white text-xs">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-amber-200">
              <span className="text-amber-800 text-sm">Real-time Updates</span>
              <Badge className="bg-green-600 text-white text-xs">Active</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-amber-800 text-sm">Admin Session</span>
              <Badge className="bg-amber-600 text-white text-xs">Valid</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-500">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900 mb-1">
                Security Notice
              </h4>
              <p className="text-orange-800 text-sm">
                Admin privileges provide access to sensitive user data and
                financial information. Please use these tools responsibly and
                maintain strict confidentiality of all user data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
