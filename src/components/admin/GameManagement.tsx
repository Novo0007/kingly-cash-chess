import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gamepad2, Crown, Users, Clock, Trophy } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface GameManagementProps {
  adminUser: Tables<"admin_users">;
}

type ChessGame = Tables<"chess_games">;

export const GameManagement = ({ adminUser }: GameManagementProps) => {
  const [chessGames, setChessGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const chessResult = await supabase
        .from("chess_games")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (chessResult.error) throw chessResult.error;

      setChessGames(chessResult.data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const endGame = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from("chess_games")
        .update({ 
          game_status: "completed",
          game_result: "abandoned"
        })
        .eq("id", gameId);

      if (error) throw error;

      toast.success("Game ended successfully");
      fetchGames();
    } catch (error) {
      console.error("Error ending game:", error);
      toast.error("Failed to end game");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading games...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Active Games Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Chess Games</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {chessGames.length}
              </div>
              <div className="text-sm text-blue-600">Total Games</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Active</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {chessGames.filter((g) => g.game_status === "active").length}
              </div>
              <div className="text-sm text-green-600">Currently Playing</div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Waiting</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {chessGames.filter((g) => g.game_status === "waiting").length}
              </div>
              <div className="text-sm text-amber-600">For Opponents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Chess Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chessGames.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No chess games found
              </div>
            ) : (
              chessGames.map((game) => (
                <div
                  key={game.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        {game.game_name || `Chess ${game.id.slice(0, 8)}`}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={
                              game.game_status === "active"
                                ? "default"
                                : game.game_status === "waiting"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {game.game_status}
                          </Badge>
                          <span>Entry: ₹{game.entry_fee}</span>
                          <span>Prize: ₹{game.prize_amount}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>Players: {game.black_player_id ? "2/2" : "1/2"}</span>
                          <span>Turn: {game.current_turn}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(game.created_at).toLocaleString()}
                      </span>
                      {game.game_status === "active" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => endGame(game.id)}
                        >
                          End Game
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};