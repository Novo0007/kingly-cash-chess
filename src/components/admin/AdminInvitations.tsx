import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, UserPlus, Trash2, Shield, AlertTriangle } from "lucide-react";
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

interface AdminInvitationsProps {
  currentAdminUser: AdminUser;
}

export const AdminInvitations = ({
  currentAdminUser,
}: AdminInvitationsProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<AdminUser[]>([]);
  const [canInvite, setCanInvite] = useState(false);

  useEffect(() => {
    fetchInvitations();
    checkInvitePermissions();
  }, []);

  const checkInvitePermissions = async () => {
    try {
      const { data, error } = await supabase.rpc("can_invite_admins");
      if (error) {
        console.error("Error checking invite permissions:", {
          message: error.message,
          details: error.details,
          code: error.code,
        });
        return;
      }
      setCanInvite(data || false);
    } catch (error) {
      console.error(
        "Unexpected error checking permissions:",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invitations:", error);
        return;
      }

      setInvitations(data || []);
    } catch (error) {
      console.error("Unexpected error fetching invitations:", error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const inviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast.error("Please enter an email address");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!canInvite) {
      toast.error("You don't have permission to invite admins");
      return;
    }

    setLoading(true);
    try {
      // Check if email is already invited
      const { data: existing } = await supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("email", trimmedEmail)
        .maybeSingle();

      if (existing) {
        if (existing.is_active) {
          toast.error("This email is already an active admin");
        } else {
          toast.error("This email has a deactivated admin account");
        }
        setLoading(false);
        return;
      }

      // Create admin invitation with secure defaults
      const { error } = await supabase.from("admin_users").insert({
        email: trimmedEmail,
        role: "admin",
        invited_by: currentAdminUser.user_id,
        is_active: true,
        permissions: {
          payments: false,
          withdrawals: false,
          users: false,
          games: false,
          full_access: false,
          invite_admins: false,
        },
      });

      if (error) {
        console.error("Error inviting admin:", error);
        toast.error("Failed to send invitation. Please try again.");
        return;
      }

      toast.success(`Admin invitation sent to ${trimmedEmail}`);
      setEmail("");
      fetchInvitations();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeInvitation = async (adminId: string) => {
    if (!canInvite) {
      toast.error("You don't have permission to remove admin invitations");
      return;
    }

    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: false })
        .eq("id", adminId);

      if (error) {
        console.error("Error removing invitation:", error);
        toast.error("Failed to remove invitation");
        return;
      }

      toast.success("Admin access revoked");
      fetchInvitations();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to remove invitation");
    }
  };

  const permissions = currentAdminUser.permissions as AdminPermissions | null;
  const isSuperAdmin = currentAdminUser.role === "super_admin";

  return (
    <div className="space-y-6">
      {!canInvite && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">
                You don't have permission to invite or manage admin users.
                Contact a super admin for access.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite New Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={inviteAdmin} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Inviting..." : "Invite"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-2">
              New admins will be created with minimal permissions. You can
              adjust their permissions after creation.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={invitation.user_id ? "default" : "secondary"}
                      >
                        {invitation.user_id ? "Active" : "Pending"}
                      </Badge>
                      <Badge
                        variant={
                          invitation.role === "super_admin"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {invitation.role === "super_admin"
                          ? "Super Admin"
                          : "Admin"}
                      </Badge>
                      {!invitation.is_active && (
                        <Badge variant="secondary">Deactivated</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {canInvite &&
                  invitation.is_active &&
                  invitation.role !== "super_admin" &&
                  invitation.id !== currentAdminUser.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeInvitation(invitation.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            ))}
            {invitations.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No admin users found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
