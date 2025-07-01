import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { WithdrawalForm } from "./WithdrawalForm";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import type { Tables } from "@/integrations/supabase/types";

export const WalletManager = () => {
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [transactions, setTransactions] = useState<Tables<"transactions">[]>(
    [],
  );
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState<{
    open: boolean;
    amount: number;
  }>({
    open: false,
    amount: 0,
  });

  const { isMobile, isTablet } = useDeviceType();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();

    // Auto-refresh every 30 seconds to catch game winnings
    const autoRefreshInterval = setInterval(() => {
      fetchWallet();
      fetchTransactions();
    }, 30000);

    // Subscribe to real-time changes for wallet and transactions
    const walletSubscription = supabase
      .channel("wallet_and_transactions_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
        },
        (payload) => {
          console.log("Wallet updated, refreshing...", payload);
          fetchWallet();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          console.log("New transaction detected:", payload);
          // Immediately refresh both wallet and transactions
          setTimeout(() => {
            fetchWallet();
            fetchTransactions();
          }, 1000); // Small delay to ensure DB consistency
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          console.log("Transaction updated:", payload);
          fetchTransactions();
          fetchWallet();
        },
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(walletSubscription);
    };
  }, []);

  const fetchWallet = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching wallet:", error.message || error);

        // If wallet doesn't exist, create one
        if (error.code === "PGRST116") {
          console.log("Creating new wallet for user...");
          await createWallet(user.id);
          return;
        }

        toast.error(
          "Error loading wallet: " + (error.message || "Unknown error"),
        );
      } else {
        console.log("Wallet data fetched:", data);
        setWallet(data);
      }
    } catch (error) {
      console.error("Unexpected error fetching wallet:", error);
    }
  };

  const createWallet = async (userId: string) => {
    const { data, error } = await supabase
      .from("wallets")
      .insert({
        user_id: userId,
        balance: 0.0,
        locked_balance: 0.0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating wallet:", error.message || error);
      toast.error(
        "Error creating wallet: " + (error.message || "Unknown error"),
      );
    } else {
      console.log("Wallet created successfully");
      setWallet(data);
      toast.success("🎉 Welcome! Your wallet has been created.");
    }
  };

  const fetchTransactions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50); // Increased limit to show more transactions including game winnings

      if (error) {
        console.error("Error fetching transactions:", error.message || error);
        toast.error(
          "Error loading transactions: " + (error.message || "Unknown error"),
        );
      } else {
        console.log("Transactions fetched:", data);
        setTransactions(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching transactions:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log("Manual refresh triggered");
    await Promise.all([fetchWallet(), fetchTransactions()]);
    setRefreshing(false);
    toast.success("Wallet data refreshed!");
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (depositAmount < 1) {
      toast.error("Minimum deposit amount is ₹1");
      return;
    }

    setLoading(true);

    try {
      // Initialize Razorpay
      const options = {
        key: "rzp_live_uEV76dlTQYpxEl", // Live Razorpay key
        amount: depositAmount * 100, // Amount in paise
        currency: "INR",
        name: "Chess Game Wallet",
        description: `Deposit ₹${depositAmount} to your gaming wallet`,
        image: "/favicon.ico", // Your logo
        handler: async function (response: any) {
          try {
            console.log("Razorpay payment successful:", response);
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Create transaction record
            const { error: transactionError } = await supabase.from("transactions").insert({
              user_id: user.id,
              transaction_type: "deposit",
              amount: depositAmount,
              status: "completed",
              description: `Razorpay deposit of ₹${depositAmount}`,
              razorpay_payment_id: response.razorpay_payment_id,
            });

            if (transactionError) {
              console.error("Transaction insert error:", transactionError);
              throw transactionError;
            }

            // Update wallet balance using the correct increment function
            const { error: walletError } = await supabase.rpc(
              "increment_decimal",
              {
                table_name: "wallets",
                row_id: user.id,
                column_name: "balance",
                increment_value: depositAmount,
              },
            );

            if (walletError) {
              console.error("Wallet update error:", walletError);
              throw walletError;
            }

            toast.success(`💰 Successfully deposited ₹${depositAmount}!`);
            setAmount("");
            await fetchWallet();
            await fetchTransactions();
          } catch (error) {
            console.error("Payment confirmation error:", error);
            toast.error("Payment confirmation failed. Please contact support.");
          }
        },
        prefill: {
          name: "Chess Player",
          email: "player@chessgame.com",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay payment cancelled");
            setLoading(false);
          },
        },
      };

      // @ts-ignore - Razorpay is loaded via script tag
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment system not loaded. Please refresh the page.");
        setLoading(false);
        return;
      }

      // @ts-ignore
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  const handleWithdrawClick = () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawAmount < 10) {
      toast.error("Minimum withdrawal amount is ₹10");
      return;
    }

    if (!wallet || wallet.balance < withdrawAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setWithdrawalForm({
      open: true,
      amount: withdrawAmount,
    });
  };

  const handleWithdrawalSubmit = async (withdrawalData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "withdrawal",
        amount: withdrawalData.finalAmount,
        status: "pending",
        description: `Withdrawal to ${withdrawalData.accountType === "bank" ? "Bank Account" : "UPI"}: ${withdrawalData.accountType === "bank" ? withdrawalData.accountNumber : withdrawalData.upiId}`,
      });

      if (error) throw error;

      // Update wallet balance
      const { error: walletError } = await supabase.rpc("increment_decimal", {
        table_name: "wallets",
        row_id: user.id,
        column_name: "balance",
        increment_value: -withdrawalData.originalAmount,
      });

      if (walletError) throw walletError;

      toast.success(
        "🏦 Withdrawal request submitted! Processing will take 1-3 business days.",
      );
      setAmount("");
      setWithdrawalForm({ open: false, amount: 0 });
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Withdrawal failed. Please try again.");
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case "game_winning":
        return <CreditCard className="h-4 w-4 text-yellow-400" />;
      case "game_entry":
        return <DollarSign className="h-4 w-4 text-blue-400" />;
      case "refund":
        return <RefreshCw className="h-4 w-4 text-purple-400" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTransactionSign = (type: string) => {
    return ["withdrawal", "game_entry"].includes(type) ? "-" : "+";
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case "game_winning":
        return "Game Winning";
      case "game_entry":
        return "Game Entry";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Mobile-optimized styles
  const cardGradient = isMobile
    ? "bg-slate-800/80 border border-slate-600"
    : "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 shadow-lg";

  const animationClass = isMobile
    ? ""
    : "transition-all duration-300 hover:scale-105";

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        <WithdrawalForm
          open={withdrawalForm.open}
          onOpenChange={(open) =>
            setWithdrawalForm((prev) => ({ ...prev, open }))
          }
          amount={withdrawalForm.amount}
          onWithdraw={handleWithdrawalSubmit}
        />

        {/* Wallet Balance */}
        <Card
          className={`${cardGradient} ${animationClass} border-yellow-600/30`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 flex items-center justify-between font-semibold text-base md:text-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
                Wallet Balance
              </div>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
                className="text-yellow-400 hover:bg-slate-700/50 h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`h-3 w-3 md:h-4 md:w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              ₹{wallet?.balance?.toFixed(2) || "0.00"}
            </div>
            {wallet?.locked_balance && wallet.locked_balance > 0 && (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                🔒 Locked Balance: ₹{wallet.locked_balance.toFixed(2)}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Available for games and withdrawals
            </p>
          </CardContent>
        </Card>

        {/* Deposit/Withdraw */}
        <Card
          className={`${cardGradient} ${animationClass} border-green-600/30`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 flex items-center gap-2 font-semibold text-base md:text-lg">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
              Manage Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white font-medium mb-2 block text-sm">
                Enter Amount (₹)
              </label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {[100, 500, 1000, 2000].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                  >
                    ₹{quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={handleDeposit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
              >
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Add Money (Razorpay)
              </Button>
              <Button
                onClick={handleWithdrawClick}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Withdraw (-20% fee)
              </Button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-300 text-xs md:text-sm">
                ℹ️ <strong>Note:</strong> Deposits are instant via Razorpay.
                Withdrawals have a 20% processing fee and take 1-3 business
                days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card
          className={`${cardGradient} ${animationClass} border-purple-600/30`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400 flex items-center gap-2 font-semibold text-base md:text-lg">
              <History className="h-5 w-5 md:h-6 md:w-6" />
              Recent Transactions
              <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                {transactions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-slate-400 text-sm md:text-base">
                  📭 No transactions yet
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors gap-2 sm:gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm">
                          {getTransactionTypeDisplay(transaction.transaction_type)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(
                            transaction.created_at,
                          ).toLocaleDateString("en-IN", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}{" "}
                          •{" "}
                          {new Date(
                            transaction.created_at,
                          ).toLocaleTimeString("en-IN", {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-slate-500 truncate max-w-[200px] mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p
                        className={`font-semibold text-base ${
                          getTransactionSign(transaction.transaction_type) ===
                          "+"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {getTransactionSign(transaction.transaction_type)}₹
                        {Number(transaction.amount).toFixed(2)}
                      </p>
                      <Badge
                        className={`${getStatusColor(transaction.status)} border text-xs mt-1`}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
