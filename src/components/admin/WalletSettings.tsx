import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Wallet, 
  Settings, 
  ArrowUpDown, 
  Coins, 
  Plus, 
  Trash2,
  Save,
  RefreshCw
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface WalletSettingsProps {
  adminUser: Tables<"admin_users">;
}

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus: number;
}

export const WalletSettings = ({ adminUser }: WalletSettingsProps) => {
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(true);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [coinRate, setCoinRate] = useState("0.1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWalletSettings();
  }, []);

  const fetchWalletSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings" as any)
        .select("*")
        .in("setting_key", ["withdrawal_enabled", "top_up_packages", "coin_to_currency_rate"]);

      if (error) throw error;

      (data as any[]).forEach((setting: any) => {
        switch (setting.setting_key) {
          case "withdrawal_enabled":
            setWithdrawalEnabled(setting.setting_value === "true" || setting.setting_value === true);
            break;
          case "top_up_packages":
            const packages = Array.isArray(setting.setting_value) 
              ? setting.setting_value as CoinPackage[]
              : JSON.parse(setting.setting_value as string) as CoinPackage[];
            setCoinPackages(packages);
            break;
          case "coin_to_currency_rate":
            setCoinRate(setting.setting_value as string);
            break;
        }
      });
    } catch (error) {
      console.error("Error fetching wallet settings:", error);
      toast.error("Failed to load wallet settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Update withdrawal enabled setting
      const { error: withdrawalError } = await supabase
        .from("admin_settings" as any)
        .update({ setting_value: withdrawalEnabled.toString() } as any)
        .eq("setting_key", "withdrawal_enabled");

      if (withdrawalError) throw withdrawalError;

      // Update coin packages
      const { error: packagesError } = await supabase
        .from("admin_settings" as any)
        .update({ setting_value: JSON.stringify(coinPackages) } as any)
        .eq("setting_key", "top_up_packages");

      if (packagesError) throw packagesError;

      // Update coin rate
      const { error: rateError } = await supabase
        .from("admin_settings" as any)
        .update({ setting_value: coinRate } as any)
        .eq("setting_key", "coin_to_currency_rate");

      if (rateError) throw rateError;

      toast.success("✅ Wallet settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save wallet settings");
    } finally {
      setSaving(false);
    }
  };

  const addCoinPackage = () => {
    const newPackage: CoinPackage = {
      id: `coins_${Date.now()}`,
      name: "New Package",
      coins: 100,
      price: 10,
      bonus: 0,
    };
    setCoinPackages([...coinPackages, newPackage]);
  };

  const updateCoinPackage = (index: number, field: keyof CoinPackage, value: string | number) => {
    const updated = [...coinPackages];
    updated[index] = { ...updated[index], [field]: value };
    setCoinPackages(updated);
  };

  const removeCoinPackage = (index: number) => {
    setCoinPackages(coinPackages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <Card className="bg-card border border-border rounded-2xl">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallet settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Withdrawal Controls */}
      <Card className="bg-card border border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Withdrawal Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border">
            <div>
              <h3 className="font-semibold text-foreground">Enable Withdrawals</h3>
              <p className="text-sm text-muted-foreground">
                Allow users to withdraw funds from their wallet
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={withdrawalEnabled ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                {withdrawalEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Switch
                checked={withdrawalEnabled}
                onCheckedChange={setWithdrawalEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coin Packages Management */}
      <Card className="bg-card border border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              Coin Packages
            </div>
            <Button onClick={addCoinPackage} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Package
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {coinPackages.map((pkg, index) => (
              <div key={pkg.id} className="p-4 bg-muted/20 rounded-xl border border-border">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div>
                    <Label htmlFor={`name-${index}`}>Package Name</Label>
                    <Input
                      id={`name-${index}`}
                      value={pkg.name}
                      onChange={(e) => updateCoinPackage(index, "name", e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`coins-${index}`}>Coins</Label>
                    <Input
                      id={`coins-${index}`}
                      type="number"
                      value={pkg.coins}
                      onChange={(e) => updateCoinPackage(index, "coins", parseInt(e.target.value) || 0)}
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`price-${index}`}>Price (₹)</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      value={pkg.price}
                      onChange={(e) => updateCoinPackage(index, "price", parseFloat(e.target.value) || 0)}
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`bonus-${index}`}>Bonus Coins</Label>
                    <Input
                      id={`bonus-${index}`}
                      type="number"
                      value={pkg.bonus}
                      onChange={(e) => updateCoinPackage(index, "bonus", parseInt(e.target.value) || 0)}
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <Label>Total Coins</Label>
                    <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border">
                      {pkg.coins + pkg.bonus}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => removeCoinPackage(index)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coin Exchange Rate */}
      <Card className="bg-card border border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Exchange Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coin-rate">Coin to Currency Rate</Label>
              <Input
                id="coin-rate"
                type="number"
                step="0.01"
                value={coinRate}
                onChange={(e) => setCoinRate(e.target.value)}
                className="bg-background border-border"
                placeholder="0.1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                1 coin = ₹{coinRate} (used for coin-to-currency conversions)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="min-w-32">
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};