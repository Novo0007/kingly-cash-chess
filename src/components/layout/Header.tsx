import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Coins,
  Plus,
  MoreVertical,
  User,
  Settings,
  LogOut,
  CreditCard,
  Trophy,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { runFullDiagnostic } from "@/utils/connectionTest";

interface HeaderProps {
  onNavigateToWallet?: () => void;
  onNavigateToProfile?: () => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export const Header = ({
  onNavigateToWallet,
  onNavigateToProfile,
  currentView,
  onViewChange,
}: HeaderProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [coinsBalance, setCoinsBalance] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionRetries, setConnectionRetries] = useState(0);

  useEffect(() => {
    fetchUserData();

    // Monitor browser online/offline status
    const handleOnline = () => {
      console.log("Browser is online, attempting to reconnect...");
      setIsOnline(true);
      setConnectionRetries(0);
      fetchUserData();
    };

    const handleOffline = () => {
      console.log("Browser is offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set up real-time subscriptions for wallet updates with error handling
    let walletChannel: any = null;

    try {
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
              if (payload.new) {
                setWallet(payload.new as Tables<"wallets">);
                setCoinsBalance(Number(payload.new.balance) || 0);
                setIsOnline(true); // Mark as online if we receive updates
              }
            } catch (error) {
              console.error("Error processing wallet update:", error);
            }
          },
        )
        .subscribe((status) => {
          console.log("Header wallet subscription status:", status);
          if (status === "SUBSCRIBED") {
            setIsOnline(true);
          } else if (status === "CHANNEL_ERROR") {
            console.error("Failed to subscribe to wallet updates");
            setIsOnline(false);
          }
        });
    } catch (error) {
      console.error("Error setting up wallet subscription:", error);
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      try {
        if (walletChannel) {
          supabase.removeChannel(walletChannel);
        }
      } catch (error) {
        console.error("Error cleaning up subscription:", error);
      }
    };
  }, []);

  const fetchUserData = async (retryCount = 0) => {
    try {
      // Add timeout and retry logic for Supabase connection
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError);

        // If it's a network error and we haven't retried too many times
        if (userError.message?.includes("Failed to fetch") && retryCount < 3) {
          console.log(`Retrying connection (attempt ${retryCount + 1}/3)...`);
          setConnectionRetries(retryCount + 1);
          setIsOnline(false);

          // Wait before retrying
          setTimeout(
            () => {
              fetchUserData(retryCount + 1);
            },
            2000 * (retryCount + 1),
          ); // Exponential backoff

          return;
        }

        // Mark as offline if still failing
        setIsOnline(false);
        return;
      }

      // Success - mark as online
      setIsOnline(true);
      setConnectionRetries(0);

      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      // Fetch user profile with error handling
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        } else {
          setUserProfile(profile);
        }
      } catch (profileErr) {
        console.error("Profile fetch failed:", profileErr);
      }

      // Fetch wallet data with error handling
      try {
        const { data: walletData, error: walletError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (walletError && walletError.code !== "PGRST116") {
          console.error("Wallet fetch error:", walletError);
        } else if (walletData) {
          setWallet(walletData);
          setCoinsBalance(Number(walletData.balance) || 0);
        }
      } catch (walletErr) {
        console.error("Wallet fetch failed:", walletErr);
        // Set default values if wallet fetch fails
        setCoinsBalance(0);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Check if it's a network error
      if (
        error instanceof TypeError &&
        error.message?.includes("Failed to fetch")
      ) {
        setIsOnline(false);

        // Retry if we haven't exceeded retry limit
        if (retryCount < 3) {
          console.log(
            `Network error, retrying... (attempt ${retryCount + 1}/3)`,
          );
          setConnectionRetries(retryCount + 1);
          setTimeout(
            () => {
              fetchUserData(retryCount + 1);
            },
            2000 * (retryCount + 1),
          );
          return;
        }
      }

      // Set fallback values
      setCoinsBalance(0);
      setUserProfile(null);
      setWallet(null);
      setIsOnline(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully!");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  const handleDiagnostic = async () => {
    toast.info("Running connection diagnostic...");
    try {
      const results = await runFullDiagnostic();

      if (results.supabaseTest.connected) {
        toast.success("✅ All connections working properly!");
        setIsOnline(true);
        setConnectionRetries(0);
      } else {
        toast.error(
          `❌ Connection issues detected: ${results.supabaseTest.error}`,
        );
        setIsOnline(false);
      }
    } catch (error) {
      toast.error("Diagnostic failed to run");
      console.error("Diagnostic error:", error);
    }
  };

  const handleManualRefresh = async () => {
    toast.info("Refreshing connection...");
    setConnectionRetries(0);
    await fetchUserData();
  };

  const handleNavigateToWallet = () => {
    if (onNavigateToWallet) {
      onNavigateToWallet();
    } else if (onViewChange) {
      onViewChange("wallet");
    }
  };

  const handleNavigateToProfile = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else if (onViewChange) {
      onViewChange("profile");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NG</span>
            </div>
            <h1 className="text-lg font-bold text-foreground hidden sm:block">
              NNC Games
            </h1>
          </div>

          {/* Right: Coins, Add Money, Profile, Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Coins Display */}
            <div
              className={`flex items-center space-x-2 bg-gradient-to-r rounded-full px-3 py-1.5 ${
                isOnline
                  ? "from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
                  : "from-gray-500/10 to-gray-500/10 border border-gray-500/20"
              }`}
            >
              <Coins
                className={`w-4 h-4 ${isOnline ? "text-yellow-500" : "text-gray-500"}`}
              />
              <span className="text-sm font-semibold text-foreground">
                {isOnline ? `₹${coinsBalance.toFixed(2)}` : "Offline"}
              </span>
              {!isOnline && connectionRetries > 0 && (
                <div
                  className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                  title={`Reconnecting... (${connectionRetries}/3)`}
                />
              )}
            </div>

            {/* Add Money Button */}
            <Button
              onClick={handleNavigateToWallet}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 h-8 px-3"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Add Money</span>
              <span className="sm:hidden">Add</span>
            </Button>

            {/* Profile Avatar */}
            <Button
              onClick={handleNavigateToProfile}
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8 rounded-full hover:bg-muted"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={userProfile?.avatar_url}
                  alt={userProfile?.full_name || "Profile"}
                />
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials(userProfile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </Button>

            {/* Three Dots Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userProfile?.avatar_url}
                      alt={userProfile?.full_name || "Profile"}
                    />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(userProfile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.full_name || "Player"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      ₹{coinsBalance.toFixed(2)} balance
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleNavigateToProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleNavigateToWallet}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Wallet</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onViewChange?.("games")}>
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Games</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onViewChange?.("friends")}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Friends</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleManualRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Refresh Data</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleDiagnostic}>
                  {isOnline ? (
                    <Wifi className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  <span>Connection Test</span>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
