import { useState, useEffect } from "react";
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
import {
  Crown,
  Zap,
  Heart,
  Star,
  Sparkles,
  UserPlus,
  LogIn,
  Mail,
  Lock,
  User,
  Users,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { handleSupabaseError, withErrorHandling } from "@/utils/errorHandler";

export const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
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
        toast.success("Account created successfully! Please check your email.");
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
        toast.success("Welcome back!");
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

  const isAnimeTheme = ["dreampixels", "sakurablossom", "loveheart"].includes(
    currentTheme.id,
  );

  return (
    <div
      className={`min-h-screen relative flex items-center justify-center p-4 overflow-hidden ${
        isAnimeTheme
          ? `bg-gradient-to-br ${currentTheme.gradients.primary}/20 via-background to-${currentTheme.gradients.secondary}/20`
          : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isAnimeTheme ? (
          <>
            {/* Floating particles for anime themes */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute animate-pulse duration-${3000 + i * 1000} 
                  ${
                    currentTheme.id === "dreampixels"
                      ? "text-pink-300"
                      : currentTheme.id === "sakurablossom"
                        ? "text-pink-200"
                        : "text-red-300"
                  }`}
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${10 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  fontSize: "2rem",
                }}
              >
                {currentTheme.id === "dreampixels"
                  ? "💖"
                  : currentTheme.id === "sakurablossom"
                    ? "🌸"
                    : "❤️"}
              </div>
            ))}

            {/* Sparkle effects */}
            {[...Array(10)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute text-yellow-300 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                ✨
              </div>
            ))}
          </>
        ) : (
          /* Professional grid pattern for non-anime themes */
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        )}
      </div>

      {/* Main Auth Card */}
      <Card
        className={`w-full max-w-md transition-all duration-1000 transform ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-8 opacity-0 scale-95"
        } ${
          isAnimeTheme
            ? `bg-card/80 backdrop-blur-xl border-2 ${
                currentTheme.id === "dreampixels"
                  ? "border-pink-300/30 shadow-pink-500/20"
                  : currentTheme.id === "sakurablossom"
                    ? "border-pink-200/30 shadow-pink-400/20"
                    : "border-red-300/30 shadow-red-500/20"
              } shadow-2xl`
            : "bg-black/50 backdrop-blur-lg border-yellow-500/20"
        } interactive group hover:scale-105 hover:shadow-2xl`}
      >
        <CardHeader className="text-center space-y-6 relative">
          {/* Animated Icon Header */}
          <div
            className={`flex items-center justify-center gap-3 transition-all duration-700 ${
              isVisible ? "animate-bounce" : ""
            }`}
          >
            {isAnimeTheme ? (
              <>
                <div className="relative">
                  <Heart
                    className={`h-10 w-10 ${
                      currentTheme.id === "dreampixels"
                        ? "text-pink-500"
                        : currentTheme.id === "sakurablossom"
                          ? "text-pink-400"
                          : "text-red-500"
                    } animate-pulse heart-pulse`}
                  />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-spin" />
                </div>
                <h1
                  className={`text-3xl font-bold bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent`}
                >
                  {currentTheme.id === "dreampixels"
                    ? "DreamPixels"
                    : currentTheme.id === "sakurablossom"
                      ? "Sakura Dreams"
                      : "Love Games"}
                </h1>
                <div className="relative">
                  <Star
                    className={`h-10 w-10 ${
                      currentTheme.id === "dreampixels"
                        ? "text-purple-500"
                        : currentTheme.id === "sakurablossom"
                          ? "text-pink-500"
                          : "text-pink-600"
                    } animate-pulse`}
                  />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -left-1 animate-ping" />
                </div>
              </>
            ) : (
              <>
                <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
                <h1 className="text-2xl font-bold text-white">ChessCash</h1>
                <Zap className="h-8 w-8 text-yellow-500 animate-pulse" />
              </>
            )}
          </div>

          <CardDescription
            className={`text-lg transition-all duration-500 ${
              isAnimeTheme
                ? `${
                    currentTheme.id === "dreampixels"
                      ? "text-pink-600/80"
                      : currentTheme.id === "sakurablossom"
                        ? "text-pink-500/80"
                        : "text-red-600/80"
                  } font-medium`
                : "text-gray-300"
            }`}
          >
            {isAnimeTheme
              ? currentTheme.id === "dreampixels"
                ? "Where kawaii dreams come true! (◕‿◕)♡"
                : currentTheme.id === "sakurablossom"
                  ? "Beautiful moments under cherry blossoms ✨🌸"
                  : "Love is in the air! Find your gaming soulmate ❤️"
              : "Where legends are born, one move at a time ✨"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList
              className={`grid w-full grid-cols-2 transition-all duration-300 ${
                isAnimeTheme
                  ? `bg-muted/50 backdrop-blur-sm border ${
                      currentTheme.id === "dreampixels"
                        ? "border-pink-200/30"
                        : currentTheme.id === "sakurablossom"
                          ? "border-pink-200/20"
                          : "border-red-200/30"
                    }`
                  : "bg-gray-800/50"
              }`}
            >
              <TabsTrigger
                value="signin"
                className={`transition-all duration-300 transform hover:scale-105 ${
                  isAnimeTheme
                    ? `text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:${currentTheme.gradients.primary} data-[state=active]:text-white data-[state=active]:shadow-lg`
                    : "text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                }`}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className={`transition-all duration-300 transform hover:scale-105 ${
                  isAnimeTheme
                    ? `text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:${currentTheme.gradients.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg`
                    : "text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`pl-10 transition-all duration-300 transform focus:scale-105 ${
                        isAnimeTheme
                          ? `bg-card/50 border-2 ${
                              currentTheme.id === "dreampixels"
                                ? "border-pink-200/30 focus:border-pink-400"
                                : currentTheme.id === "sakurablossom"
                                  ? "border-pink-200/20 focus:border-pink-300"
                                  : "border-red-200/30 focus:border-red-400"
                            } text-foreground placeholder:text-muted-foreground focus:shadow-lg backdrop-blur-sm`
                          : "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      }`}
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`pl-10 transition-all duration-300 transform focus:scale-105 ${
                        isAnimeTheme
                          ? `bg-card/50 border-2 ${
                              currentTheme.id === "dreampixels"
                                ? "border-pink-200/30 focus:border-pink-400"
                                : currentTheme.id === "sakurablossom"
                                  ? "border-pink-200/20 focus:border-pink-300"
                                  : "border-red-200/30 focus:border-red-400"
                            } text-foreground placeholder:text-muted-foreground focus:shadow-lg backdrop-blur-sm`
                          : "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      }`}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${
                    isAnimeTheme
                      ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-lg hover:shadow-2xl border-0`
                      : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Sign In</span>
                      {isAnimeTheme && (
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      )}
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className={`pl-10 transition-all duration-300 transform focus:scale-105 ${
                        isAnimeTheme
                          ? `bg-card/50 border-2 ${
                              currentTheme.id === "dreampixels"
                                ? "border-pink-200/30 focus:border-pink-400"
                                : currentTheme.id === "sakurablossom"
                                  ? "border-pink-200/20 focus:border-pink-300"
                                  : "border-red-200/30 focus:border-red-400"
                            } text-foreground placeholder:text-muted-foreground focus:shadow-lg backdrop-blur-sm`
                          : "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      }`}
                    />
                  </div>

                  <div className="relative group">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`pl-10 transition-all duration-300 transform focus:scale-105 ${
                        isAnimeTheme
                          ? `bg-card/50 border-2 ${
                              currentTheme.id === "dreampixels"
                                ? "border-pink-200/30 focus:border-pink-400"
                                : currentTheme.id === "sakurablossom"
                                  ? "border-pink-200/20 focus:border-pink-300"
                                  : "border-red-200/30 focus:border-red-400"
                            } text-foreground placeholder:text-muted-foreground focus:shadow-lg backdrop-blur-sm`
                          : "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      }`}
                    />
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`pl-10 transition-all duration-300 transform focus:scale-105 ${
                        isAnimeTheme
                          ? `bg-card/50 border-2 ${
                              currentTheme.id === "dreampixels"
                                ? "border-pink-200/30 focus:border-pink-400"
                                : currentTheme.id === "sakurablossom"
                                  ? "border-pink-200/20 focus:border-pink-300"
                                  : "border-red-200/30 focus:border-red-400"
                            } text-foreground placeholder:text-muted-foreground focus:shadow-lg backdrop-blur-sm`
                          : "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      }`}
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`pl-10 transition-all duration-300 transform focus:scale-105 ${
                        isAnimeTheme
                          ? `bg-card/50 border-2 ${
                              currentTheme.id === "dreampixels"
                                ? "border-pink-200/30 focus:border-pink-400"
                                : currentTheme.id === "sakurablossom"
                                  ? "border-pink-200/20 focus:border-pink-300"
                                  : "border-red-200/30 focus:border-red-400"
                            } text-foreground placeholder:text-muted-foreground focus:shadow-lg backdrop-blur-sm`
                          : "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      }`}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${
                    isAnimeTheme
                      ? `bg-gradient-to-r ${currentTheme.gradients.secondary} text-white shadow-lg hover:shadow-2xl border-0`
                      : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Create Account</span>
                      {isAnimeTheme && (
                        <Heart className="h-4 w-4 animate-pulse" />
                      )}
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Additional decorative elements for anime themes */}
          {isAnimeTheme && (
            <div className="text-center space-y-2 pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                {currentTheme.id === "dreampixels"
                  ? "Join our kawaii community! (づ｡◕‿‿◕｡)づ"
                  : currentTheme.id === "sakurablossom"
                    ? "Bloom with us in this beautiful journey 🌸"
                    : "Find love through games ❤️ Together forever!"}
              </p>
              <div className="flex justify-center space-x-2 text-lg">
                {currentTheme.id === "dreampixels" && "💖 ✨ 🌟 ✨ 💖"}
                {currentTheme.id === "sakurablossom" && "🌸 🌺 🌸 🌺 🌸"}
                {currentTheme.id === "loveheart" && "❤️ 💕 💗 💕 ❤️"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
