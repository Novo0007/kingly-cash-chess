import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Menu,
  X,
  Users,
  Wallet,
  LogOut,
  User as UserIcon,
  Gamepad2,
  Star,
  Zap,
  Sparkles,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navbar = ({ currentView, onViewChange }: NavbarProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [wallet, setWallet] = useState<Tables<"wallets"> | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchWallet(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchProfile(user.id);
      fetchWallet(user.id);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const fetchWallet = async (userId: string) => {
    const { data } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();
    setWallet(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: "games", label: "Games", icon: Gamepad2, emoji: "🎮" },
    { id: "friends", label: "Friends", icon: Users, emoji: "👥" },
    { id: "wallet", label: "Wallet", icon: Wallet, emoji: "💰" },
    { id: "profile", label: "Profile", icon: UserIcon, emoji: "👤" },
  ];

  return (
    <nav className="relative">
      {/* Background with Glassmorphism */}
      <div className="absolute inset-0 backdrop-blur-2xl bg-slate-900/90 border-b-2 border-purple-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/15 to-cyan-600/10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                <Crown className="h-7 w-7 md:h-8 md:w-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                NNC GAMES
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-gray-400 font-medium">
                  Chess Arena
                </span>
                <Star className="h-3 w-3 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentView === item.id ||
                (item.id === "games" &&
                  (currentView === "lobby" ||
                    currentView === "game" ||
                    currentView === "dots-and-boxes" ||
                    currentView === "dots-and-boxes-lobby" ||
                    currentView === "online-dots-and-boxes"));

              return (
                <div key={item.id} className="relative group">
                  {isActive && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur-lg opacity-60 animate-pulse"></div>
                  )}
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-purple-400/50 shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm"
                    }`}
                  >
                    <div className="relative">
                      {isActive && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-60"></div>
                      )}
                      <Icon
                        className={`relative h-5 w-5 transition-all duration-300 ${isActive ? "text-white drop-shadow-lg" : ""}`}
                      />
                    </div>
                    <span className="font-bold">{item.label}</span>

                    {isActive && (
                      <div className="text-lg animate-bounce">{item.emoji}</div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* User Info & Controls */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden lg:flex items-center gap-4">
                {/* User Profile Card */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-60"></div>
                        <div className="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                          👤
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm flex items-center gap-1">
                          {profile?.username || "Player"}
                          <Sparkles className="h-3 w-3 text-yellow-400" />
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-green-400 text-xs font-bold">
                            ₹{wallet?.balance?.toFixed(2) || "0.00"}
                          </span>
                          <Zap className="h-3 w-3 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="relative group text-red-400 hover:text-white hover:bg-red-500/20 p-3 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <LogOut className="relative h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative group text-white p-3 rounded-xl hover:bg-gray-800/50 transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {mobileMenuOpen ? (
                <X className="relative h-6 w-6 transform rotate-90 group-hover:rotate-0 transition-transform duration-300" />
              ) : (
                <Menu className="relative h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700/50 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentView === item.id ||
                  (item.id === "games" &&
                    (currentView === "lobby" ||
                      currentView === "game" ||
                      currentView === "dots-and-boxes" ||
                      currentView === "dots-and-boxes-lobby" ||
                      currentView === "online-dots-and-boxes"));

                return (
                  <div key={item.id} className="relative">
                    {isActive && (
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl blur-lg opacity-60"></div>
                    )}
                    <button
                      onClick={() => {
                        onViewChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`relative w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 text-left min-h-[56px] ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-purple-400/50"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50"
                      }`}
                    >
                      <div className="relative">
                        {isActive && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-60"></div>
                        )}
                        <Icon
                          className={`relative h-6 w-6 flex-shrink-0 ${isActive ? "text-white drop-shadow-lg" : ""}`}
                        />
                      </div>
                      <span className="font-bold text-lg">{item.label}</span>

                      {isActive && (
                        <div className="ml-auto flex items-center gap-2">
                          <div className="text-2xl animate-bounce">
                            {item.emoji}
                          </div>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                            <div
                              className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}

              {user && (
                <>
                  {/* Mobile User Info */}
                  <div className="px-4 py-4 border-t border-gray-700/50 mt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-60"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl">
                          👤
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-base flex items-center gap-2">
                          {profile?.username || "Player"}
                          <Sparkles className="h-4 w-4 text-yellow-400" />
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm font-bold">
                            Balance: ₹{wallet?.balance?.toFixed(2) || "0.00"}
                          </span>
                          <Zap className="h-4 w-4 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-4 px-4 py-4 text-red-400 hover:bg-red-500/10 active:bg-red-500/20 rounded-xl transition-all duration-300 min-h-[56px]"
                  >
                    <LogOut className="h-6 w-6 flex-shrink-0" />
                    <span className="font-bold text-lg">Sign Out</span>
                    <div className="ml-auto text-xl">🚪</div>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
