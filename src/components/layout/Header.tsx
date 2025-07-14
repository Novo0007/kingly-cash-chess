import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Coins,
  Settings,
  User,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { runFullDiagnostic } from "@/utils/connectionTest";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  onPageChange: (page: string) => void;
  currentUser: any;
  userProfile: any;
  isAdmin: boolean;
  showHeader: boolean;
  showBottomNav: boolean;
}

export const Header = ({
  onPageChange,
  currentUser,
  userProfile,
  isAdmin,
}: HeaderProps) => {
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [coinsBalance, setCoinsBalance] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "connecting" | "connected" | "error" | "disconnected"
  >("disconnected");
  const { currentTheme } = useTheme();

  useEffect(() => {
    const handleOnline = () => {
      console.log("Network came back online");
      setIsOnline(true);
      setConnectionRetries(0);
    };

    const handleOffline = () => {
      console.log("Network went offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set up real-time subscriptions for wallet updates with enhanced error handling
    let walletChannel: any = null;

    const setupSubscription = async () => {
      try {
        setSubscriptionStatus("connecting");
        console.log("Setting up wallet subscription in Header...");

        walletChannel = supabase
          .channel("header_wallet_updates")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "wallets",
            },
            (payload) => {
              try {
                console.log("Header received wallet update:", payload);
                if (payload.new) {
                  setWallet(payload.new as Tables<"wallets">);
                  setCoinsBalance(Number(payload.new.balance) || 0);
                  setIsOnline(true);
                  setSubscriptionStatus("connected");
                }
              } catch (error) {
                console.error("Error processing wallet update:", error);
              }
            },
          )
          .subscribe((status) => {
            console.log("Header wallet subscription status:", status);
            switch (status) {
              case "SUBSCRIBED":
                setIsOnline(true);
                setSubscriptionStatus("connected");
                setConnectionRetries(0);
                break;
              case "CHANNEL_ERROR":
              case "TIMED_OUT":
              case "CLOSED":
                console.error("Failed to subscribe to wallet updates:", status);
                setSubscriptionStatus("error");
                if (connectionRetries < 3) {
                  console.log(
                    `Retrying subscription in 2 seconds (attempt ${connectionRetries + 1}/3)`,
                  );
                  setTimeout(setupSubscription, 2000);
                  setConnectionRetries((prev) => prev + 1);
                } else {
                  setIsOnline(false);
                }
                break;
              case "CONNECTING":
                setSubscriptionStatus("connecting");
                break;
            }
          });
      } catch (error) {
        console.error("Error setting up wallet subscription:", error);
        setSubscriptionStatus("error");
        setIsOnline(false);
      }
    };

    // Initial subscription setup
    setupSubscription();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      try {
        if (walletChannel) {
          console.log("Cleaning up wallet subscription...");
          supabase.removeChannel(walletChannel);
        }
      } catch (error) {
        console.error("Error cleaning up subscription:", error);
      }
    };
  }, [connectionRetries]);

  const fetchUserData = async (retryCount = 0) => {
    if (!currentUser) {
      console.log("No current user for wallet fetch");
      return;
    }

    try {
      console.log("Fetching wallet data for user:", currentUser.id);

      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (walletError) {
        if (walletError.code === "PGRST116") {
          console.log("Wallet not found, creating one...");
          await createWallet(currentUser.id);
        } else {
          throw walletError;
        }
      } else {
        console.log("Wallet data fetched:", walletData);
        setWallet(walletData);
        setCoinsBalance(Number(walletData.balance) || 0);
      }
    } catch (error) {
      console.error(`Wallet fetch error (attempt ${retryCount + 1}):`, error);

      if (retryCount < 2) {
        console.log(`Retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(
          () => fetchUserData(retryCount + 1),
          (retryCount + 1) * 2000,
        );
      } else {
        console.error("Max retries reached for wallet fetch");
      }
    }
  };

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

      if (error) throw error;

      console.log("Wallet created successfully:", data);
      setWallet(data);
      setCoinsBalance(0);
      toast.success("Welcome! Your wallet has been created.");
    } catch (error) {
      console.error("Wallet creation error:", error);
      toast.error("Failed to create wallet. Please try again.");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Successfully signed out!");
      setWallet(null);
      setCoinsBalance(0);
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out");
    }
  };

  const handleDiagnostic = async () => {
    toast.info("Running connection diagnostic...", { duration: 2000 });
    try {
      const results = await runFullDiagnostic();
      console.log("Diagnostic results:", results);

      if (results.supabase?.success && results.auth?.success) {
        toast.success("✅ All connections working properly!");
        setIsOnline(true);
        setConnectionRetries(0);
      } else {
        const errors = [];
        if (!results.supabase?.success) {
          errors.push(
            `Supabase: ${results.supabase?.error || "Unknown error"}`,
          );
        }
        if (!results.auth?.success) {
          errors.push(`Auth: ${results.auth?.error || "Unknown error"}`);
        }
        toast.error(`❌ Connection issues: ${errors.join(", ")}`, {
          duration: 6000,
        });
        setIsOnline(false);
      }
    } catch (error) {
      console.error("Diagnostic error:", error);
      toast.error("Diagnostic failed to run");
    }
  };

  const getConnectionStatusIcon = () => {
    switch (subscriptionStatus) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (subscriptionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Disconnected";
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm ${
        currentTheme.id === "dreampixels" ||
        currentTheme.id === "sakurablossom" ||
        currentTheme.id === "loveheart"
          ? "border-pink-200/30 bg-gradient-to-r from-background/90 to-card/90"
          : "border-border"
      }`}
    >
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left section - Logo/Title */}
        <div className="flex items-center space-x-2">
          <Crown
            className={`h-6 w-6 ${
              currentTheme.id === "dreampixels"
                ? "text-pink-500"
                : currentTheme.id === "sakurablossom"
                  ? "text-pink-400"
                  : currentTheme.id === "loveheart"
                    ? "text-red-500"
                    : "text-primary"
            }`}
          />
          <span className="font-semibold text-lg">Game Hub</span>

          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-1 ml-4">
            {getConnectionStatusIcon()}
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {getConnectionStatusText()}
            </span>
          </div>
        </div>

        {/* Right section - User menu */}
        <div className="flex items-center space-x-3">
          {/* Wallet Balance */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange("wallet")}
            className={`flex items-center space-x-2 ${
              currentTheme.id === "dreampixels" ||
              currentTheme.id === "sakurablossom" ||
              currentTheme.id === "loveheart"
                ? "border-pink-200/50 hover:bg-pink-50/50"
                : ""
            }`}
          >
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">₹{coinsBalance.toFixed(2)}</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {userProfile?.username?.charAt(0)?.toUpperCase() ||
                      currentUser.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">
                  {userProfile?.username ||
                    currentUser.email?.split("@")[0] ||
                    "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onPageChange("profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPageChange("wallet")}>
                <Coins className="h-4 w-4 mr-2" />
                Wallet
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => onPageChange("admin")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Admin
                  </Badge>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDiagnostic}>
                {isOnline ? (
                  <Wifi className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 mr-2 text-red-500" />
                )}
                Connection Test
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                <User className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
