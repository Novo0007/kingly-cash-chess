import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TournamentReward {
  id: string;
  tournament_id: string;
  rank: number;
  reward_amount: number;
  claimed: boolean;
  claimed_at?: string;
  created_at: string;
  tournament: {
    title: string;
    game_type: string;
    status: string;
  };
}

export const TournamentRewards: React.FC = () => {
  const [rewards, setRewards] = useState<TournamentReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("tournament_rewards")
        .select(`
          *,
          tournament:tournaments(title, game_type, status)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to load tournament rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      setClaiming(rewardId);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to claim rewards");
        return;
      }

      const { data, error } = await supabase.rpc("claim_tournament_reward", {
        reward_id_param: rewardId,
        user_id_param: user.id,
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast.success(`Reward of ₹${result.amount_claimed} claimed successfully!`);
        fetchRewards(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to claim reward");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Failed to claim reward");
    } finally {
      setClaiming(null);
    }
  };

  const getRankBadge = (rank: number) => {
    const rankConfig = {
      1: { color: "bg-yellow-500", icon: "🥇", label: "1st" },
      2: { color: "bg-gray-400", icon: "🥈", label: "2nd" },
      3: { color: "bg-amber-600", icon: "🥉", label: "3rd" },
    };

    const config = rankConfig[rank as keyof typeof rankConfig] || {
      color: "bg-blue-500",
      icon: "🏆",
      label: `${rank}th`,
    };

    return (
      <Badge className={`${config.color} text-white`}>
        {config.icon} {config.label} Place
      </Badge>
    );
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case "chess":
        return "♛";
      case "ludo":
        return "🎲";
      case "maze":
        return "🧩";
      case "game2048":
        return "🎯";
      case "math":
        return "🧮";
      case "wordsearch":
        return "📝";
      default:
        return "🎮";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardContent className="p-8">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Tournament Rewards</h2>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Tournament Rewards
            </h3>
            <p className="text-gray-600">
              Participate in tournaments to earn rewards!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rewards.map((reward) => (
            <Card 
              key={reward.id} 
              className={`transition-all duration-300 ${
                !reward.claimed ? "border-yellow-200 bg-yellow-50" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white shadow-lg">
                      <span className="text-2xl">
                        {getGameTypeIcon(reward.tournament.game_type)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        {reward.tournament.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getRankBadge(reward.rank)}
                        <Badge variant="outline">
                          {reward.tournament.game_type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{reward.reward_amount}
                    </div>
                    
                    {reward.claimed ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Claimed on {new Date(reward.claimed_at!).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleClaimReward(reward.id)}
                        disabled={claiming === reward.id}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        {claiming === reward.id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Gift className="h-4 w-4 mr-2" />
                            Claim Reward
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};