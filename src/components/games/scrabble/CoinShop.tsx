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

  const handlePurchase = async (packageData: (typeof coinPackages)[0]) => {
    setIsLoading(packageData.id);

    try {
      // In a real app, you would integrate with a payment gateway here
      // For demo purposes, we'll simulate a successful purchase

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await purchaseCoins(userId, {
        coins: packageData.coins,
        price: packageData.price,
        bonus: packageData.bonus,
      });

      if (result.success) {
        toast.success(
          `Successfully purchased ${packageData.coins + packageData.bonus} coins!`,
        );
        onPurchaseComplete();
      } else {
        toast.error(result.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Purchase failed. Please try again.");
    } finally {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            Secure Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={method.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg ${
                    method.available
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <IconComponent
                    className={`h-6 w-6 ${method.available ? "text-green-600" : "text-gray-400"}`}
                  />
                  <div>
                    <span
                      className={`font-medium ${method.available ? "text-green-800" : "text-gray-500"}`}
                    >
                      {method.name}
                    </span>
                    <div className="text-xs text-gray-600">
                      {method.available ? "✓ Available" : "Coming Soon"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Star className="h-6 w-6 text-purple-600" />
            Why Buy Coins?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-purple-800 mb-3">
                🎮 Premium Games
              </h3>
              <ul className="space-y-2 text-purple-700 text-sm">
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
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">🔒</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Safe & Secure</h4>
              <p className="text-sm text-gray-600">
                All transactions are encrypted and secure. We use
                industry-standard payment processing to protect your financial
                information. Your coins are immediately credited to your
                account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
