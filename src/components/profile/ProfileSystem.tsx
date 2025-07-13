import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GameHistory } from "@/components/games/GameHistory";
import { SettingsSection } from "./SettingsSection";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";
import { PrivacyPolicySection } from "./PrivacyPolicySection";
import { UserGuideSection } from "./UserGuideSection";
import { MoreGamesSection } from "./MoreGamesSection";
import { CodeLearnSection } from "./CodeLearnSection";
import { useTheme } from "@/contexts/ThemeContext";
import {
  User,
  Settings,
  Trophy,
  Target,
  Star,
  Crown,
  Calendar,
  Info,
  Phone,
  Shield,
  BookOpen,
  Gamepad2,
  Edit,
  Save,
  X,
  LogOut,
  Code,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export const ProfileSystem = () => {
  const { currentTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    full_name: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        username: data.username || "",
        full_name: data.full_name || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editForm.username,
          full_name: editForm.full_name,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        username: editForm.username,
        full_name: editForm.full_name,
      });

      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 1800) return "text-purple-600";
    if (rating >= 1600) return "text-blue-600";
    if (rating >= 1400) return "text-green-600";
    if (rating >= 1200) return "text-yellow-600";
    return "text-gray-600";
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 1800) return { label: "Master", color: "bg-purple-600" };
    if (rating >= 1600) return { label: "Expert", color: "bg-blue-600" };
    if (rating >= 1400) return { label: "Advanced", color: "bg-green-600" };
    if (rating >= 1200)
      return { label: "Intermediate", color: "bg-yellow-600" };
    return { label: "Beginner", color: "bg-gray-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-card border border-border rounded-2xl">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </CardContent>
      </Card>
    );
  }

  const winRate =
    profile.games_played > 0
      ? Math.round((profile.games_won / profile.games_played) * 100)
      : 0;

  const ratingBadge = getRatingBadge(profile.chess_rating || 1200);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-card border border-border rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      className="bg-amber-50 border-amber-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, full_name: e.target.value })
                      }
                      className="bg-amber-50 border-amber-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="border-amber-400 text-amber-800"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {profile.username}
                    </h1>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSignOut}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>

                  {profile.full_name && (
                    <p className="text-muted-foreground mb-2">
                      {profile.full_name}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge
                      className={`${ratingBadge.color} text-white rounded-full`}
                    >
                      {ratingBadge.label}
                    </Badge>
                    <Badge className="bg-primary text-primary-foreground rounded-full">
                      <Calendar className="h-3 w-3 mr-1" />
                      Member since{" "}
                      {new Date(profile.created_at || "").getFullYear()}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full">
                      {currentTheme.preview} {currentTheme.name}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-muted/20 border border-border rounded-xl">
                <CardContent className="p-4 text-center">
                  <Star
                    className={`h-6 w-6 mx-auto mb-2 ${getRatingColor(profile.chess_rating || 1200)}`}
                  />
                  <p className="text-lg font-bold text-foreground">
                    {profile.chess_rating || 1200}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border border-border rounded-xl">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-lg font-bold text-foreground">
                    {profile.games_won}
                  </p>
                  <p className="text-xs text-muted-foreground">Won</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border border-border rounded-xl">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-bold text-foreground">
                    {profile.games_played}
                  </p>
                  <p className="text-xs text-muted-foreground">Played</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20 border border-border rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="h-6 w-6 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {winRate}%
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {winRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-muted p-2 rounded-2xl">
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
          >
            <Trophy className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
          >
            <Info className="h-4 w-4 mr-2" />
            About
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
          >
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
          >
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger
            value="games"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Games
          </TabsTrigger>
          <TabsTrigger
            value="codelearn"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
          >
            <Code className="h-4 w-4 mr-2" />
            CodeLearn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <GameHistory userId={profile.id} isOwnHistory={true} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsSection onBack={() => {}} />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <AboutSection onBack={() => {}} />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactSection onBack={() => {}} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacyPolicySection onBack={() => {}} />
        </TabsContent>

        <TabsContent value="games" className="mt-6">
          <MoreGamesSection onBack={() => {}} />
        </TabsContent>

        <TabsContent value="codelearn" className="mt-6">
          <CodeLearnSection userId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
