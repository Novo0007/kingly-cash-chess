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
  Crown,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { runFullDiagnostic } from "@/utils/connectionTest";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  const { currentTheme } = useTheme();

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
              console.error(
                "Error processing wallet update:",
                error instanceof Error ? error.message : String(error),
              );
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
      console.error(
        "Error setting up wallet subscription:",
        error instanceof Error ? error.message : String(error),
      );
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
        console.error(
          "Error cleaning up subscription:",
          error instanceof Error ? error.message : String(error),
        );
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
        console.error("Auth error:", {
          message: userError.message,
          code: userError.code,
          details: (userError as any).details, // Type assertion for non-standard property
        });

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
          console.error("Profile fetch error:", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
          });
        } else {
          setUserProfile(profile);
        }
      } catch (profileErr) {
        console.error(
          "Profile fetch failed:",
          profileErr instanceof Error ? profileErr.message : String(profileErr),
        );
      }

      // Fetch wallet data with error handling
      try {
        const { data: walletData, error: walletError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (walletError && walletError.code !== "PGRST116") {
          console.error("Wallet fetch error:", {
            message: walletError.message,
            code: walletError.code,
            details: walletError.details,
            hint: walletError.hint,
          });
        } else if (walletData) {
          setWallet(walletData);
          setCoinsBalance(Number(walletData.balance) || 0);
        }
      } catch (walletErr) {
        console.error(
          "Wallet fetch failed:",
          walletErr instanceof Error ? walletErr.message : String(walletErr),
        );
        // Set default values if wallet fetch fails
        setCoinsBalance(0);
      }
    } catch (error) {
      console.error(
        "Error fetching user data:",
        error instanceof Error ? error.message : String(error),
      );

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
      console.error(
        "Error signing out:",
        error instanceof Error ? error.message : String(error),
      );
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
      console.error(
        "Diagnostic error:",
        error instanceof Error ? error.message : String(error),
      );
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
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md border-b ${
        currentTheme.id === "dreampixels"
          ? "bg-gradient-to-r from-purple-50/90 to-pink-50/90 border-purple-200/40"
          : `bg-gradient-to-r ${currentTheme.gradients.primary}/10 via-background/80 to-${currentTheme.gradients.secondary}/10 border-primary/20`
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 bg-gradient-to-br ${currentTheme.gradients.primary} rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200`}
            >
              <span className="text-white font-bold text-sm">
                {currentTheme.preview}
              </span>
            </div>
            <h1
              className={`text-lg font-bold bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent hidden sm:block`}
            >
              {currentTheme.name} Games
            </h1>
          </div>

          {/* Right: Coins, Add Money, Profile, Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Coins Display */}
            <div
              className={`flex items-center space-x-2 rounded-full px-3 py-1.5 backdrop-blur-sm transition-all duration-300 ${
                isOnline
                  ? `bg-gradient-to-r ${currentTheme.gradients.accent}/10 border border-primary/20 shadow-sm`
                  : "bg-gradient-to-r from-gray-500/10 to-gray-500/10 border border-gray-500/20"
              }`}
            >
              <Coins
                className={`w-4 h-4 ${isOnline ? "text-primary" : "text-gray-500"}`}
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
              className={`bg-gradient-to-r ${currentTheme.gradients.secondary} hover:opacity-90 text-white border-0 h-8 px-3 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Add Money</span>
              <span className="sm:hidden">Add</span>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar */}
            <Button
              onClick={handleNavigateToProfile}
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8 rounded-full hover:bg-primary/10 transition-colors duration-200"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={userProfile?.avatar_url}
                  alt={userProfile?.full_name || "Profile"}
                />
                <AvatarFallback
                  className={`text-xs bg-gradient-to-br ${currentTheme.gradients.primary} text-white`}
                >
                  {getInitials(userProfile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </Button>

            {/* Three Dots Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors duration-200"
                >
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

                <DropdownMenuItem onClick={() => onViewChange?.("tournaments")}>
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Tournaments</span>
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
