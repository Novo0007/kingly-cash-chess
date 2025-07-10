import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Home,
  Users,
  Wallet,
  UserCircle,
  Shield,
  Gamepad2,
} from "lucide-react";

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin?: boolean;
}

export const BottomNav = ({
  currentView,
  onViewChange,
  isAdmin,
}: BottomNavProps) => {
  const navigationItems = [
    {
      id: "games",
      label: "Games",
      icon: Gamepad2,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      id: "friends",
      label: "Friends",
      icon: Users,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: Wallet,
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      id: "profile",
      label: "Profile",
      icon: UserCircle,
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  if (isAdmin) {
    navigationItems.push({ id: "admin", label: "Admin", icon: Shield });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-border shadow-lg backdrop-blur-sm">
      <div className="safe-area-inset-bottom">
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
                  flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 min-h-[60px] relative
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                `}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.id === "admin" && (
                  <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs scale-75 rounded-full">
                    Admin
                  </Badge>
                )}
              </Button>
            );
          })}
          <div className="flex items-center justify-center min-h-[60px]">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};
