import { useState, useEffect, useCallback } from "react";
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
  Coins,
} from "lucide-react";
import { WithdrawalForm } from "./WithdrawalForm";
import { CoinTopUpSystem } from "./CoinTopUpSystem";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import type { Tables } from "@/integrations/supabase/types";

export const WalletManager = () => {
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [transactions, setTransactions] = useState<Tables<"transactions">[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState<{
    open: boolean;
    amount: number;
  }>({
    open: false,
    amount: 0,
  });
  const [userCoins, setUserCoins] = useState(0);
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(true);

  const { isMobile, isTablet } = useDeviceType();

  // Optimized fetch functions with better error handling
  const fetchWallet = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      console.log("Fetching wallet for user:", user.id);
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Wallet fetch error:", error);
        if (error.code === "PGRST116") {
          // Wallet doesn't exist, create one
          console.log("Creating new wallet...");
          await createWallet(user.id);
          return;
        }
        toast.error("Error loading wallet: " + error.message);
      } else {
        console.log("Wallet fetched successfully:", data);
        setWallet(data);
      }
    } catch (error) {
      console.error("Unexpected wallet fetch error:", error);
      toast.error("Failed to load wallet");
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Fetching transactions for user:", user.id);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Transaction fetch error:", error);
        toast.error("Error loading transactions: " + error.message);
      } else {
        console.log("Transactions fetched:", data?.length || 0, "records");
        setTransactions(data || []);
      }
    } catch (error) {
      console.error("Unexpected transaction fetch error:", error);
    }
  }, []);

  const fetchUserCoins = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc("get_user_coins" as any, {
        target_user_id: user.id,
      });

      if (error) {
        console.error("Error fetching user coins:", error);
      } else {
        setUserCoins((data as any)?.coins_balance || 0);
      }
    } catch (error) {
      console.error("Unexpected error fetching coins:", error);
    }
  }, []);

  const fetchWithdrawalSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings" as any)
        .select("setting_value")
        .eq("setting_key", "withdrawal_enabled")
        .single();

      if (error) {
        console.error("Error fetching withdrawal settings:", error);
      } else {
        setWithdrawalEnabled((data as any).setting_value === "true" || (data as any).setting_value === true);
      }
    } catch (error) {
      console.error("Error fetching withdrawal settings:", error);
    }
  }, []);

  const createWallet = async (userId: string) => {
    try {
      console.log("Creating wallet for user:", userId);
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
        console.error("Wallet creation error:", error);
        toast.error("Error creating wallet: " + error.message);
      } else {
        console.log("Wallet created successfully:", data);
        setWallet(data);
        toast.success("🎉 Welcome! Your wallet has been created.");
      }
    } catch (error) {
      console.error("Unexpected wallet creation error:", error);
    }
  };

  // Initial data load
  useEffect(() => {
    const initializeWallet = async () => {
      console.log("Initializing wallet data...");
      setInitialLoading(true);
      
      try {
        await Promise.all([fetchWallet(), fetchTransactions(), fetchUserCoins(), fetchWithdrawalSettings()]);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeWallet();
  }, [fetchWallet, fetchTransactions, fetchUserCoins, fetchWithdrawalSettings]);

  // Real-time subscriptions with optimized channels
  useEffect(() => {
    console.log("Setting up real-time subscriptions...");
    
    const walletChannel = supabase
      .channel("wallet_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
        },
        (payload) => {
          console.log("Real-time wallet update:", payload);
          if (payload.new) {
            setWallet(payload.new as Tables<"wallets">);
            toast.success("💰 Wallet updated!");
          }
        }
      )
      .subscribe((status) => {
        console.log("Wallet channel status:", status);
      });

    const transactionChannel = supabase
      .channel("transaction_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          console.log("Real-time transaction insert:", payload);
          if (payload.new) {
            const newTransaction = payload.new as Tables<"transactions">;
            setTransactions(prev => [newTransaction, ...prev]);
            
            // Show notification based on transaction type
            if (newTransaction.transaction_type === "game_winning") {
              toast.success(`🏆 You won ₹${newTransaction.amount}!`);
            } else if (newTransaction.transaction_type === "deposit") {
              toast.success(`💰 Deposit of ₹${newTransaction.amount} completed!`);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          console.log("Real-time transaction update:", payload);
          fetchTransactions(); // Refresh transactions on update
        }
      )
      .subscribe((status) => {
        console.log("Transaction channel status:", status);
      });

    return () => {
      console.log("Cleaning up subscriptions...");
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(transactionChannel);
    };
  }, [fetchTransactions]);

  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    setRefreshing(true);
    try {
      await Promise.all([fetchWallet(), fetchTransactions()]);
      toast.success("✨ Data refreshed!");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
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
    console.log("Initiating deposit of ₹", depositAmount);

    try {
      // Initialize Razorpay
      const options = {
        key: "rzp_live_uEV76dlTQYpxEl",
        amount: depositAmount * 100,
        currency: "INR",
        name: "Chess Game Wallet",
        description: `Deposit ₹${depositAmount} to your gaming wallet`,
        image: "/favicon.ico",
        handler: async function (response: any) {
          try {
            console.log("Payment successful:", response.razorpay_payment_id);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              toast.error("User not found");
              return;
            }

            // Create transaction record immediately
            const { error: transactionError } = await supabase.from("transactions").insert({
              user_id: user.id,
              transaction_type: "deposit",
              amount: depositAmount,
              status: "completed",
              description: `Razorpay deposit of ₹${depositAmount}`,
              razorpay_payment_id: response.razorpay_payment_id,
            });

            if (transactionError) {
              console.error("Transaction creation error:", transactionError);
              toast.error("Failed to record transaction");
              return;
            }

            // Update wallet balance using RPC function
            const { error: walletError } = await supabase.rpc("increment_decimal", {
              table_name: "wallets",
              row_id: user.id,
              column_name: "balance",
              increment_value: depositAmount,
            });

            if (walletError) {
              console.error("Wallet update error:", walletError);
              toast.error("Failed to update wallet balance");
              return;
            }

            console.log("Deposit completed successfully");
            toast.success(`💰 Successfully deposited ₹${depositAmount}!`);
            setAmount("");
            
            // Force refresh data
            setTimeout(() => {
              fetchWallet();
              fetchTransactions();
            }, 1000);

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
            console.log("Payment cancelled by user");
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
        
        // Handle specific UPI error case
        if (response.error && response.error.upiNoApp) {
          toast.error("No UPI app found on this device. Please try another payment method like Card or Net Banking.");
        } else {
          // Handle other payment failures
          const errorMessage = response.error?.description || "Payment failed. Please try again.";
          toast.error(`Payment failed: ${errorMessage}`);
        }
        
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "withdrawal",
        amount: withdrawalData.finalAmount,
        status: "pending",
        description: `Withdrawal to ${withdrawalData.accountType === "bank" ? "Bank Account" : "UPI"}: ${withdrawalData.accountType === "bank" ? withdrawalData.accountNumber : withdrawalData.upiId}`,
      });

      if (error) throw error;

      const { error: walletError } = await supabase.rpc("increment_decimal", {
        table_name: "wallets",
        row_id: user.id,
        column_name: "balance",
        increment_value: -withdrawalData.originalAmount,
      });

      if (walletError) throw walletError;

      toast.success("🏦 Withdrawal request submitted! Processing will take 1-3 business days.");
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

  // Show loading state
  if (initialLoading) {
    return (
      <MobileContainer maxWidth="xl">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-semibold">Loading Wallet...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const cardGradient = isMobile
    ? "bg-slate-800/80 border border-slate-600"
    : "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 shadow-lg";

  const animationClass = isMobile ? "" : "transition-all duration-300 hover:scale-105";

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        <WithdrawalForm
          open={withdrawalForm.open}
          onOpenChange={(open) => setWithdrawalForm((prev) => ({ ...prev, open }))}
          amount={withdrawalForm.amount}
          onWithdraw={handleWithdrawalSubmit}
        />

        {/* Wallet Balance Card */}
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
                <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${refreshing ? "animate-spin" : ""}`} />
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

        {/* Deposit/Withdraw Card */}
        <Card className={`${cardGradient} ${animationClass} border-green-600/30`}>
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
                {loading ? "Processing..." : "Add Money (Razorpay)"}
              </Button>
              {withdrawalEnabled && (
                <Button
                  onClick={handleWithdrawClick}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Withdraw (-20% fee)
                </Button>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-300 text-xs md:text-sm">
                ℹ️ <strong>Note:</strong> Deposits are instant via Razorpay.
                Withdrawals have a 20% processing fee and take 1-3 business days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coin Top-Up System */}
        <CoinTopUpSystem 
          userCoins={userCoins} 
          onCoinsUpdated={(newBalance) => setUserCoins(newBalance)} 
        />

        {/* Transaction History */}
        <Card className={`${cardGradient} ${animationClass} border-purple-600/30`}>
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
                          {new Date(transaction.created_at).toLocaleDateString("en-IN", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}{" "}
                          •{" "}
                          {new Date(transaction.created_at).toLocaleTimeString("en-IN", {
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
                          getTransactionSign(transaction.transaction_type) === "+"
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