import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  User,
  Trophy,
  Target,
  Crown,
  Edit2,
  Save,
  X,
  RefreshCw,
  LogOut,
  Star,
  Gamepad2,
  Settings,
  Volume2,
  Bell,
  Shield,
  Moon,
  Palette,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import type { Tables } from "@/integrations/supabase/types";

export const ProfileSystem = () => {
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
  });
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    gameNotifications: true,
    darkMode: true,
    reducedAnimations: false,
    autoRefresh: true,
  });

  const { isMobile, isTablet } = useDeviceType();

  useEffect(() => {
    fetchProfile();
    fetchWallet();

    // Auto-refresh every 15 seconds to catch updates
    const autoRefreshInterval = setInterval(() => {
      fetchProfile();
      fetchWallet();
    }, 15000);

    // Subscribe to real-time changes
    const profileSubscription = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          console.log("Profile updated, refreshing...");
          fetchProfile();
        },
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(profileSubscription);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error loading profile");
      } else {
        setProfile(data);
        setFormData({
          username: data.username || "",
          full_name: data.full_name || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching wallet:", error);
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchWallet()]);
    setRefreshing(false);
    toast.success("Profile data refreshed!");
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: formData.full_name,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
      });
    }
    setEditing(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Signed out successfully!");
      // The auth state change will be handled by the parent component
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const getWinRate = () => {
    if (!profile || !profile.games_played || profile.games_played === 0)
      return 0;
    return Math.round((profile.games_won / profile.games_played) * 100);
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 2000)
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (rating >= 1600)
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (rating >= 1200)
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getRatingTitle = (rating: number) => {
    if (rating >= 2000) return "Master";
    if (rating >= 1600) return "Expert";
    if (rating >= 1200) return "Intermediate";
    return "Beginner";
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div
              className={`w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full mx-auto ${!isMobile ? "animate-spin" : ""}`}
            ></div>
            <div className="text-white text-lg font-semibold">
              Loading profile...
            </div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  if (!profile) {
    return (
      <MobileContainer>
        <div className="text-center text-white space-y-4">
          <User className="h-16 w-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-bold">Profile not found</h2>
          <p className="text-gray-400">
            Unable to load your profile information.
          </p>
        </div>
      </MobileContainer>
    );
  }

  // Mobile-optimized styles
  const headerGradient = isMobile
    ? "bg-slate-800 border border-slate-600"
    : "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-slate-600 shadow-lg";

  const cardGradient = isMobile
    ? "bg-slate-800/80 border border-slate-600"
    : "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 shadow-lg";

  const animationClass = isMobile
    ? ""
    : "transition-all duration-300 hover:scale-105";

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        {/* Profile Header */}
        <Card className={`${headerGradient} ${animationClass}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center justify-between text-sm md:text-base">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <Gamepad2 className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                  {!isMobile && (
                    <Star className="h-2 w-2 text-yellow-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <span className="font-bold text-lg md:text-xl">
                  Player Profile
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  onClick={handleRefresh}
                  variant="ghost"
                  size="sm"
                  disabled={refreshing}
                  className="text-blue-400 hover:bg-slate-700/50 h-8 w-8 p-0"
                >
                  <RefreshCw
                    className={`h-3 w-3 md:h-4 md:w-4 ${refreshing && !isMobile ? "animate-spin" : ""}`}
                  />
                </Button>
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:bg-slate-700/50 h-8 w-8 p-0"
                  >
                    <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      onClick={handleSave}
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:bg-slate-700/50 h-8 w-8 p-0"
                    >
                      <Save className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-slate-700/50 h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-slate-700/50 h-8 px-2 md:px-3"
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                  {!isMobile && <span className="ml-1">Sign Out</span>}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {editing ? (
              <div className="space-y-3 md:space-y-4">
                <div>
                  <Label
                    htmlFor="username"
                    className="text-white font-semibold text-sm"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="full_name"
                    className="text-white font-semibold text-sm"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {profile.username}
                  </h3>
                  {profile.full_name && (
                    <p className="text-slate-300 font-medium text-sm md:text-base">
                      {profile.full_name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getRatingBadgeColor(profile.chess_rating || 1200)} font-semibold text-xs md:text-sm px-2 py-1`}
                  >
                    <Crown className="h-3 w-3 mr-1 text-yellow-400" />
                    {profile.chess_rating || 1200} -{" "}
                    {getRatingTitle(profile.chess_rating || 1200)}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Card
            className={`${cardGradient} ${animationClass} border-green-600/30`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 flex items-center gap-2 font-semibold text-sm md:text-base">
                <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                Games Won
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {profile.games_won || 0}
              </div>
              <p className="text-xs md:text-sm text-green-300">
                Win Rate: {getWinRate()}%
              </p>
            </CardContent>
          </Card>

          <Card
            className={`${cardGradient} ${animationClass} border-blue-600/30`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 flex items-center gap-2 font-semibold text-sm md:text-base">
                <Target className="h-4 w-4 md:h-5 md:w-5" />
                Games Played
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-white">
                {profile.games_played || 0}
              </div>
              <p className="text-xs md:text-sm text-blue-300">Total matches</p>
            </CardContent>
          </Card>

          <Card
            className={`${cardGradient} ${animationClass} border-yellow-600/30 md:col-span-1 col-span-1`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-400 flex items-center gap-2 font-semibold text-sm md:text-base">
                <Star className="h-4 w-4 md:h-5 md:w-5" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-white">
                ₹{(profile.total_earnings || 0).toFixed(2)}
              </div>
              <p className="text-xs md:text-sm text-yellow-300">
                All-time winnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Summary */}
        {wallet && (
          <>
            <Separator className="bg-slate-600/50" />
            <Card
              className={`${cardGradient} ${animationClass} border-purple-600/30`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-400 flex items-center gap-2 font-semibold text-base md:text-lg">
                  <div className="relative">
                    <Trophy className="h-5 w-5 md:h-6 md:w-6" />
                    {!isMobile && (
                      <Star className="h-2 w-2 text-yellow-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  Current Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  ₹{wallet.balance.toFixed(2)}
                </div>
                {wallet.locked_balance > 0 && (
                  <p className="text-sm md:text-base text-purple-300 font-medium">
                    Locked Balance: ₹{wallet.locked_balance.toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MobileContainer>
  );
};
