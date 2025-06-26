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

    // Auto-refresh every 10 seconds to catch game winnings
    const autoRefreshInterval = setInterval(() => {
      fetchWallet();
      fetchTransactions();
    }, 10000);

    // Subscribe to real-time changes for wallet and transactions
    const walletSubscription = supabase
      .channel("wallet_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
        },
        () => {
          console.log("Wallet updated, refreshing...");
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
        () => {
          console.log("New transaction, refreshing...");
          fetchTransactions();
        },
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(walletSubscription);
    };
  }, []);

  const fetchWallet = async () => {
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
        // No rows returned
        console.log("Creating new wallet for user...");
        await createWallet(user.id);
        return;
      }

      toast.error(
        "Error loading wallet: " + (error.message || "Unknown error"),
      );
    } else {
      setWallet(data);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching transactions:", error.message || error);
      toast.error(
        "Error loading transactions: " + (error.message || "Unknown error"),
      );
    } else {
      setTransactions(data || []);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
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
            const { error } = await supabase.from("transactions").insert({
              user_id: user.id,
              transaction_type: "deposit",
              amount: depositAmount,
              status: "completed",
              description: `Razorpay deposit of ₹${depositAmount}`,
              razorpay_payment_id: response.razorpay_payment_id,
            });

            if (error) throw error;

            // Update wallet balance
            const { error: walletError } = await supabase.rpc(
              "increment_decimal",
              {
                table_name: "wallets",
                row_id: user.id,
                column_name: "balance",
                increment_value: depositAmount,
              },
            );

            if (walletError) throw walletError;

            toast.success(`💰 Successfully deposited ₹${depositAmount}!`);
            setAmount("");
            fetchWallet();
            fetchTransactions();
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
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "game_winning":
        return <CreditCard className="h-4 w-4 text-yellow-500" />;
      case "game_entry":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case "refund":
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
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

  // Mobile-optimized styles
  const cardGradient = isMobile
    ? "bg-slate-800/80 border border-slate-600"
    : "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 shadow-lg";

  const animationClass = isMobile ? "" : "transition-all duration-300 hover:scale-105";

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
        <Card className={`${cardGradient} ${animationClass} border-yellow-600/30`}>
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
                  className={`h-3 w-3 md:h-4 md:w-4 ${refreshing && !isMobile ? "animate-spin" : ""}`}
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
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-slate-600/30 shadow-xl rounded-xl backdrop-blur-sm">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-white flex items-center gap-2 md:gap-3">
            <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-lg md:text-xl">💳 Manage Funds</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div>
            <label className="text-white font-medium mb-2 block text-sm md:text-base">
              Enter Amount (₹)
            </label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-gray-800/50 border-gray-600 text-white text-base md:text-lg py-3 px-3 md:px-4 rounded-lg"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {[100, 500, 1000, 2000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  variant="outline"
                  size="sm"
                  className="border-gray-500 text-gray-300 hover:bg-gray-700 text-xs md:text-sm py-2"
                >
                  ₹{quickAmount}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <Button
              onClick={handleDeposit}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 md:py-4 rounded-lg text-sm md:text-lg shadow-lg min-h-[48px]"
            >
              <ArrowDownLeft className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              💰 Add Money (Razorpay)
            </Button>
            <Button
              onClick={handleWithdrawClick}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 md:py-4 rounded-lg text-sm md:text-lg shadow-lg min-h-[48px]"
            >
              <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              🏦 Withdraw (-20% fee)
            </Button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-300 text-xs md:text-sm">
              ℹ️ <strong>Note:</strong> Deposits are instant via Razorpay.
              Withdrawals have a 20% processing fee and take 1-3 business days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-slate-600/30 shadow-xl rounded-xl backdrop-blur-sm">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-white flex items-center gap-2 md:gap-3">
            <History className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-lg md:text-xl">📊 Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <p className="text-gray-400 text-base md:text-lg">
                📭 No transactions yet
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:bg-gray-700/30 transition-colors gap-2 sm:gap-4"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium capitalize text-sm md:text-base">
                        {transaction.transaction_type.replace("_", " ")}
                      </p>
                      <p className="text-xs md:text-sm text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}{" "}
                        •{" "}
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-[250px] mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p
                      className={`font-semibold text-base md:text-lg ${
                        getTransactionSign(transaction.transaction_type) === "+"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {getTransactionSign(transaction.transaction_type)}₹
                      {transaction.amount.toFixed(2)}
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
  );
};