import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Crown, Zap, Sparkles, Heart, Star } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { currentTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username,
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(
          "✨ Welcome to our magical world! Please check your email.",
        );
      }
    } catch (networkError) {
      console.warn("Network error during sign up:", networkError);
      toast.error(
        "Connection error. Please check your internet and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("🎌 Welcome back, dear player! ✨");
      }
    } catch (networkError) {
      console.warn("Network error during sign in:", networkError);
      toast.error(
        "Connection error. Please check your internet and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br ${currentTheme.gradients.primary} via-${currentTheme.gradients.secondary} to-${currentTheme.gradients.accent}`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-30 animate-bounce"
            style={{
              animationDelay: `${i * 0.5}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: "3s",
            }}
          >
            {currentTheme.id.includes("love") ||
            currentTheme.id.includes("sakura")
              ? "🌸"
              : "✨"}
          </div>
        ))}

        {/* Background shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main Auth Card */}
      <Card
        className={`w-full max-w-md mx-4 relative z-10 backdrop-blur-xl bg-white/90 border border-white/20 shadow-2xl transition-all duration-1000 ${
          isLoaded
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        } ${
          currentTheme.id.includes("dark") ||
          currentTheme.id.includes("midnight") ||
          currentTheme.id.includes("neon") ||
          currentTheme.id.includes("cosmic")
            ? "bg-black/80 text-white"
            : "bg-white/90 text-gray-800"
        }`}
      >
        <CardHeader className="text-center space-y-6 relative z-10">
          {/* Animated logo section */}
          <div
            className={`flex items-center justify-center gap-3 transition-all duration-700 ${isLoaded ? "scale-100" : "scale-75"}`}
          >
            <div className="relative">
              <div
                className={`absolute -inset-2 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full blur-lg opacity-60 animate-pulse`}
              ></div>
              <div
                className={`relative w-12 h-12 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full flex items-center justify-center shadow-xl`}
              >
                <Crown
                  className="h-6 w-6 text-white animate-bounce"
                  style={{ animationDuration: "2s" }}
                />
              </div>
            </div>

            <div>
              <h1
                className={`text-3xl font-black bg-gradient-to-r ${currentTheme.gradients.primary} bg-clip-text text-transparent`}
              >
                GameCastle
              </h1>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">
                  Where dreams come true
                </span>
                <Sparkles
                  className="h-3 w-3 text-yellow-400 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
            </div>

            <div className="relative">
              <div
                className={`absolute -inset-2 bg-gradient-to-r ${currentTheme.gradients.secondary} rounded-full blur-lg opacity-60 animate-pulse`}
              ></div>
              <div
                className={`relative w-12 h-12 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full flex items-center justify-center shadow-xl`}
              >
                {currentTheme.id.includes("love") ||
                currentTheme.id.includes("sakura") ? (
                  <Heart className="h-6 w-6 text-white animate-pulse" />
                ) : currentTheme.id.includes("dream") ||
                  currentTheme.id.includes("cosmic") ? (
                  <Star
                    className="h-6 w-6 text-white animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                ) : (
                  <Zap
                    className="h-6 w-6 text-white animate-bounce"
                    style={{ animationDuration: "1.5s" }}
                  />
                )}
              </div>
            </div>
          </div>

          <CardDescription
            className={`text-base ${
              currentTheme.id.includes("dark") ||
              currentTheme.id.includes("midnight") ||
              currentTheme.id.includes("neon") ||
              currentTheme.id.includes("cosmic")
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            ✨ Enter a world where legends are born and dreams become reality!
            ✨
          </CardDescription>

          {/* Character indicators */}
          <div className="flex justify-center gap-2">
            <div
              className="text-2xl animate-bounce"
              style={{ animationDelay: "0s" }}
            >
              🎮
            </div>
            <div
              className="text-2xl animate-bounce"
              style={{ animationDelay: "0.3s" }}
            >
              👑
            </div>
            <div
              className="text-2xl animate-bounce"
              style={{ animationDelay: "0.6s" }}
            >
              ✨
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className={`grid w-full grid-cols-2 rounded-xl p-1 ${
                currentTheme.id.includes("dark") ||
                currentTheme.id.includes("midnight") ||
                currentTheme.id.includes("neon") ||
                currentTheme.id.includes("cosmic")
                  ? "bg-gray-800/50"
                  : "bg-gray-100/80"
              }`}
            >
              <TabsTrigger
                value="signin"
                className={`text-sm font-semibold transition-all duration-300 rounded-lg ${
                  activeTab === "signin"
                    ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-lg transform scale-105`
                    : currentTheme.id.includes("dark") ||
                        currentTheme.id.includes("midnight") ||
                        currentTheme.id.includes("neon") ||
                        currentTheme.id.includes("cosmic")
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-800"
                }`}
              >
                💫 Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className={`text-sm font-semibold transition-all duration-300 rounded-lg ${
                  activeTab === "signup"
                    ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-lg transform scale-105`
                    : currentTheme.id.includes("dark") ||
                        currentTheme.id.includes("midnight") ||
                        currentTheme.id.includes("neon") ||
                        currentTheme.id.includes("cosmic")
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-800"
                }`}
              >
                ✨ Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="✨ Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={`w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-300 ${
                      currentTheme.id.includes("dark") ||
                      currentTheme.id.includes("midnight") ||
                      currentTheme.id.includes("neon") ||
                      currentTheme.id.includes("cosmic")
                        ? "bg-gray-800/70 border-gray-600 text-white placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        : "bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                    } focus:outline-none shadow-lg`}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="🔮 Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={`w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-300 ${
                      currentTheme.id.includes("dark") ||
                      currentTheme.id.includes("midnight") ||
                      currentTheme.id.includes("neon") ||
                      currentTheme.id.includes("cosmic")
                        ? "bg-gray-800/70 border-gray-600 text-white placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        : "bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                    } focus:outline-none shadow-lg`}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 text-base font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-xl hover:shadow-2xl relative overflow-hidden group`}
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Entering...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Enter the Magic World!</span>
                        <Heart className="h-5 w-5" />
                      </>
                    )}
                  </div>
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="🎭 Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className={`w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-300 ${
                      currentTheme.id.includes("dark") ||
                      currentTheme.id.includes("midnight") ||
                      currentTheme.id.includes("neon") ||
                      currentTheme.id.includes("cosmic")
                        ? "bg-gray-800/70 border-gray-600 text-white placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        : "bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                    } focus:outline-none shadow-lg`}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="👑 Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className={`w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-300 ${
                      currentTheme.id.includes("dark") ||
                      currentTheme.id.includes("midnight") ||
                      currentTheme.id.includes("neon") ||
                      currentTheme.id.includes("cosmic")
                        ? "bg-gray-800/70 border-gray-600 text-white placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        : "bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                    } focus:outline-none shadow-lg`}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="✨ Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={`w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-300 ${
                      currentTheme.id.includes("dark") ||
                      currentTheme.id.includes("midnight") ||
                      currentTheme.id.includes("neon") ||
                      currentTheme.id.includes("cosmic")
                        ? "bg-gray-800/70 border-gray-600 text-white placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        : "bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                    } focus:outline-none shadow-lg`}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="🔮 Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-300 ${
                      currentTheme.id.includes("dark") ||
                      currentTheme.id.includes("midnight") ||
                      currentTheme.id.includes("neon") ||
                      currentTheme.id.includes("cosmic")
                        ? "bg-gray-800/70 border-gray-600 text-white placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        : "bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                    } focus:outline-none shadow-lg`}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 text-base font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-xl hover:shadow-2xl relative overflow-hidden group`}
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Star className="h-5 w-5" />
                        <span>Begin Your Adventure!</span>
                        <Sparkles className="h-5 w-5" />
                      </>
                    )}
                  </div>
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer message */}
          <div className="text-center mt-6 space-y-2">
            <p
              className={`text-xs ${
                currentTheme.id.includes("dark") ||
                currentTheme.id.includes("midnight") ||
                currentTheme.id.includes("neon") ||
                currentTheme.id.includes("cosmic")
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              By joining us, you agree to spread joy and have fun! 🎮✨
            </p>
            <div className="flex justify-center gap-2 text-lg">
              <span className="animate-pulse">💖</span>
              <span
                className="animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                🌟
              </span>
              <span className="animate-pulse" style={{ animationDelay: "1s" }}>
                🎯
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional floating elements */}
      <div
        className="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 text-4xl sm:text-6xl opacity-20 animate-bounce"
        style={{ animationDuration: "3s" }}
      >
        {currentTheme.id.includes("love") || currentTheme.id.includes("sakura")
          ? "🌸"
          : "✨"}
      </div>
      <div
        className="absolute top-4 right-4 sm:top-10 sm:right-10 text-4xl sm:text-6xl opacity-20 animate-bounce"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      >
        {currentTheme.id.includes("love") || currentTheme.id.includes("sakura")
          ? "💖"
          : "🌟"}
      </div>
    </div>
  );
};
