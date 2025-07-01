
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Home,
  Users,
  Trophy,
  Wallet,
  UserCircle,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin?: boolean;
}

export const Navbar = ({ currentView, onViewChange, isAdmin }: NavbarProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems = [
    { id: "games", label: "Games", icon: Home },
    { id: "friends", label: "Friends", icon: Users },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "profile", label: "Profile", icon: UserCircle },
  ];

  if (isAdmin) {
    navigationItems.push({ id: "admin", label: "Admin", icon: Shield });
  }

  return (
    <Card className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-600 shadow-xl rounded-xl m-4 wood-plank">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-amber-900 text-lg">Gaming Lodge</span>
          </div>

          <nav className="flex space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  variant={isActive ? "default" : "ghost"}
                  className={`
                    font-medium transition-all duration-200 rounded-lg border-2 px-4 py-2
                    ${
                      isActive
                        ? "bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white border-yellow-400 shadow-lg transform scale-105"
                        : "text-amber-900 hover:bg-amber-200 hover:text-amber-900 border-amber-400 hover:border-amber-600"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {item.id === "admin" && (
                    <Badge className="ml-2 bg-red-600 text-white text-xs">
                      Admin
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            variant="ghost"
            className="text-amber-900 hover:bg-amber-200 hover:text-amber-900 font-medium border-2 border-amber-400 hover:border-amber-600 rounded-lg px-4 py-2 transition-all duration-200"
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
