import { useEffect, useState } from "react";
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
import { Crown, Zap, AlertCircle, Mail } from "lucide-react";

export const AuthPage = () => {
  useEffect(() => {
    // Clear any invalid session data on component mount
    const clearInvalidSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error && (error.message.includes('refresh_token_not_found') || 
                     error.message.includes('Invalid Refresh Token'))) {
          await supabase.auth.signOut()
          localStorage.removeItem('supabase.auth.token')
          sessionStorage.clear()
          console.log('Cleared invalid session data')
        }
      } catch (err) {
        console.log('Session cleanup completed')
      }
    }
    
    clearInvalidSession()
  }, [])

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

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
        if (error.message.includes('User already registered')) {
          toast.error("An account with this email already exists. Please sign in instead.");
        } else if (error.message.includes('Password should be at least')) {
          toast.error("Password must be at least 6 characters long.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account created successfully! Please check your email to confirm your account before signing in.");
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
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Please check your email and click the confirmation link before signing in.");
        } else if (error.message.includes('Too many requests')) {
          toast.error("Too many login attempts. Please wait a moment before trying again.");
        } else {
          toast.error(error.message);
        }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent! Please check your inbox.");
        setShowForgotPassword(false);
        setResetEmail("");
      }
    } catch (networkError) {
      console.warn("Network error during password reset:", networkError);
      toast.error("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <Card className="w-full max-w-md bg-black/50 backdrop-blur-lg border-yellow-500/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">ChessCash</h1>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
          <CardDescription className="text-gray-300">
            Play chess, win real money!
          </CardDescription>
        </CardHeader>

        <CardContent>
          {showForgotPassword ? (
            <div className="space-y-4">
              <div className="text-center">
                <Mail className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Reset Password</h3>
                <p className="text-gray-300 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger
                  value="signin"
                  className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-yellow-500 hover:text-yellow-400 text-sm underline"
                  >
                    Forgot your password?
                  </button>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-300">
                      <p className="font-medium mb-1">Having trouble signing in?</p>
                      <ul className="space-y-1 text-blue-200">
                        <li>• Make sure your email and password are correct</li>
                        <li>• Check if you've confirmed your email address</li>
                        <li>• Try resetting your password if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Input
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </form>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-300">
                      <p className="font-medium mb-1">After signing up:</p>
                      <p className="text-green-200">
                        Check your email for a confirmation link. You must confirm your email before you can sign in.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};