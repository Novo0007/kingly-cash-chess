import React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  centerContent?: boolean;
  disableScroll?: boolean;
  gameMode?: boolean;
  bgPattern?: "dots" | "grid" | "waves" | "gradient" | "none";
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  padding = "md",
  maxWidth = "lg",
  centerContent = false,
  disableScroll = false,
  gameMode = false,
  bgPattern = "none",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-1 sm:p-2 md:p-3",
    md: "p-2 sm:p-3 md:p-4",
    lg: "p-3 sm:p-4 md:p-6",
  };

  const maxWidthClasses = {
    sm: "max-w-full sm:max-w-sm",
    md: "max-w-full sm:max-w-md",
    lg: "max-w-full sm:max-w-lg",
    xl: "max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl",
    full: "max-w-full",
  };

  const backgroundPatterns = {
    dots: "bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:20px_20px]",
    grid: "bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]",
    waves:
      "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_50%)]",
    gradient:
      "bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50",
    none: "",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full min-h-screen relative",
        "touch-manipulation select-none",
        paddingClasses[padding],
        maxWidthClasses[maxWidth],
        centerContent && "flex flex-col items-center justify-center",
        disableScroll && "overflow-hidden",
        gameMode && [
          "bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100",
          backgroundPatterns[bgPattern],
          "relative",
        ],
        className,
      )}
      style={{
        WebkitTapHighlightColor: "transparent",
        WebkitTouchCallout: "none",
        touchAction: "manipulation",
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Professional Game Background Elements */}
      {gameMode && (
        <>
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -top-10 -right-20 w-60 h-60 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute -bottom-20 -left-10 w-50 h-50 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-2000" />
          </div>

          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          {/* Glass Morphism Effect */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] pointer-events-none" />
        </>
      )}

      {/* Main Content */}
      <div className={cn("relative z-10", gameMode && "backdrop-blur-sm")}>
        {children}
      </div>

      {/* Professional Game Enhancement Styles */}
      <style jsx global>{`
        /* Enhanced Scrolling for Mobile */
        @media (max-width: 768px) {
          html {
            scroll-behavior: smooth;
            -webkit-text-size-adjust: 100%;
          }

          body {
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }

        /* Professional Game UI Enhancements */
        .game-container {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .game-card {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .game-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        /* Enhanced Button Styles */
        .game-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .game-button:active {
          transform: scale(0.95) translateZ(0);
        }

        .game-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .game-button:hover::before {
          left: 100%;
        }

        /* Professional Loading States */
        .loading-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Enhanced Focus States for Accessibility */
        .game-interactive:focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.8);
          outline-offset: 2px;
          box-shadow:
            0 0 0 4px rgba(59, 130, 246, 0.1),
            0 8px 32px rgba(0, 0, 0, 0.1);
        }

        /* Professional Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Mobile Optimization */
        @media (max-width: 640px) {
          .game-container {
            padding: 0.5rem;
          }

          .game-card {
            border-radius: 1rem;
            margin: 0.25rem 0;
          }
        }

        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .game-container,
          .game-card,
          .game-button {
            transition: none;
            animation: none;
          }

          .animate-fade-in-up,
          .animate-scale-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
