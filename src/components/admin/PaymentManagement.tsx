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
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-900 text-sm sm:text-base">
            Loading transactions...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Payment Stats - Wood Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="wood-card bg-gradient-to-r from-green-50 to-green-100 border-green-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-800" />
              <div>
                <p className="text-green-800 text-xs sm:text-sm font-semibold">
                  Total Amount
                </p>
                <p className="text-green-900 font-bold text-sm sm:text-lg">
                  ₹{totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="wood-card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-800" />
              <div>
                <p className="text-blue-800 text-xs sm:text-sm font-semibold">
                  Completed
                </p>
                <p className="text-blue-900 font-bold text-sm sm:text-lg">
                  ₹{completedAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="wood-card bg-gradient-to-r from-red-50 to-red-100 border-red-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-800" />
              <div>
                <p className="text-red-800 text-xs sm:text-sm font-semibold">
                  Pending Withdrawals
                </p>
                <p className="text-red-900 font-bold text-sm sm:text-lg">
                  {withdrawalsPending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="wood-card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-800" />
              <div>
                <p className="text-purple-800 text-xs sm:text-sm font-semibold">
                  Total Transactions
                </p>
                <p className="text-purple-900 font-bold text-sm sm:text-lg">
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="wood-card wood-plank border-amber-700">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-amber-900 flex items-center gap-2 text-base sm:text-lg font-heading">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-800" />
            Payment & Withdrawal Management
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3">
            <div className="flex flex-col gap-2">
              <span className="text-amber-800 text-xs sm:text-sm font-semibold">
                Status:
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {(["all", "pending", "completed", "failed"] as const).map(
                  (status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={filter === status ? "default" : "outline"}
                      onClick={() => setFilter(status)}
                      className={`text-xs ${
                        filter === status
                          ? ""
                          : "text-amber-800 border-amber-600 bg-amber-100 hover:bg-amber-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ),
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-amber-800 text-xs sm:text-sm font-semibold">
                Type:
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
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
                    className={`text-xs ${
                      typeFilter === type
                        ? ""
                        : "text-amber-800 border-amber-600 bg-amber-100 hover:bg-amber-200"
                    }`}
                  >
                    {type === "all"
                      ? "All"
                      : type.replace("_", " ").charAt(0).toUpperCase() +
                        type.replace("_", " ").slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <ScrollArea className="h-[400px] sm:h-[600px] w-full">
            <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
              {filteredTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className="wood-card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                            <span className="text-amber-900 font-semibold text-sm sm:text-base">
                              {transaction.profiles?.username || "Unknown User"}
                            </span>
                            <Badge
                              className={`${getStatusColor(
                                transaction.status || "pending",
                              )} text-xs`}
                            >
                              {transaction.status}
                            </Badge>
                            <Badge
                              className={`${getTransactionTypeColor(
                                transaction.transaction_type,
                              )} text-xs`}
                            >
                              {transaction.transaction_type
                                .replace("_", " ")
                                .toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-amber-700 text-xs sm:text-sm">
                            {new Date(
                              transaction.created_at || "",
                            ).toLocaleDateString()}{" "}
                            •{" "}
                            {new Date(
                              transaction.created_at || "",
                            ).toLocaleTimeString()}
                          </p>
                          <p className="text-amber-800 text-xs sm:text-sm mt-1">
                            {transaction.description ||
                              `${transaction.transaction_type.replace("_", " ")} transaction`}
                          </p>
                          {transaction.profiles?.full_name && (
                            <p className="text-amber-600 text-xs mt-1">
                              Full Name: {transaction.profiles.full_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                        <div className="text-right">
                          <p
                            className={`font-bold text-sm sm:text-lg ${
                              transaction.transaction_type === "withdrawal"
                                ? "text-red-800"
                                : transaction.transaction_type === "deposit"
                                  ? "text-green-800"
                                  : "text-amber-900"
                            }`}
                          >
                            {transaction.transaction_type === "withdrawal"
                              ? "-"
                              : "+"}
                            ₹{Number(transaction.amount).toFixed(2)}
                          </p>
                          {transaction.razorpay_payment_id && (
                            <p className="text-amber-600 text-xs">
                              Payment ID: {transaction.razorpay_payment_id}
                            </p>
                          )}
                          {transaction.razorpay_order_id && (
                            <p className="text-amber-600 text-xs">
                              Order ID: {transaction.razorpay_order_id}
                            </p>
                          )}
                        </div>

                        {transaction.status === "pending" && (
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransactionStatus(
                                  transaction.id,
                                  "completed",
                                )
                              }
                              variant="default"
                              className="bg-green-700 hover:bg-green-800 text-white min-h-[44px] text-xs"
                              title={`Complete ${transaction.transaction_type === "withdrawal" ? "withdrawal" : "transaction"}`}
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransactionStatus(
                                  transaction.id,
                                  "failed",
                                )
                              }
                              variant="destructive"
                              className="min-h-[44px] text-xs"
                              title={`Reject ${transaction.transaction_type === "withdrawal" ? "withdrawal" : "transaction"}`}
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        )}

                        {transaction.status !== "pending" && (
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransactionStatus(
                                  transaction.id,
                                  "pending",
                                )
                              }
                              variant="outline"
                              className="text-amber-800 border-amber-600 bg-amber-100 hover:bg-amber-200 min-h-[44px] text-xs"
                              title="Mark as pending for review"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-amber-700 text-sm sm:text-base">
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
