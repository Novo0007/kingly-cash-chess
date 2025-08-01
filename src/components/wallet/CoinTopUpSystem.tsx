import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coins, Star, Zap, Crown, Gift } from "lucide-react";

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

interface CoinTopUpSystemProps {
  userCoins: number;
  onCoinsUpdated: (newBalance: number) => void;
}

export const CoinTopUpSystem = ({ userCoins, onCoinsUpdated }: CoinTopUpSystemProps) => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    fetchCoinPackages();
  }, []);

  const fetchCoinPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings" as any)
        .select("setting_value")
        .eq("setting_key", "top_up_packages")
        .single();

      if (error) throw error;

      const packagesData = Array.isArray((data as any).setting_value) 
        ? (data as any).setting_value as CoinPackage[]
        : JSON.parse((data as any).setting_value as string) as CoinPackage[];

      // Mark the middle package as popular
      const packagesWithPopular = packagesData.map((pkg, index) => ({
        ...pkg,
        popular: index === 1 // Second package is popular
      }));

      setPackages(packagesWithPopular);
    } catch (error) {
      console.error("Error fetching coin packages:", error);
      toast.error("Failed to load coin packages");
    } finally {
      setLoadingPackages(false);
    }
  };

  const handlePurchase = async (pkg: CoinPackage) => {
    setLoading(true);

    try {
      // Initialize Razorpay payment
      const totalCoins = pkg.coins + pkg.bonus;
      const options = {
        key: "rzp_live_uEV76dlTQYpxEl",
        amount: pkg.price * 100,
        currency: "INR",
        name: "Gaming Coins",
        description: `Purchase ${pkg.name} (${totalCoins} coins total)`,
        image: "/favicon.ico",
        handler: async function (response: any) {
          try {
            console.log("Payment successful:", response.razorpay_payment_id);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              toast.error("User not found");
              return;
            }

            // Purchase coins using the database function
            const { data, error } = await supabase.rpc("purchase_coins" as any, {
              target_user_id: user.id,
              package_id_param: pkg.id,
              coins_amount_param: totalCoins,
              currency_amount_param: pkg.price,
              payment_reference_param: response.razorpay_payment_id,
            });

            if (error) {
              console.error("Coin purchase error:", error);
              toast.error("Failed to process coin purchase");
              return;
            }

            const result = data as any;
            if (result.success) {
              toast.success(`🪙 Successfully purchased ${totalCoins} coins!`);
              onCoinsUpdated(result.new_balance);
            } else {
              toast.error("Purchase failed. Please contact support.");
            }

          } catch (error) {
            console.error("Payment confirmation error:", error);
            toast.error("Payment confirmation failed. Please contact support.");
          }
        },
        prefill: {
          name: "Gaming Player",
          email: "player@game.com",
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
        toast.error(`Payment failed: ${response.error?.description || "Please try again."}`);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  const getPackageIcon = (index: number) => {
    const icons = [Coins, Star, Zap, Crown];
    const IconComponent = icons[index] || Coins;
    return <IconComponent className="h-6 w-6" />;
  };

  const getPackageGradient = (index: number, popular: boolean) => {
    if (popular) {
      return "bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-400";
    }
    const gradients = [
      "bg-gradient-to-br from-blue-500 to-cyan-600 border-blue-400",
      "bg-gradient-to-br from-purple-500 to-pink-600 border-purple-400", 
      "bg-gradient-to-br from-green-500 to-emerald-600 border-green-400",
      "bg-gradient-to-br from-red-500 to-rose-600 border-red-400"
    ];
    return gradients[index] || gradients[0];
  };

  if (loadingPackages) {
    return (
      <Card className="bg-card border border-border rounded-2xl">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading coin packages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border rounded-2xl">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Top-Up Coins
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="h-4 w-4 text-yellow-500" />
          Current Balance: <span className="font-semibold text-yellow-500">{userCoins} coins</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${getPackageGradient(index, pkg.popular || false)}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-yellow-900 font-bold px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    POPULAR
                  </Badge>
                </div>
              )}
              
              <div className="text-center text-white">
                <div className="flex justify-center mb-2">
                  {getPackageIcon(index)}
                </div>
                
                <h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-center gap-1">
                    <Coins className="h-4 w-4" />
                    <span className="font-semibold">{pkg.coins} coins</span>
                  </div>
                  
                  {pkg.bonus > 0 && (
                    <div className="flex items-center justify-center gap-1 text-yellow-200">
                      <Gift className="h-4 w-4" />
                      <span className="text-sm">+{pkg.bonus} bonus!</span>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-90">
                    Total: {pkg.coins + pkg.bonus} coins
                  </div>
                </div>
                
                <div className="text-2xl font-bold mb-3">
                  ₹{pkg.price}
                </div>
                
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading}
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold"
                >
                  {loading ? "Processing..." : "Purchase"}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Tip:</strong> Use coins to purchase hints, unlock premium features, and enhance your gaming experience!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};