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
      console.error("Error fetching wallet:", error);
    } else {
      setWallet(data);
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
      console.error("Error fetching transactions:", error);
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
        key: "rzp_test_1234567890", // Replace with your actual Razorpay key
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

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen">
      <WithdrawalForm
        open={withdrawalForm.open}
        onOpenChange={(open) =>
          setWithdrawalForm((prev) => ({ ...prev, open }))
        }
        amount={withdrawalForm.amount}
        onWithdraw={handleWithdrawalSubmit}
      />

      {/* Wallet Balance */}
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 shadow-xl rounded-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6" />
              💰 Wallet Balance
            </div>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={refreshing}
              className="text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/30"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            ₹{wallet?.balance?.toFixed(2) || "0.00"}
          </div>
          {wallet?.locked_balance && wallet.locked_balance > 0 && (
            <p className="text-sm text-gray-400 flex items-center gap-2">
              🔒 Locked Balance: ₹{wallet.locked_balance.toFixed(2)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Available for games and withdrawals
          </p>
        </CardContent>
      </Card>

      {/* Deposit/Withdraw */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-slate-600/30 shadow-xl rounded-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <DollarSign className="h-6 w-6" />
            💳 Manage Funds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-white font-medium mb-2 block">
              Enter Amount (₹)
            </label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-gray-800/50 border-gray-600 text-white text-lg py-3 px-4 rounded-lg"
            />
            <div className="flex gap-2 mt-2">
              {[100, 500, 1000, 2000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  variant="outline"
                  size="sm"
                  className="border-gray-500 text-gray-300 hover:bg-gray-700"
                >
                  ₹{quickAmount}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handleDeposit}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-lg text-lg shadow-lg"
            >
              <ArrowDownLeft className="h-5 w-5 mr-2" />
              💰 Add Money (Razorpay)
            </Button>
            <Button
              onClick={handleWithdrawClick}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg text-lg shadow-lg"
            >
              <ArrowUpRight className="h-5 w-5 mr-2" />
              🏦 Withdraw (-20% fee)
            </Button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              ℹ️ <strong>Note:</strong> Deposits are instant via Razorpay.
              Withdrawals have a 20% processing fee and take 1-3 business days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-slate-600/30 shadow-xl rounded-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <History className="h-6 w-6" />
            📊 Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">📭 No transactions yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="text-white font-medium capitalize">
                        {transaction.transaction_type.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}{" "}
                        •{" "}
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 truncate max-w-[250px] mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold text-lg ${
                        getTransactionSign(transaction.transaction_type) === "+"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {getTransactionSign(transaction.transaction_type)}₹
                      {transaction.amount.toFixed(2)}
                    </p>
                    <Badge
                      className={`${getStatusColor(transaction.status)} border`}
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
