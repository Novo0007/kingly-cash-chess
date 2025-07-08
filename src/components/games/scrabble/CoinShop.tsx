import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Coins,
  Star,
  Gift,
  CreditCard,
  Smartphone,
  Wallet,
  Crown,
  Zap,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import {
  purchaseCoins,
  claimFreeCoins,
  hasClaimedFreeCoins,
} from "@/utils/scrabbleDbHelper";
import { toast } from "sonner";

interface CoinShopProps {
  userCoins: number;
  onPurchaseComplete: () => void;
  userId: string;
}

export const CoinShop: React.FC<CoinShopProps> = ({
  userCoins,
  onPurchaseComplete,
  userId,
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [hasClaimedFree, setHasClaimedFree] = useState<boolean>(true); // Default to true to hide initially
  const [claimingFree, setClaimingFree] = useState<boolean>(false);

  const coinPackages = [
    {
      id: "starter",
      name: "Starter Pack",
      coins: 500,
      bonus: 50,
      price: 99,
      popular: false,
      description: "Perfect for beginners",
      icon: Gift,
      color: "from-green-500 to-green-600",
    },
    {
      id: "popular",
      name: "Popular Choice",
      coins: 1500,
      bonus: 300,
      price: 249,
      popular: true,
      description: "Most value for money",
      icon: Star,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "premium",
      name: "Premium Pack",
      coins: 3000,
      bonus: 800,
      price: 499,
      popular: false,
      description: "For serious players",
      icon: Crown,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "mega",
      name: "Mega Pack",
      coins: 6000,
      bonus: 2000,
      price: 999,
      popular: false,
      description: "Maximum value",
      icon: Zap,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      available: true,
    },
    { id: "upi", name: "UPI", icon: Smartphone, available: true },
    { id: "wallet", name: "Digital Wallet", icon: Wallet, available: true },
  ];

  // Check if user has already claimed free coins
  React.useEffect(() => {
    const checkFreeClaimStatus = async () => {
      const result = await hasClaimedFreeCoins(userId);
      if (result.success) {
        setHasClaimedFree(result.hasClaimed);
      }
    };

    checkFreeClaimStatus();
  }, [userId]);

  const handleClaimFreeCoins = async () => {
    setClaimingFree(true);

    try {
      const result = await claimFreeCoins(userId);

      if (result.success) {
        toast.success("🎉 Successfully claimed 300 free coins!");
        setHasClaimedFree(true);
        onPurchaseComplete(); // Refresh coin balance
      } else if (result.alreadyClaimed) {
        toast.error("You have already claimed your free coins!");
        setHasClaimedFree(true);
      } else {
        toast.error(result.error || "Failed to claim free coins");
      }
    } catch (error) {
      console.error("Free coin claim error:", error);
      toast.error("Failed to claim free coins. Please try again.");
    } finally {
      setClaimingFree(false);
    }
  };

  const handlePurchase = async (packageData: (typeof coinPackages)[0]) => {
    setIsLoading(packageData.id);

    try {
      console.log("Initiating coin purchase:", packageData);

      // Initialize Razorpay
      const options = {
        key: "rzp_live_uEV76dlTQYpxEl", // Use same key as wallet
        amount: packageData.price * 100, // Convert to paise
        currency: "INR",
        name: "Scrabble Coin Shop",
        description: `Purchase ${packageData.coins + packageData.bonus} coins`,
        image: "/favicon.ico",
        handler: async function (response: any) {
          try {
            console.log("Payment successful:", response.razorpay_payment_id);

            // Process coin purchase after successful payment
            const result = await purchaseCoins(userId, {
              coins: packageData.coins,
              price: packageData.price,
              bonus: packageData.bonus,
            });

            if (result.success) {
              // Log the transaction with Razorpay payment ID
              await fetch("/api/log-coin-purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId,
                  packageData,
                  paymentId: response.razorpay_payment_id,
                  amount: packageData.price,
                }),
              }).catch(() => {}); // Ignore logging errors

              toast.success(
                `🎉 Successfully purchased ${packageData.coins + packageData.bonus} coins!`,
              );
              onPurchaseComplete();
            } else {
              toast.error(result.error || "Coin credit failed");
            }
          } catch (error) {
            console.error("Payment confirmation error:", error);
            toast.error(
              "Payment confirmed but coin credit failed. Please contact support.",
            );
          } finally {
            setIsLoading(null);
          }
        },
        prefill: {
          name: "Scrabble Player",
          email: "player@scrabble.com",
        },
        theme: {
          color: "#9333EA", // Purple theme for Scrabble
        },
        modal: {
          ondismiss: function () {
            console.log("Payment cancelled by user");
            setIsLoading(null);
          },
        },
      };

      // @ts-ignore - Razorpay is loaded via script tag
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment system not loaded. Please refresh the page.");
        setIsLoading(null);
        return;
      }

      // @ts-ignore
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);

        // Handle specific error cases
        if (response.error && response.error.code === "BAD_REQUEST_ERROR") {
          toast.error("Payment request invalid. Please try again.");
        } else if (response.error && response.error.description) {
          toast.error(`Payment failed: ${response.error.description}`);
        } else {
          toast.error("Payment failed. Please try again.");
        }

        setIsLoading(null);
      });

      rzp.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setIsLoading(null);
    }
  };

  const calculateSavings = (packageData: (typeof coinPackages)[0]) => {
    const baseRate = 99 / 500; // Rate from starter pack
    const packageRate =
      packageData.price / (packageData.coins + packageData.bonus);
    const savings = Math.round(((baseRate - packageRate) / baseRate) * 100);
    return Math.max(0, savings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <ShoppingCart className="h-8 w-8" />
            Coin Shop
          </CardTitle>
          <p className="text-yellow-100">
            Get more coins to play premium games!
          </p>
        </CardHeader>
      </Card>

      {/* Current Balance */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <Coins className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h2 className="text-3xl font-bold text-blue-800 mb-2">{userCoins}</h2>
          <p className="text-blue-600">Your Current Coins</p>
          {userCoins >= 1300 && (
            <div className="mt-3 p-2 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                🎉 First-time bonus included! (+300 coins)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Free Coin Claim - One Time Only */}
      {!hasClaimedFree && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <div className="p-3 bg-white/20 rounded-full">
                <Gift className="h-8 w-8" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-black">FREE 300 COINS!</div>
                <div className="text-green-100 text-sm font-medium">
                  One-time offer • Limited time
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="relative z-10 text-center space-y-4">
            <div className="space-y-2">
              <p className="text-lg font-medium text-green-100">
                🎁 Special welcome gift just for you!
              </p>
              <p className="text-green-200 text-sm">
                Claim your free coins now and start playing premium games
                without spending a penny!
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-300" />
                <span className="font-bold text-lg">What you get:</span>
                <Star className="h-5 w-5 text-yellow-300" />
              </div>
              <ul className="text-left space-y-1 text-sm">
                <li>• 300 bonus coins added instantly</li>
                <li>• Join premium games with entry fees</li>
                <li>• Compete for bigger prize pools</li>
                <li>• No payment required - completely free!</li>
              </ul>
            </div>

            <Button
              onClick={handleClaimFreeCoins}
              disabled={claimingFree}
              className="w-full bg-white text-green-600 hover:bg-gray-100 py-4 text-lg font-black rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {claimingFree ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-green-600 border-t-transparent rounded-full"></div>
                  Claiming Your Free Coins...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Gift className="h-6 w-6" />
                  CLAIM 300 FREE COINS NOW!
                  <Sparkles className="h-6 w-6" />
                </div>
              )}
            </Button>

            <div className="text-xs text-green-200 opacity-80">
              ⏰ This offer expires once claimed • Limited to one per account
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show confirmation after claiming */}
      {hasClaimedFree && (
        <Card className="bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Free coins already claimed</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              You've already received your one-time 300 coin bonus!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Coin Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {coinPackages.map((pkg) => {
          const IconComponent = pkg.icon;
          const savings = calculateSavings(pkg);

          return (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                pkg.popular ? "border-2 border-blue-400 shadow-lg" : "border"
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-bold">
                  🔥 MOST POPULAR
                </div>
              )}

              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${pkg.color} rounded-bl-full opacity-20`}
              ></div>

              <CardHeader className={`${pkg.popular ? "pt-12" : "pt-6"} pb-4`}>
                <div className="text-center">
                  <div
                    className={`inline-flex p-3 rounded-full bg-gradient-to-br ${pkg.color} text-white mb-3`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl mb-2">{pkg.name}</CardTitle>
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Coin Details */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {(pkg.coins + pkg.bonus).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {pkg.coins.toLocaleString()} + {pkg.bonus.toLocaleString()}{" "}
                    bonus
                  </div>
                </div>

                {/* Price */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{pkg.price}
                  </div>
                  {savings > 0 && (
                    <Badge className="bg-green-100 text-green-800 mt-1">
                      Save {savings}%
                    </Badge>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Base Coins:</span>
                    <span className="font-medium">
                      {pkg.coins.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bonus Coins:</span>
                    <span className="font-medium text-green-600">
                      +{pkg.bonus.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">
                      {(pkg.coins + pkg.bonus).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isLoading !== null}
                  className={`w-full bg-gradient-to-r ${pkg.color} hover:shadow-lg transition-all duration-300`}
                >
                  {isLoading === pkg.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Buy Now
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            Secure Payment via Razorpay
          </CardTitle>
          <p className="text-green-700 text-sm mt-2">
            🔒 All payments are processed securely through Razorpay, India's
            leading payment gateway
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-4 border-2 border-green-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <IconComponent className="h-6 w-6 text-green-600" />
                  <div>
                    <span className="font-medium text-green-800">
                      {method.name}
                    </span>
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Available via Razorpay
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-green-800">
                Additional Payment Options
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-green-700">
              <span>• Net Banking</span>
              <span>• RTGS/NEFT</span>
              <span>• PayLater</span>
              <span>• International Cards</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Star className="h-6 w-6 text-purple-600" />
            {hasClaimedFree ? "Why Buy More Coins?" : "Why Get Coins?"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-purple-800 mb-3">
                🎮 Premium Games
              </h3>
              <ul className="space-y-2 text-purple-700 text-sm">
                {!hasClaimedFree && (
                  <li>
                    • <strong>Claim 300 free coins above!</strong>
                  </li>
                )}
                <li>• Join high-stakes tournaments</li>
                <li>• Compete for bigger prize pools</li>
                <li>• Access exclusive game modes</li>
                <li>• Play with serious competitors</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-purple-800 mb-3">💰 Earn More</h3>
              <ul className="space-y-2 text-purple-700 text-sm">
                <li>• Higher entry fees = bigger rewards</li>
                <li>• Win back your investment and more</li>
                <li>• Daily tournaments with mega prizes</li>
                <li>• Special bonus events</li>
                {!hasClaimedFree && (
                  <li>
                    • <strong>Start with free coins - no risk!</strong>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">🛡️</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-800 mb-2 text-lg">
                100% Safe & Secure with Razorpay
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <p>
                  🔒 <strong>Bank-level security:</strong> All transactions are
                  processed through Razorpay's PCI DSS compliant infrastructure
                </p>
                <p>
                  ⚡ <strong>Instant credit:</strong> Your coins are
                  automatically added to your account upon successful payment
                </p>
                <p>
                  🇮🇳 <strong>Made for India:</strong> Supports all major Indian
                  banks, UPI, wallets, and international cards
                </p>
                <p>
                  📱 <strong>Mobile optimized:</strong> Seamless payment
                  experience on all devices
                </p>
                <p>
                  🏆 <strong>Trusted by millions:</strong> Razorpay processes
                  billions of transactions for top Indian companies
                </p>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <span className="font-medium">Powered by</span>
                  <span className="px-2 py-1 bg-blue-600 text-white rounded font-bold">
                    Razorpay
                  </span>
                  <span>•</span>
                  <span>RBI Authorized Payment Aggregator</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
