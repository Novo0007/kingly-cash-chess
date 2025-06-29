
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Gamepad2,
  Ban,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/integrations/supabase/types";

interface UserManagementProps {
  adminUser: Tables<"admin_users">;
}

type Profile = Tables<"profiles">;
type Wallet = Tables<"wallets">;

interface UserWithWallet extends Profile {
  wallets: Wallet[];
}

export const UserManagement = ({ adminUser }: UserManagementProps) => {
  const [users, setUsers] = useState<UserWithWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserWithWallet | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          wallets (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
      
      toast.success("User updated successfully");
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const updateUserWallet = async (userId: string, balance: number) => {
    try {
      const { error } = await supabase
        .from("wallets")
        .update({ balance })
        .eq("user_id", userId);

      if (error) throw error;
      
      toast.success("Wallet updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating wallet:", error);
      toast.error("Failed to update wallet");
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-600">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users by username, name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const wallet = user.wallets?.[0];
              
              return (
                <Card key={user.id} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {user.username}
                          </h3>
                          {user.full_name && (
                            <p className="text-slate-300 text-sm">
                              {user.full_name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-blue-600 text-white text-xs">
                              Rating: {user.chess_rating || 1200}
                            </Badge>
                            <Badge className="bg-green-600 text-white text-xs">
                              <Gamepad2 className="h-3 w-3 mr-1" />
                              {user.games_won}/{user.games_played}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {wallet && (
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              ₹{wallet.balance.toFixed(2)}
                            </p>
                            <p className="text-slate-400 text-sm">
                              Locked: ₹{wallet.locked_balance.toFixed(2)}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-400 border-blue-600 hover:bg-blue-600/20"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-600">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  Edit User: {user.username}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-white">Username</Label>
                                  <Input
                                    defaultValue={user.username}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    onChange={(e) =>
                                      setEditingUser({
                                        ...user,
                                        username: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-white">Full Name</Label>
                                  <Input
                                    defaultValue={user.full_name || ""}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    onChange={(e) =>
                                      setEditingUser({
                                        ...user,
                                        full_name: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-white">Chess Rating</Label>
                                  <Input
                                    type="number"
                                    defaultValue={user.chess_rating || 1200}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    onChange={(e) =>
                                      setEditingUser({
                                        ...user,
                                        chess_rating: parseInt(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                                {wallet && (
                                  <div>
                                    <Label className="text-white">Wallet Balance</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      defaultValue={wallet.balance}
                                      className="bg-slate-700 border-slate-600 text-white"
                                      onChange={(e) =>
                                        updateUserWallet(
                                          user.id,
                                          parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  </div>
                                )}
                                <Button
                                  onClick={() =>
                                    editingUser &&
                                    updateUserProfile(editingUser.id, {
                                      username: editingUser.username,
                                      full_name: editingUser.full_name,
                                      chess_rating: editingUser.chess_rating,
                                    })
                                  }
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  Update User
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
