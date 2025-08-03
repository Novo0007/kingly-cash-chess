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
        transactionsResult,
        revenueResult,
        withdrawalsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase
          .from("chess_games")
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

      const totalRevenue =
        revenueResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        activeGames: chessGamesResult.count || 0,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card border border-border rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 sm:h-8 bg-muted rounded w-1/2"></div>
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
      color: "text-green-600 dark:text-green-400",
      bgColor:
        "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    },
    {
      title: "Active Games",
      value: stats.activeGames.toLocaleString(),
      icon: Gamepad2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor:
        "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: CreditCard,
      color: "text-orange-600 dark:text-orange-400",
      bgColor:
        "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor:
        "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor:
        "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
    },
    {
      title: "Pending Withdrawals",
      value: stats.pendingWithdrawals.toLocaleString(),
      icon: Activity,
      color: "text-red-600 dark:text-red-400",
      bgColor:
        "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor} rounded-2xl`}>
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base font-medium">
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className={`text-xl sm:text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border border-border rounded-2xl mt-6">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-foreground text-lg sm:text-xl">
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-foreground text-sm sm:text-base">
                System Status
              </span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs sm:text-sm rounded-full">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-foreground text-sm sm:text-base">
                Database Connection
              </span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs sm:text-sm rounded-full">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-foreground text-sm sm:text-base">
                Admin Level
              </span>
              <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm rounded-full">
                {adminUser.role.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
