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
  Mail,
  Lock,
  User,
  UserPlus,
} from "lucide-react";

export const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoaded, setIsLoaded] = useState(false);

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
        toast.error(error.message, {
          style: {
            background:
              "linear-gradient(135deg, rgba(244, 114, 182, 0.9), rgba(168, 85, 247, 0.9))",
            color: "white",
            border: "none",
          },
        });
      } else {
        toast.success(
          "Account created successfully! Please check your email. 🌸",
          {
            style: {
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(59, 130, 246, 0.9))",
              color: "white",
              border: "none",
            },
          },
        );
      }
    } catch (networkError) {
      console.warn("Network error during sign up:", networkError);
      toast.error(
        "Connection error. Please check your internet and try again.",
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(244, 114, 182, 0.9))",
            color: "white",
            border: "none",
          },
        },
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
        toast.error(error.message, {
          style: {
            background:
              "linear-gradient(135deg, rgba(244, 114, 182, 0.9), rgba(168, 85, 247, 0.9))",
            color: "white",
            border: "none",
          },
        });
      } else {
        toast.success("Welcome back! ✨", {
          style: {
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(59, 130, 246, 0.9))",
            color: "white",
            border: "none",
          },
        });
      }
    } catch (networkError) {
      console.warn("Network error during sign in:", networkError);
      toast.error(
        "Connection error. Please check your internet and try again.",
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(244, 114, 182, 0.9))",
            color: "white",
            border: "none",
          },
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 via-blue-50 to-cyan-100">
        {/* Floating Elements */}
        <div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-20 animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full opacity-20 animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-20 animate-bounce"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-40 right-10 w-12 h-12 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full opacity-20 animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Sakura Petals Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-pink-300 text-2xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              🌸
            </div>
          ))}
        </div>

        {/* Star Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-300 text-lg animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex items-center justify-between">
          {/* Anime Character Section */}
          <div
            className={`hidden lg:flex flex-col items-center justify-center w-1/2 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <div className="relative">
              {/* Character Glow Effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full blur-2xl opacity-30 animate-pulse"></div>

              {/* Main Character */}
              <div className="relative text-[200px] animate-float">
                {activeTab === "signin" ? "🌸👧" : "✨🧙‍♀️"}
              </div>

              {/* Floating Hearts */}
              <div
                className="absolute -top-4 -right-4 text-4xl animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                💖
              </div>
              <div
                className="absolute -bottom-4 -left-4 text-3xl animate-bounce"
                style={{ animationDelay: "1.5s" }}
              >
                💜
              </div>
              <div
                className="absolute top-1/2 -left-8 text-2xl animate-bounce"
                style={{ animationDelay: "1s" }}
              >
                💙
              </div>
            </div>

            {/* Character Messages */}
            <div className="mt-8 text-center">
              <div
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-pink-200 transition-all duration-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <p className="text-gray-700 font-medium">
                  {activeTab === "signin"
                    ? "Welcome back, dear friend! 🌸"
                    : "Let's create your magical journey! ✨"}
                </p>
                <div className="flex justify-center gap-1 mt-2">
                  <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
                  <Star
                    className="h-4 w-4 text-yellow-500 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <Heart
                    className="h-4 w-4 text-purple-500 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form Section */}
          <div
            className={`w-full lg:w-1/2 max-w-md mx-auto transition-all duration-1000 ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Card Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-3xl blur-xl opacity-20"></div>

              <div className="relative">
                <CardHeader className="text-center space-y-6 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 pb-8">
                  {/* Logo Section */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                      <div className="relative p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Gaming Paradise
                    </h1>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                      <div className="relative p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <CardDescription className="text-gray-600 text-lg font-medium">
                    Where dreams become reality ✨🌸💖
                  </CardDescription>

                  {/* Decorative Elements */}
                  <div className="flex justify-center gap-2">
                    <span
                      className="text-2xl animate-bounce"
                      style={{ animationDelay: "0s" }}
                    >
                      🌸
                    </span>
                    <span
                      className="text-2xl animate-bounce"
                      style={{ animationDelay: "0.5s" }}
                    >
                      ✨
                    </span>
                    <span
                      className="text-2xl animate-bounce"
                      style={{ animationDelay: "1s" }}
                    >
                      💖
                    </span>
                    <span
                      className="text-2xl animate-bounce"
                      style={{ animationDelay: "1.5s" }}
                    >
                      🌙
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-1 border border-pink-200">
                      <TabsTrigger
                        value="signin"
                        className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-6 mt-8">
                      <form onSubmit={handleSignIn} className="space-y-6">
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="Enter your magical email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-12 h-14 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl text-gray-700 placeholder:text-gray-500 focus:border-pink-400 focus:ring-0 transition-all duration-300"
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="Enter your secret spell"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-12 h-14 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl text-gray-700 placeholder:text-gray-500 focus:border-pink-400 focus:ring-0 transition-all duration-300"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-14 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
                        >
                          {/* Button glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <Heart className="h-5 w-5" />
                            {loading
                              ? "Entering magical realm..."
                              : "Enter Paradise"}
                            <Sparkles className="h-5 w-5" />
                          </div>
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-6 mt-8">
                      <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Choose your magical username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="pl-12 h-14 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl text-gray-700 placeholder:text-gray-500 focus:border-purple-400 focus:ring-0 transition-all duration-300"
                          />
                        </div>
                        <div className="relative">
                          <Star className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Your beautiful full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-12 h-14 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl text-gray-700 placeholder:text-gray-500 focus:border-purple-400 focus:ring-0 transition-all duration-300"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="Enter your magical email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-12 h-14 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl text-gray-700 placeholder:text-gray-500 focus:border-purple-400 focus:ring-0 transition-all duration-300"
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="Create your secret spell"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-12 h-14 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl text-gray-700 placeholder:text-gray-500 focus:border-purple-400 focus:ring-0 transition-all duration-300"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-14 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
                        >
                          {/* Button glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            {loading
                              ? "Creating magical account..."
                              : "Join Paradise"}
                            <Star className="h-5 w-5" />
                          </div>
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  {/* Footer Decoration */}
                  <div className="mt-8 text-center">
                    <div className="flex justify-center gap-2 text-2xl">
                      <span className="animate-pulse">💖</span>
                      <span
                        className="animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      >
                        ✨
                      </span>
                      <span
                        className="animate-pulse"
                        style={{ animationDelay: "1s" }}
                      >
                        🌸
                      </span>
                      <span
                        className="animate-pulse"
                        style={{ animationDelay: "1.5s" }}
                      >
                        💜
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2 font-medium">
                      Made with love and magic ✨
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
