import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Settings,
  ArrowLeft,
  Zap,
  Star,
  Medal,
  Sparkles,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { SettingsSection } from "./SettingsSection";
import { MobileContainer } from "@/components/layout/MobileContainer";

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
      <MobileContainer className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading profile...</div>
      </MobileContainer>
    );
  }

  if (!profile) {
    return (
      <MobileContainer className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
        <p className="text-gray-400">
          Unable to load your profile information.
        </p>
      </MobileContainer>
    );
  }

  if (showSettings) {
    return <SettingsSection onBack={() => setShowSettings(false)} />;
  }

  return (
    <MobileContainer className="space-y-4 md:space-y-6">
      {/* Mobile Header */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <h1 className="text-2xl font-bold text-white">👤 Profile</h1>
        <Button
          onClick={() => setShowSettings(true)}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800/50"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Header with Advanced Styling */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-yellow-500/20 animate-pulse"></div>

        {/* Glassmorphism Overlay */}
        <Card className="relative backdrop-blur-xl bg-white/10 border-2 border-white/20 shadow-2xl overflow-hidden">
          {/* Floating Particles Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="absolute top-8 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-6 left-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </div>

          <CardHeader className="pb-3 md:pb-4 relative z-10">
            <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                  <User className="relative h-6 w-6 md:h-7 md:w-7 text-yellow-400 drop-shadow-lg" />
                </div>
                <span className="font-black text-lg md:text-xl bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  ✨ Player Profile
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  onClick={handleRefresh}
                  variant="ghost"
                  size="sm"
                  disabled={refreshing}
                  className="relative group text-blue-200 hover:bg-white/20 font-bold p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <RefreshCw
                    className={`relative h-4 w-4 ${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-300"}`}
                  />
                </Button>
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="relative group text-green-200 hover:bg-white/20 font-bold p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Edit2 className="relative h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      onClick={handleSave}
                      variant="ghost"
                      size="sm"
                      className="relative group text-green-200 hover:bg-white/20 font-bold p-2 rounded-xl transition-all duration-300 hover:scale-110"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Save className="relative h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      size="sm"
                      className="relative group text-red-200 hover:bg-white/20 font-bold p-2 rounded-xl transition-all duration-300 hover:scale-110"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <X className="relative h-4 w-4" />
                    </Button>
                  </div>
                )}
                {/* Settings button for desktop */}
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex relative group text-gray-200 hover:bg-white/20 font-bold p-2 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Settings className="relative h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="relative group text-red-200 hover:bg-red-500/20 font-bold p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <LogOut className="relative h-4 w-4" />
                  <span className="hidden md:inline ml-1">Sign Out</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 relative z-10">
            {editing ? (
              <div className="space-y-4 md:space-y-6">
                <div className="relative group">
                  <Label
                    htmlFor="username"
                    className="text-white font-bold text-sm md:text-base flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    Username
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bold placeholder:text-white/50 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                <div className="relative group">
                  <Label
                    htmlFor="full_name"
                    className="text-white font-bold text-sm md:text-base flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-purple-400" />
                    Full Name
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bold placeholder:text-white/50 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-transparent to-cyan-400/20 rounded-2xl blur-xl animate-pulse"></div>
                  <div className="relative backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-md opacity-60"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-2xl">
                          🎮
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                          {profile.username}
                        </h3>
                        {profile.full_name && (
                          <p className="text-blue-200 font-bold text-base md:text-lg opacity-80">
                            {profile.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Badge
                      className={`relative ${getRatingBadgeColor(profile.chess_rating || 1200)} font-bold text-base md:text-xl px-6 md:px-8 py-3 md:py-4 rounded-2xl backdrop-blur-sm border-2 shadow-2xl transform hover:scale-105 transition-all duration-300`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <Crown className="h-5 w-5 md:h-6 md:w-6 text-yellow-400 animate-pulse" />
                        <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-300" />
                        <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                          {profile.chess_rating || 1200}
                        </span>
                        <Medal className="h-4 w-4 md:h-5 md:w-5 text-yellow-300" />
                        <span className="text-white/90">
                          {getRatingTitle(profile.chess_rating || 1200)}
                        </span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics Grid with Advanced Styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Games Won Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Card className="relative backdrop-blur-xl bg-gradient-to-br from-green-600/80 to-emerald-700/80 border-2 border-green-400/50 shadow-2xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-green-100 flex items-center gap-3 font-black text-lg md:text-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-80 animate-pulse"></div>
                  <Trophy className="relative h-6 w-6 md:h-7 md:w-7 text-yellow-400 drop-shadow-lg" />
                </div>
                <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  🏆 Games Won
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  {profile.games_won || 0}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-green-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(getWinRate(), 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-green-200 font-bold mt-2">
                    📊 Win Rate: {getWinRate()}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Games Played Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Card className="relative backdrop-blur-xl bg-gradient-to-br from-blue-600/80 to-cyan-700/80 border-2 border-blue-400/50 shadow-2xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-28 h-28 bg-white rounded-full -translate-y-14 -translate-x-14"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-white rounded-full translate-y-10 translate-x-10"></div>
            </div>

            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-blue-100 flex items-center gap-3 font-black text-lg md:text-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-80 animate-pulse"></div>
                  <Target className="relative h-6 w-6 md:h-7 md:w-7 text-cyan-400 drop-shadow-lg" />
                </div>
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  🎯 Games Played
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {profile.games_played || 0}
                </div>
                <div className="flex flex-col gap-1">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <Star className="h-4 w-4 text-blue-300" />
                  <Target className="h-4 w-4 text-cyan-300" />
                </div>
              </div>
              <p className="text-sm text-blue-200 font-bold mt-3">
                📈 Total matches
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Total Earnings Card */}
        <div className="relative group md:col-span-1">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Card className="relative backdrop-blur-xl bg-gradient-to-br from-yellow-600/80 to-orange-700/80 border-2 border-yellow-400/50 shadow-2xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white rounded-full -translate-y-18 translate-x-18"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
            </div>

            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-yellow-100 flex items-center gap-3 font-black text-lg md:text-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-80 animate-pulse"></div>
                  <Crown className="relative h-6 w-6 md:h-7 md:w-7 text-yellow-400 drop-shadow-lg" />
                </div>
                <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                  💰 Total Earnings
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-2">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                  ₹{(profile.total_earnings || 0).toFixed(2)}
                </div>
                <div className="flex flex-col">
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                  <Medal className="h-4 w-4 text-orange-300 mt-1" />
                </div>
              </div>
              <p className="text-sm text-yellow-200 font-bold mt-3">
                🎊 All-time winnings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wallet Summary with Stunning Design */}
      {wallet && (
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
          <Card className="relative backdrop-blur-xl bg-gradient-to-br from-purple-600/80 via-pink-600/80 to-indigo-700/80 border-2 border-purple-400/50 shadow-2xl rounded-3xl overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-cyan-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              {/* Floating Money Icons */}
              <div
                className="absolute top-4 right-4 text-yellow-400/30 animate-bounce"
                style={{ animationDelay: "0s" }}
              >
                💰
              </div>
              <div
                className="absolute top-8 left-8 text-green-400/30 animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                💎
              </div>
              <div
                className="absolute bottom-6 right-1/3 text-cyan-400/30 animate-bounce"
                style={{ animationDelay: "1s" }}
              >
                ⭐
              </div>
            </div>

            <CardHeader className="pb-4 md:pb-6 relative z-10">
              <CardTitle className="text-white flex items-center gap-3 md:gap-4 font-black text-xl md:text-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-lg opacity-80 animate-pulse"></div>
                  <Trophy className="relative h-7 w-7 md:h-8 md:w-8 text-yellow-400 drop-shadow-2xl" />
                </div>
                <span className="bg-gradient-to-r from-white via-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  💳 Current Wallet Balance
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/50 to-orange-400/50 rounded-2xl blur-xl animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-300 via-yellow-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                      ₹{wallet.balance.toFixed(2)}
                    </div>
                    <div className="flex justify-center gap-2 mt-2">
                      <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                      <Star className="h-4 w-4 text-yellow-300" />
                      <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>

                {wallet.locked_balance > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <p className="text-base md:text-lg text-purple-200 font-bold flex items-center justify-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-400 rounded-full blur-sm opacity-60"></div>
                        <span className="relative">🔒</span>
                      </div>
                      Locked Balance:
                      <span className="text-yellow-300">
                        ₹{wallet.locked_balance.toFixed(2)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Button for Mobile with Stunning Design */}
      <div className="md:hidden relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative backdrop-blur-xl bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-2 border-slate-600/50 shadow-2xl rounded-2xl overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 animate-pulse"></div>

          <CardContent className="p-6 relative z-10">
            <Button
              onClick={() => setShowSettings(true)}
              className="relative w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black py-4 px-6 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 overflow-hidden"
            >
              {/* Button Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full blur-sm opacity-60 group-hover:animate-pulse"></div>
                  <Settings className="relative h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <span className="text-lg bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  ⚙️ Settings & More
                </span>
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
