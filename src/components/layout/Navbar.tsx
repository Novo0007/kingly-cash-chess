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
    { id: "lobby", label: "Game Lobby", icon: Crown },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "friends", label: "Friends", icon: Users },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-cyan-400/30 sticky top-0 z-50 glow-cyan">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Futuristic Logo */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Crown className="h-6 w-6 md:h-8 md:w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="absolute inset-0 animate-pulse">
                <Crown className="h-6 w-6 md:h-8 md:w-8 text-cyan-400/30" />
              </div>
            </div>
            <span className="text-lg md:text-xl font-bold text-neon-cyan font-mono tracking-wider">
              NEXUS<span className="text-purple-400">CHESS</span>
            </span>
            <div className="hidden md:flex items-center gap-1 ml-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-mono">ONLINE</span>
            </div>
          </div>

          {/* Futuristic Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-mono text-sm relative group ${
                    isActive
                      ? "bg-cyan-400/20 text-cyan-400 glow-cyan"
                      : "text-gray-300 hover:text-cyan-300 hover:bg-slate-800/50 border border-transparent hover:border-cyan-400/30"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "animate-pulse" : "group-hover:animate-pulse"}`}
                  />
                  <span className="tracking-wide">
                    {item.label.toUpperCase()}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Futuristic User Info & Mobile Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            {user && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-right bg-slate-800/50 px-3 py-1 rounded-lg border border-cyan-400/20">
                  <p className="text-cyan-300 font-mono text-sm tracking-wide">
                    {profile?.username || "AGENT_UNKNOWN"}
                  </p>
                  <p className="text-green-400 text-xs font-mono">
                    ⚡ ₹{wallet?.balance?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-400/20 hover:border-red-400/40 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Cyberpunk Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-cyan-400 p-2 rounded-lg hover:bg-slate-800/50 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center border border-cyan-400/30 hover:border-cyan-400/60 glow-cyan"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 animate-pulse" />
              ) : (
                <Menu className="h-5 w-5 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Futuristic Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-cyan-400/30 py-3 bg-slate-900/95 backdrop-blur-xl">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-all text-left min-h-[44px] font-mono relative group ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-400 glow-cyan"
                        : "text-gray-300 hover:text-cyan-300 hover:bg-slate-800/50 active:bg-slate-700/50 border border-transparent hover:border-cyan-400/20"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${isActive ? "animate-pulse" : "group-hover:animate-pulse"}`}
                    />
                    <span className="font-medium tracking-wide">
                      {item.label.toUpperCase()}
                    </span>
                    {isActive && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                );
              })}

              {user && (
                <>
                  <div className="px-4 py-4 border-t border-cyan-400/30 mt-3 bg-slate-800/30 rounded-lg mx-2">
                    <p className="text-cyan-300 font-mono text-sm tracking-wide">
                      {profile?.username || "AGENT_UNKNOWN"}
                    </p>
                    <p className="text-green-400 text-sm mt-1 font-mono">
                      ⚡ Balance: ₹{wallet?.balance?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:bg-red-500/10 active:bg-red-500/20 rounded-lg transition-all min-h-[44px] border border-red-400/20 hover:border-red-400/40 mx-2 font-mono"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0 animate-pulse" />
                    <span className="font-medium tracking-wide">
                      DISCONNECT
                    </span>
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
