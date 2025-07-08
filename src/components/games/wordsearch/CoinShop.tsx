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
} from "lucide-react";
import { addCoins, getUserCoinBalance } from "@/utils/wordsearchDbHelper";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useRazorpay, convertUSDToINR, formatINR } from "@/hooks/useRazorpay";
import type { User } from "@supabase/supabase-js";

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

  // Check if user can claim free daily coins
  useEffect(() => {
    const lastClaim = localStorage.getItem(`word_search_free_coins_${user.id}`);
    setLastFreeCoins(lastClaim);
  }, [user.id]);

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
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return hoursDiff >= 24; // Can claim once per day
  };

  const getNextFreeCoinsTime = () => {
    if (!lastFreeCoins) return null;

    const lastClaimDate = new Date(lastFreeCoins);
    const nextClaimTime = new Date(
      lastClaimDate.getTime() + 24 * 60 * 60 * 1000,
    );

    return nextClaimTime;
  };

  const handleClaimFreeCoins = async () => {
    if (!canClaimFreeCoins()) {
      toast.error("You can only claim free coins once per day!");
      return;
    }

    setPurchasing("free");

    try {
      const result = await addCoins(
        user.id,
        50, // Free daily coins
        "daily_bonus",
        "Daily free coins bonus",
      );

      if (result.success) {
        const now = new Date().toISOString();
        localStorage.setItem(`word_search_free_coins_${user.id}`, now);
        setLastFreeCoins(now);

        toast.success("🎉 You received 50 free coins!");
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

  const handlePurchase = async (packageData: CoinPackage) => {
    setPurchasing(packageData.id);

    try {
      let paymentSuccess = false;

      if (paymentRegion === "IN") {
        // Use Razorpay for Indian users
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
          paymentSuccess = true;
          toast.success(
            `🎉 Payment successful! Transaction ID: ${paymentResult.paymentId}`,
          );
        } else if (paymentResult.error === "Payment cancelled by user") {
          toast.info("Payment cancelled");
          setPurchasing(null);
          return;
        } else {
          throw new Error(paymentResult.error || "Payment failed");
        }
      } else {
        // Simulate international payment (for demo purposes)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        paymentSuccess = true;
      }

      if (paymentSuccess) {
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
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      toast.error("Failed to process purchase");
    } finally {
      setPurchasing(null);
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

              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                <span className="font-bold text-lg">{currentBalance}</span>
              </div>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl mb-2">Coin Shop</CardTitle>
              <p className="text-green-100">
                Get coins to play multiplayer games and buy hints
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Free Daily Coins */}
        <Card className="border-2 border-dashed border-green-300 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Daily Free Coins
              </h3>
              <p className="text-green-700 mb-4">
                Get 50 free coins every 24 hours!
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
                    : "Claim 50 Free Coins"}
                </Button>
              ) : (
                <div>
                  <Button disabled className="mb-2" size="lg">
                    Already Claimed Today
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
                      disabled={isPurchasing}
                      className={`w-full bg-gradient-to-r ${pkg.gradient} hover:opacity-90 text-white`}
                      size="lg"
                    >
                      {isPurchasing ? (
                        "Processing..."
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />${pkg.price}
                        </div>
                      )}
                    </Button>
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

        {/* Note */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">ℹ️</div>
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="space-y-1 text-xs">
                  <li>• This is a demo - no real payments are processed</li>
                  <li>• Coins are virtual currency for game features</li>
                  <li>• Free daily coins help you play without spending</li>
                  <li>• Win coins back by performing well in games</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
