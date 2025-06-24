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
    <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Clean Logo */}
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            <span className="text-lg md:text-xl font-bold text-white">
              ChessCash
            </span>
          </div>

          {/* Clean Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Info & Mobile Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            {user && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-medium text-sm">
                    {profile?.username || "Player"}
                  </p>
                  <p className="text-blue-400 text-xs">
                    ₹{wallet?.balance?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-gray-800/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 py-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-colors text-left min-h-[44px] ${
                      currentView === item.id
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              {user && (
                <>
                  <div className="px-4 py-4 border-t border-gray-700 mt-3">
                    <p className="text-white font-medium text-sm">
                      {profile?.username || "Player"}
                    </p>
                    <p className="text-blue-400 text-sm mt-1">
                      Balance: ₹{wallet?.balance?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:bg-red-500/10 active:bg-red-500/20 rounded-lg transition-colors min-h-[44px]"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">Sign Out</span>
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
