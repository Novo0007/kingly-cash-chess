import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle,
  X,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface PaymentManagementProps {
  adminUser: Tables<"admin_users">;
}

type Transaction = Tables<"transactions"> & {
  profiles: {
    username: string;
    full_name: string | null;
  } | null;
};

export const PaymentManagement = ({ adminUser }: PaymentManagementProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "failed"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "deposit" | "withdrawal" | "game_entry" | "game_winning" | "refund"
  >("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          profiles (
            username,
            full_name
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      const processedData = (data || []).map((transaction) => {
        const rawProfiles = transaction.profiles as any;

        if (
          rawProfiles &&
          typeof rawProfiles === "object" &&
          !Array.isArray(rawProfiles) &&
          typeof rawProfiles.username === "string"
        ) {
          return {
            ...transaction,
            profiles: {
              username: rawProfiles.username,
              full_name: rawProfiles.full_name || null,
            },
          };
        }

        return {
          ...transaction,
          profiles: null,
        };
      });

      setTransactions(processedData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: "completed" | "failed" | "pending",
  ) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status })
        .eq("id", transactionId);

      if (error) throw error;

      toast.success(`Transaction ${status} successfully`);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-600 text-white";
      case "failed":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-4 w-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpCircle className="h-4 w-4 text-red-400" />;
      case "game_entry":
        return <CreditCard className="h-4 w-4 text-blue-400" />;
      case "game_winning":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "refund":
        return <ArrowDownCircle className="h-4 w-4 text-orange-400" />;
      default:
        return <CreditCard className="h-4 w-4 text-blue-400" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "withdrawal":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "game_entry":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "game_winning":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "refund":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const statusMatch = filter === "all" || transaction.status === filter;
    const typeMatch =
      typeFilter === "all" || transaction.transaction_type === typeFilter;
    return statusMatch && typeMatch;
  });

  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );
  const completedAmount = filteredTransactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const withdrawalsPending = filteredTransactions.filter(
    (t) => t.transaction_type === "withdrawal" && t.status === "pending",
  ).length;

  if (loading) {
    return (
      <Card className="wood-card border-amber-600">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-8 h-8 border-3 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-900/20 border-green-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-green-300 text-sm">Total Amount</p>
                <p className="text-white font-bold text-lg">
                  ₹{totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-blue-300 text-sm">Completed</p>
                <p className="text-white font-bold text-lg">
                  ₹{completedAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-900/20 border-red-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-red-300 text-sm">Pending Withdrawals</p>
                <p className="text-white font-bold text-lg">
                  {withdrawalsPending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/20 border-purple-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-purple-300 text-sm">Total Transactions</p>
                <p className="text-white font-bold text-lg">
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-400" />
            Payment & Withdrawal Management
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <span className="text-slate-300 text-sm">Status:</span>
              {(["all", "pending", "completed", "failed"] as const).map(
                (status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={filter === status ? "default" : "outline"}
                    onClick={() => setFilter(status)}
                    className={
                      filter === status
                        ? "bg-green-600"
                        : "text-slate-300 border-slate-600"
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ),
              )}
            </div>
            <div className="flex gap-2">
              <span className="text-slate-300 text-sm">Type:</span>
              {(
                [
                  "all",
                  "deposit",
                  "withdrawal",
                  "game_entry",
                  "game_winning",
                  "refund",
                ] as const
              ).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={typeFilter === type ? "default" : "outline"}
                  onClick={() => setTypeFilter(type)}
                  className={
                    typeFilter === type
                      ? "bg-blue-600"
                      : "text-slate-300 border-slate-600"
                  }
                >
                  {type === "all"
                    ? "All"
                    : type.replace("_", " ").charAt(0).toUpperCase() +
                      type.replace("_", " ").slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <div className="space-y-4 pr-4">
              {filteredTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className="bg-slate-700 border-slate-600"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">
                              {transaction.profiles?.username || "Unknown User"}
                            </span>
                            <Badge
                              className={getStatusColor(
                                transaction.status || "pending",
                              )}
                            >
                              {transaction.status}
                            </Badge>
                            <Badge
                              className={getTransactionTypeColor(
                                transaction.transaction_type,
                              )}
                            >
                              {transaction.transaction_type
                                .replace("_", " ")
                                .toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">
                            {new Date(
                              transaction.created_at || "",
                            ).toLocaleDateString()}{" "}
                            •
                            {new Date(
                              transaction.created_at || "",
                            ).toLocaleTimeString()}
                          </p>
                          <p className="text-slate-300 text-sm">
                            {transaction.description ||
                              `${transaction.transaction_type.replace("_", " ")} transaction`}
                          </p>
                          {transaction.profiles?.full_name && (
                            <p className="text-slate-400 text-xs">
                              Full Name: {transaction.profiles.full_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              transaction.transaction_type === "withdrawal"
                                ? "text-red-400"
                                : transaction.transaction_type === "deposit"
                                  ? "text-green-400"
                                  : "text-white"
                            }`}
                          >
                            {transaction.transaction_type === "withdrawal"
                              ? "-"
                              : "+"}
                            ₹{Number(transaction.amount).toFixed(2)}
                          </p>
                          {transaction.razorpay_payment_id && (
                            <p className="text-slate-400 text-xs">
                              Payment ID: {transaction.razorpay_payment_id}
                            </p>
                          )}
                          {transaction.razorpay_order_id && (
                            <p className="text-slate-400 text-xs">
                              Order ID: {transaction.razorpay_order_id}
                            </p>
                          )}
                        </div>

                        {transaction.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransactionStatus(
                                  transaction.id,
                                  "completed",
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                              title={`Complete ${transaction.transaction_type === "withdrawal" ? "withdrawal" : "transaction"}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransactionStatus(
                                  transaction.id,
                                  "failed",
                                )
                              }
                              className="bg-red-600 hover:bg-red-700"
                              title={`Reject ${transaction.transaction_type === "withdrawal" ? "withdrawal" : "transaction"}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {transaction.status !== "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransactionStatus(
                                  transaction.id,
                                  "pending",
                                )
                              }
                              className="bg-blue-600 hover:bg-blue-700"
                              title="Mark as pending for review"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">
                    No transactions found matching the current filters.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
