
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  Wallet,
  UserCircle,
  Shield,
} from "lucide-react";

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin?: boolean;
}

export const BottomNav = ({ currentView, onViewChange, isAdmin }: BottomNavProps) => {
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-100 to-orange-100 border-t-2 border-amber-600 shadow-xl wood-plank">
      <div className="flex justify-around items-center py-2 px-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              variant="ghost"
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-h-[60px] border-2 relative
                ${
                  isActive
                    ? "bg-gradient-to-r from-amber-700 to-orange-700 text-white border-yellow-400 shadow-lg scale-105"
                    : "text-amber-900 hover:bg-amber-200 border-transparent hover:border-amber-400"
                }
              `}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? "text-white" : "text-amber-900"}`} />
              <span className={`text-xs font-medium ${isActive ? "text-white" : "text-amber-900"}`}>
                {item.label}
              </span>
              {item.id === "admin" && (
                <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs scale-75">
                  Admin
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
