import React from "react";
import { Gamepad2, Sparkles, Star } from "lucide-react";

interface ModernLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const ModernLoading: React.FC<ModernLoadingProps> = ({
  message = "Loading Game Platform...",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-32 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center">
        {/* Logo/Icon Section */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-xl opacity-60 animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-full border-4 border-white/30 shadow-2xl">
            <Gamepad2
              className={`${sizeClasses[size]} text-blue-600 animate-float`}
            />
          </div>

          {/* Floating decorative elements */}
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div
            className="absolute -bottom-2 -left-2 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fadeInUp">
            {message}
          </h2>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 max-w-xs mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-shimmer"></div>
          </div>
        </div>

        {/* Loading Tips */}
        <div className="mt-8 max-w-md mx-auto">
          <p
            className="text-sm text-gray-600 opacity-80 animate-fadeInUp"
            style={{ animationDelay: "0.5s" }}
          >
            🎮 Preparing your gaming experience...
          </p>
        </div>
      </div>
    </div>
  );
};

// Compact version for inline loading
export const CompactLoading: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => {
  return (
    <div className="flex items-center justify-center space-x-3 p-4">
      <div className="relative">
        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <span className="text-sm font-medium text-gray-600">{message}</span>
    </div>
  );
};

// Skeleton loading for cards
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl">
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>

        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-lg mb-4 w-3/4"></div>

        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-12 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  );
};
