import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Coins,
  CreditCard,
  Gift,
  Star,
  Zap,
  Crown,
  Sparkles,
  History,
  MapPin,
  Wallet,
  DollarSign,
} from "lucide-react";
import { addCoins, getUserCoinBalance } from "@/utils/wordsearchDbHelper";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useRazorpay, convertUSDToINR, formatINR } from "@/hooks/useRazorpay";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

interface CoinShopProps {
  onBack: () => void;
  user: User;
  currentBalance: number;
  onPurchaseComplete: () => void;
}

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  priceINR: number;
  bonus: number;
  popular?: boolean;
  bestValue?: boolean;
  icon: React.ReactNode;
  gradient: string;
  description: string;
}

export const CoinShop: React.FC<CoinShopProps> = ({
  onBack,
  user,
  currentBalance,
  onPurchaseComplete,
}) => {
  const { isMobile } = useDeviceType();
  const { initiatePayment, isLoading: razorpayLoading } = useRazorpay();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [lastFreeCoins, setLastFreeCoins] = useState<string | null>(null);
  const [paymentRegion, setPaymentRegion] = useState<"US" | "IN">("IN"); // Default to India
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "razorpay">(
    "wallet",
  );

  // Check if user can claim free daily coins and fetch wallet
  useEffect(() => {
    const lastClaim = localStorage.getItem(`word_search_free_coins_${user.id}`);
    setLastFreeCoins(lastClaim);
    fetchWallet();
  }, [user.id]);

  const fetchWallet = async () => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching wallet:", error);
        // If wallet doesn't exist, we'll still show wallet option but with 0 balance
        setWallet({
          id: "",
          user_id: user.id,
          balance: 0,
          locked_balance: 0,
          created_at: null,
          updated_at: null,
        });
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
      setWallet({
        id: "",
        user_id: user.id,
        balance: 0,
        locked_balance: 0,
        created_at: null,
        updated_at: null,
      });
    }
  };

  const coinPackages: CoinPackage[] = [
    {
      id: "starter",
      name: "Starter Pack",
      coins: 100,
      price: 0.99,
      priceINR: 79,
      bonus: 10,
      icon: <Gift className="h-6 w-6" />,
      gradient: "from-green-500 to-emerald-600",
      description: "Perfect for beginners",
    },
    {
      id: "popular",
      name: "Popular Pack",
      coins: 500,
      price: 4.99,
      priceINR: 399,
      bonus: 100,
      popular: true,
      icon: <Star className="h-6 w-6" />,
      gradient: "from-blue-500 to-purple-600",
      description: "Most popular choice",
    },
    {
      id: "value",
      name: "Value Pack",
      coins: 1000,
      price: 8.99,
      priceINR: 699,
      bonus: 250,
      bestValue: true,
      icon: <Zap className="h-6 w-6" />,
      gradient: "from-orange-500 to-red-600",
      description: "Best value for money",
    },
    {
      id: "premium",
      name: "Premium Pack",
      coins: 2500,
      price: 19.99,
      priceINR: 1599,
      bonus: 750,
      icon: <Crown className="h-6 w-6" />,
      gradient: "from-yellow-500 to-amber-600",
      description: "For serious players",
    },
    {
      id: "ultimate",
      name: "Ultimate Pack",
      coins: 5000,
      price: 34.99,
      priceINR: 2799,
      bonus: 2000,
      icon: <Sparkles className="h-6 w-6" />,
      gradient: "from-purple-600 to-pink-600",
      description: "Maximum value",
    },
  ];

  const canClaimFreeCoins = () => {
    if (!lastFreeCoins) return true;

    const lastClaimDate = new Date(lastFreeCoins);
    const now = new Date();
    const timeDiff = now.getTime() - lastClaimDate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    return daysDiff >= 30; // Can claim once per month
  };

  const getNextFreeCoinsTime = () => {
    if (!lastFreeCoins) return null;

    const lastClaimDate = new Date(lastFreeCoins);
    const nextClaimTime = new Date(
      lastClaimDate.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    return nextClaimTime;
  };

  const handleClaimFreeCoins = async () => {
    if (!canClaimFreeCoins()) {
      toast.error("You can only claim free coins once per month!");
      return;
    }

    setPurchasing("free");

    try {
      const result = await addCoins(
        user.id,
        200, // Free monthly coins
        "daily_bonus",
        "Monthly free coins bonus",
      );

      if (result.success) {
        const now = new Date().toISOString();
        localStorage.setItem(`word_search_free_coins_${user.id}`, now);
        setLastFreeCoins(now);

        toast.success("🎉 You received 200 free coins!");
        onPurchaseComplete();
      } else {
        toast.error("Failed to claim free coins");
      }
    } catch (error) {
      console.error("Error claiming free coins:", error);
      toast.error("Failed to claim free coins");
    } finally {
      setPurchasing(null);
    }
  };

  const handleWalletPurchase = async (packageData: CoinPackage) => {
    if (!wallet || (wallet.balance || 0) < packageData.priceINR) {
      toast.error("Insufficient wallet balance!");
      return;
    }

    setPurchasing(packageData.id);

    try {
      // Deduct money from wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          balance: (wallet.balance || 0) - packageData.priceINR,
        })
        .eq("user_id", user.id);

      if (walletError) {
        throw new Error("Failed to deduct from wallet");
      }

      // Create transaction record
      const transactionData = {
        user_id: user.id,
        transaction_type: "withdrawal", // Using withdrawal since money is being deducted from wallet
        amount: packageData.priceINR,
        status: "completed",
        description: `Coin purchase: ${packageData.name} - ${packageData.coins + packageData.bonus} coins`,
      };

      console.log("Creating transaction with data:", transactionData);

      const { error: transactionError } = await supabase
        .from("transactions")
        .insert(transactionData);

      if (transactionError) {
        console.error("Error creating transaction:", {
          message: transactionError.message,
          details: transactionError.details,
          hint: transactionError.hint,
          code: transactionError.code,
        });
        // Show warning but don't fail the purchase
        toast.warning(
          "Purchase successful but failed to record transaction history",
        );
      } else {
        console.log("Transaction created successfully");
      }

      // Add coins to user account
      const totalCoins = packageData.coins + packageData.bonus;
      const result = await addCoins(
        user.id,
        totalCoins,
        "purchase",
        `Purchased ${packageData.name} - ${packageData.coins} coins + ${packageData.bonus} bonus`,
      );

      if (result.success) {
        toast.success(
          `🎉 You received ${totalCoins} coins! ₹${packageData.priceINR} deducted from wallet.`,
        );

        // Update local wallet state
        setWallet((prev) =>
          prev
            ? { ...prev, balance: (prev.balance || 0) - packageData.priceINR }
            : null,
        );

        onPurchaseComplete();
      } else {
        toast.error("Failed to process coin credit");
        // Revert wallet deduction on failure
        await supabase
          .from("wallets")
          .update({
            balance: wallet.balance || 0,
          })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error processing wallet purchase:", error);
      toast.error("Failed to process purchase");
    } finally {
      setPurchasing(null);
    }
  };

  const handleRazorpayPurchase = async (packageData: CoinPackage) => {
    setPurchasing(packageData.id);

    try {
      const paymentResult = await initiatePayment({
        amount: packageData.priceINR,
        currency: "INR",
        name: "Word Search Game",
        description: `${packageData.name} - ${packageData.coins + packageData.bonus} coins`,
        prefill: {
          name:
            user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          email: user.email || "",
        },
      });

      if (paymentResult.success) {
        toast.success(
          `🎉 Payment successful! Transaction ID: ${paymentResult.paymentId}`,
        );

        const totalCoins = packageData.coins + packageData.bonus;
        const result = await addCoins(
          user.id,
          totalCoins,
          "purchase",
          `Purchased ${packageData.name} - ${packageData.coins} coins + ${packageData.bonus} bonus`,
        );

        if (result.success) {
          toast.success(`🎉 You received ${totalCoins} coins!`);
          onPurchaseComplete();
        } else {
          toast.error("Failed to process coin credit");
        }
      } else if (paymentResult.error === "Payment cancelled by user") {
        toast.info("Payment cancelled");
      } else {
        throw new Error(paymentResult.error || "Payment failed");
      }
    } catch (error) {
      console.error("Error processing razorpay purchase:", error);
      toast.error("Failed to process purchase");
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchase = async (packageData: CoinPackage) => {
    if (paymentMethod === "wallet") {
      await handleWalletPurchase(packageData);
    } else {
      await handleRazorpayPurchase(packageData);
    }
  };

  const formatNextClaimTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return "Available now";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <MobileContainer>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-4">
                {/* Wallet Balance */}
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm text-white">
                    ₹{wallet?.balance?.toFixed(2) || "0.00"}
                  </span>
                </div>

                {/* Coin Balance */}
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm text-white">
                    {currentBalance} coins
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl mb-2">Coin Shop</CardTitle>
              <p className="text-green-100">
                Get coins to play multiplayer games and buy hints
              </p>

              {/* Payment Method Selector */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant={paymentMethod === "wallet" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`text-white ${paymentMethod === "wallet" ? "bg-white/20" : "hover:bg-white/10"}`}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Pay with Wallet
                </Button>
                <Button
                  variant={paymentMethod === "razorpay" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`text-white ${paymentMethod === "razorpay" ? "bg-white/20" : "hover:bg-white/10"}`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay with Card
                </Button>
              </div>

              {paymentMethod === "razorpay" && (
                <p className="text-green-200 text-sm mt-2">
                  💳 Secure payments powered by Razorpay
                </p>
              )}
              {paymentMethod === "wallet" && (
                <p className="text-green-200 text-sm mt-2">
                  💰 Pay directly from your wallet balance
                </p>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Free Monthly Coins */}
        <Card className="border-2 border-dashed border-green-300 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Monthly Free Coins
              </h3>
              <p className="text-green-700 mb-4">
                Get 200 free coins every month!
              </p>

              {canClaimFreeCoins() ? (
                <Button
                  onClick={handleClaimFreeCoins}
                  disabled={purchasing === "free"}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {purchasing === "free"
                    ? "Claiming..."
                    : "Claim 200 Free Coins"}
                </Button>
              ) : (
                <div>
                  <Button disabled className="mb-2" size="lg">
                    Already Claimed This Month
                  </Button>
                  <p className="text-sm text-green-600">
                    Next free coins in:{" "}
                    {formatNextClaimTime(getNextFreeCoinsTime()!)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coin Packages */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Coin Packages</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coinPackages.map((pkg) => {
              const totalCoins = pkg.coins + pkg.bonus;
              const isPurchasing = purchasing === pkg.id;
              const displayPrice = pkg.priceINR;
              const currency = "₹";

              return (
                <Card
                  key={pkg.id}
                  className={`relative transition-all duration-300 hover:shadow-lg ${
                    pkg.popular ? "ring-2 ring-blue-500 scale-105" : ""
                  } ${pkg.bestValue ? "ring-2 ring-orange-500" : ""}`}
                >
                  {/* Badges */}
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  {pkg.bestValue && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white">
                      Best Value
                    </Badge>
                  )}

                  <CardHeader>
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${pkg.gradient} flex items-center justify-center text-white mb-4`}
                    >
                      {pkg.icon}
                    </div>

                    <CardTitle className="text-center">{pkg.name}</CardTitle>
                    <p className="text-center text-sm text-gray-600">
                      {pkg.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {pkg.coins.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Base Coins</div>

                      {pkg.bonus > 0 && (
                        <div className="mt-2">
                          <div className="text-lg font-bold text-orange-600">
                            +{pkg.bonus.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            Bonus Coins
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t">
                        <div className="text-2xl font-bold text-blue-600">
                          {totalCoins.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Coins</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePurchase(pkg)}
                      disabled={
                        isPurchasing ||
                        razorpayLoading ||
                        (paymentMethod === "wallet" &&
                          (wallet?.balance || 0) < pkg.priceINR)
                      }
                      className={`w-full bg-gradient-to-r ${pkg.gradient} hover:opacity-90 text-white ${
                        paymentMethod === "wallet" &&
                        (wallet?.balance || 0) < pkg.priceINR
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      size="lg"
                    >
                      {isPurchasing ? (
                        "Processing..."
                      ) : (
                        <div className="flex items-center gap-2">
                          {paymentMethod === "wallet" ? (
                            <>
                              <Wallet className="h-4 w-4" />
                              {currency}
                              {displayPrice}
                              <span className="text-xs opacity-75">
                                from Wallet
                              </span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              {currency}
                              {displayPrice}
                              <span className="text-xs opacity-75">
                                via Razorpay
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </Button>

                    {/* Insufficient balance warning */}
                    {paymentMethod === "wallet" &&
                      (wallet?.balance || 0) < pkg.priceINR && (
                        <p className="text-xs text-red-300 mt-1 text-center">
                          Insufficient wallet balance (₹
                          {(wallet?.balance || 0).toFixed(2)} available)
                        </p>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How to Use Coins */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              How to Use Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🎮</div>
                <h3 className="font-bold mb-1">Multiplayer Games</h3>
                <p className="text-sm text-gray-600">
                  Entry fees for competitive games with prize pools
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-2">💡</div>
                <h3 className="font-bold mb-1">Hints</h3>
                <p className="text-sm text-gray-600">
                  Get help finding words (5 coins per hint)
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <h3 className="font-bold mb-1">Tournaments</h3>
                <p className="text-sm text-gray-600">
                  Enter special events and competitions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">ℹ️</div>
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Payment Information:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • 💰 <strong>Wallet Payment:</strong> Pay instantly from
                    your wallet balance
                  </li>
                  <li>
                    • 💳 <strong>Card Payment:</strong> Secure payments via
                    Razorpay (UPI, Cards, Net Banking)
                  </li>
                  <li>• 🔒 All transactions are secure and encrypted</li>
                  <li>• 💎 Get bonus coins with every purchase</li>
                  <li>• 🎁 Free monthly coins available (200 coins)</li>
                  <li>• 🏆 Win coins back by performing well in games</li>
                  <li>• 💸 Add money to wallet via the main wallet section</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
