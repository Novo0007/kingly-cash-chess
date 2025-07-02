
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, UserPlus, Trash2 } from "lucide-react";
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

export const AdminInvitations = ({ currentAdminUser }: AdminInvitationsProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<AdminUser[]>([]);

  useEffect(() => {
    fetchInvitations();
  }, []);

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

  const inviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // Check if email is already invited
      const { data: existing } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        toast.error("This email is already invited as an admin");
        setLoading(false);
        return;
      }

      // Create admin invitation
      const { error } = await supabase
        .from("admin_users")
        .insert({
          email: email,
          role: "admin",
          invited_by: currentAdminUser.user_id,
          is_active: true,
          permissions: {
            payments: true,
            withdrawals: true,
            users: true,
            games: true,
            full_access: false
          }
        });

      if (error) {
        console.error("Error inviting admin:", error);
        toast.error("Failed to send invitation");
        return;
      }

      toast.success(`Admin invitation sent to ${email}`);
      setEmail("");
      fetchInvitations();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const removeInvitation = async (adminId: string) => {
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

      toast.success("Invitation removed");
      fetchInvitations();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to remove invitation");
    }
  };

  const permissions = currentAdminUser.permissions as AdminPermissions | null;
  const canInviteAdmins = permissions?.invite_admins || 
    currentAdminUser.role === 'super_admin';

  return (
    <div className="space-y-6">
      {canInviteAdmins && (
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
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Inviting..." : "Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
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
                      <Badge variant={invitation.user_id ? "default" : "secondary"}>
                        {invitation.user_id ? "Active" : "Pending"}
                      </Badge>
                      <Badge variant="outline">{invitation.role}</Badge>
                    </div>
                  </div>
                </div>
                {canInviteAdmins && invitation.is_active && (
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
