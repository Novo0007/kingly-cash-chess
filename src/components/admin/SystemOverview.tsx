
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Gamepad2,
  CreditCard,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface SystemOverviewProps {
  adminUser: Tables<"admin_users">;
}

export const SystemOverview = ({ adminUser }: SystemOverviewProps) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeGames: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const [
        usersResult,
        chessGamesResult,
        ludoGamesResult,
        transactionsResult,
        revenueResult,
        withdrawalsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase
          .from("chess_games")
          .select("id", { count: "exact" })
          .in("game_status", ["waiting", "active"]),
        supabase
          .from("ludo_games")
          .select("id", { count: "exact" })
          .in("game_status", ["waiting", "active"]),
        supabase.from("transactions").select("id", { count: "exact" }),
        supabase
          .from("transactions")
          .select("amount")
          .eq("status", "completed")
          .eq("transaction_type", "deposit"),
        supabase
          .from("transactions")
          .select("amount", { count: "exact" })
          .eq("status", "pending")
          .eq("transaction_type", "withdrawal"),
      ]);

      const totalRevenue = revenueResult.data?.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      ) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        activeGames: (chessGamesResult.count || 0) + (ludoGamesResult.count || 0),
        totalTransactions: transactionsResult.count || 0,
        totalRevenue,
        todayRevenue: 0, // We'll implement this later
        pendingWithdrawals: withdrawalsResult.count || 0,
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-600">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-600 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20 border-blue-600/30",
    },
    {
      title: "Active Games",
      value: stats.activeGames.toLocaleString(),
      icon: Gamepad2,
      color: "text-green-400",
      bgColor: "bg-green-900/20 border-green-600/30",
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: CreditCard,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20 border-purple-600/30",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20 border-yellow-600/30",
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20 border-orange-600/30",
    },
    {
      title: "Pending Withdrawals",
      value: stats.pendingWithdrawals.toLocaleString(),
      icon: Activity,
      color: "text-red-400",
      bgColor: "bg-red-900/20 border-red-600/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-sm font-medium">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-600">
              <span className="text-slate-300">System Status</span>
              <Badge className="bg-green-600 text-white">Operational</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-600">
              <span className="text-slate-300">Database Connection</span>
              <Badge className="bg-green-600 text-white">Connected</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-300">Admin Level</span>
              <Badge className="bg-purple-600 text-white">
                {adminUser.role.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
