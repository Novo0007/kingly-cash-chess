import React, { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Settings,
  Trophy,
  Star,
  Zap,
  Heart,
  Crown,
  Gem,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
} from "lucide-react";

interface ProfessionalGameLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showStats?: boolean;
  stats?: {
    score?: number;
    level?: number;
    lives?: number;
    coins?: number;
    streak?: number;
  };
  gameMode?: boolean;
  headerActions?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const ProfessionalGameLayout: React.FC<ProfessionalGameLayoutProps> = ({
  children,
  title,
  subtitle,
  onBack,
  showStats = false,
  stats = {},
  gameMode = false,
  headerActions,
  footer,
  className,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Battery API (if supported)
  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));

        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };

        battery.addEventListener("levelchange", updateBattery);
        return () => battery.removeEventListener("levelchange", updateBattery);
      });
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 relative overflow-hidden",
        className,
      )}
    >
      {/* Professional Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-20 -right-40 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 -left-20 w-72 h-72 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:24px_24px] opacity-40" />

        {/* Glass Effect */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>

      {/* Status Bar (Mobile-like) */}
      <div className="relative z-20 bg-white/20 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">
              {formatTime(currentTime)}
            </span>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-slate-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <div className="flex items-center gap-1">
              <Battery className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-medium text-slate-700">
                {batteryLevel}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="relative z-10 bg-white/30 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="bg-white/40 hover:bg-white/60 backdrop-blur-sm border border-white/30 rounded-full w-10 h-10 p-0"
              >
                <Home className="w-4 h-4" />
              </Button>
            )}

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-600 font-medium">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">{headerActions}</div>
        </div>

        {/* Stats Bar */}
        {showStats && (
          <div className="px-4 pb-4">
            <Card className="bg-white/50 backdrop-blur-md border-white/30 shadow-lg">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {stats.score !== undefined && (
                    <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <div>
                        <div className="text-xs font-medium text-slate-600">
                          Score
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {stats.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.level !== undefined && (
                    <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                      <Trophy className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs font-medium text-slate-600">
                          Level
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {stats.level}
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.lives !== undefined && (
                    <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="text-xs font-medium text-slate-600">
                          Lives
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {stats.lives}
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.coins !== undefined && (
                    <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                      <Gem className="w-4 h-4 text-yellow-500" />
                      <div>
                        <div className="text-xs font-medium text-slate-600">
                          Coins
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {stats.coins}
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.streak !== undefined && stats.streak > 0 && (
                    <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-xs font-medium text-slate-600">
                          Streak
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {stats.streak}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 p-4 pb-20">
        <div className="max-w-4xl mx-auto">{children}</div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="relative z-10 bg-white/30 backdrop-blur-lg border-t border-white/20 p-4">
          {footer}
        </div>
      )}

      {/* Professional Enhancement Styles */}
      <style>{`
        /* Professional Game Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }

        @keyframes pulse-soft {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .game-element-float {
          animation: float 3s ease-in-out infinite;
        }

        .game-element-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .game-element-pulse {
          animation: pulse-soft 2s ease-in-out infinite;
        }

        /* Enhanced Interactive Elements */
        .game-interactive {
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .game-interactive:hover {
          transform: translateY(-2px);
          filter: brightness(110%) saturate(110%);
        }

        .game-interactive:active {
          transform: translateY(0px) scale(0.98);
          filter: brightness(95%) saturate(95%);
        }

        /* Professional Card Styling */
        .game-card-enhanced {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .game-card-enhanced:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transform: translateY(-4px);
        }

        /* Mobile-Optimized Interactions */
        @media (max-width: 768px) {
          .game-interactive:hover {
            transform: none;
            filter: none;
          }
          
          .game-interactive:active {
            transform: scale(0.95);
            filter: brightness(90%);
          }
        }

        /* Accessibility Improvements */
        @media (prefers-reduced-motion: reduce) {
          .game-element-float,
          .game-element-glow,
          .game-element-pulse {
            animation: none;
          }
          
          .game-interactive {
            transition: none;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .game-card-enhanced {
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
};
