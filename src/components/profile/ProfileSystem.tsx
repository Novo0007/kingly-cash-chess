
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
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export const ProfileSystem = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    full_name: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
        bio: data.bio || "",
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
          bio: editForm.bio,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        username: editForm.username,
        full_name: editForm.full_name,
        bio: editForm.bio,
      });
      
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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
    if (rating >= 1200) return { label: "Intermediate", color: "bg-yellow-600" };
    return { label: "Beginner", color: "bg-gray-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="wood-card border-amber-600">
        <CardContent className="p-6 text-center">
          <p className="text-amber-900">Profile not found</p>
        </CardContent>
      </Card>
    );
  }

  const winRate = profile.games_played > 0 
    ? Math.round((profile.games_won / profile.games_played) * 100) 
    : 0;
  
  const ratingBadge = getRatingBadge(profile.chess_rating || 1200);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="wood-card border-amber-600">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-amber-600">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-amber-600 text-white text-2xl font-bold">
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
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="bg-amber-50 border-amber-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="bg-amber-50 border-amber-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="bg-amber-50 border-amber-300"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
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
                    <h1 className="text-2xl font-bold text-amber-900">{profile.username}</h1>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(true)}
                      className="border-amber-400 text-amber-800 hover:bg-amber-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {profile.full_name && (
                    <p className="text-amber-700 mb-2">{profile.full_name}</p>
                  )}
                  
                  {profile.bio && (
                    <p className="text-amber-600 mb-4">{profile.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className={`${ratingBadge.color} text-white`}>
                      {ratingBadge.label}
                    </Badge>
                    <Badge className="bg-amber-600 text-white">
                      <Calendar className="h-3 w-3 mr-1" />
                      Member since {new Date(profile.created_at || '').getFullYear()}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-amber-100/50 border-amber-300">
                <CardContent className="p-4 text-center">
                  <Star className={`h-6 w-6 mx-auto mb-2 ${getRatingColor(profile.chess_rating || 1200)}`} />
                  <p className="text-lg font-bold text-amber-900">{profile.chess_rating || 1200}</p>
                  <p className="text-xs text-amber-700">Rating</p>
                </CardContent>
              </Card>

              <Card className="bg-amber-100/50 border-amber-300">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-lg font-bold text-amber-900">{profile.games_won}</p>
                  <p className="text-xs text-amber-700">Won</p>
                </CardContent>
              </Card>

              <Card className="bg-amber-100/50 border-amber-300">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-bold text-amber-900">{profile.games_played}</p>
                  <p className="text-xs text-amber-700">Played</p>
                </CardContent>
              </Card>

              <Card className="bg-amber-100/50 border-amber-300">
                <CardContent className="p-4 text-center">
                  <div className="h-6 w-6 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{winRate}%</span>
                  </div>
                  <p className="text-lg font-bold text-amber-900">{winRate}%</p>
                  <p className="text-xs text-amber-700">Win Rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-600 p-2 rounded-xl">
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700 data-[state=active]:to-orange-700 data-[state=active]:text-white">
            <Trophy className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700 data-[state=active]:to-orange-700 data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700 data-[state=active]:to-orange-700 data-[state=active]:text-white">
            <Info className="h-4 w-4 mr-2" />
            About
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700 data-[state=active]:to-orange-700 data-[state=active]:text-white">
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700 data-[state=active]:to-orange-700 data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="games" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700 data-[state=active]:to-orange-700 data-[state=active]:text-white">
            <Gamepad2 className="h-4 w-4 mr-2" />
            Games
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <GameHistory userId={profile.id} isOwnHistory={true} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsSection />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <AboutSection />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactSection />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacyPolicySection />
        </TabsContent>

        <TabsContent value="games" className="mt-6">
          <MoreGamesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
