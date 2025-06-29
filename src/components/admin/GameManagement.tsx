
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gamepad2, Crown, Dice6, Users, Clock, Trophy } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface GameManagementProps {
  adminUser: Tables<"admin_users">;
}

type ChessGame = Tables<"chess_games">;
type LudoGame = Tables<"ludo_games">;

export const GameManagement = ({ adminUser }: GameManagementProps) => {
  const [chessGames, setChessGames] = useState<ChessGame[]>([]);
  const [ludoGames, setLudoGames] = useState<LudoGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chess" | "ludo">("chess");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const [chessResult, ludoResult] = await Promise.all([
        supabase
          .from("chess_games")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("ludo_games")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (chessResult.error) throw chessResult.error;
      if (ludoResult.error) throw ludoResult.error;

      setChessGames(chessResult.data || []);
      setLudoGames(ludoResult.data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const endGame = async (gameId: string, gameType: "chess" | "ludo") => {
    try {
      const table = gameType === "chess" ? "chess_games" : "ludo_games";
      const { error } = await supabase
        .from(table)
        .update({ game_status: "completed" })
        .eq("id", gameId);

      if (error) throw error;
      
      toast.success("Game ended successfully");
      fetchGames();
    } catch (error) {
      console.error("Error ending game:", error);
      toast.error("Failed to end game");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-600 text-white";
      case "active":
        return "bg-green-600 text-white";
      case "completed":
        return "bg-blue-600 text-white";
      case "cancelled":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-600">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading games...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-900/20 border-blue-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-blue-300 text-sm">Chess Games</p>
                <p className="text-white font-bold text-lg">{chessGames.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-900/20 border-orange-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Dice6 className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-orange-300 text-sm">Ludo Games</p>
                <p className="text-white font-bold text-lg">{ludoGames.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-green-300 text-sm">Active Games</p>
                <p className="text-white font-bold text-lg">
                  {chessGames.filter(g => g.game_status === "active").length + 
                   ludoGames.filter(g => g.game_status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/20 border-purple-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-purple-300 text-sm">Waiting</p>
                <p className="text-white font-bold text-lg">
                  {chessGames.filter(g => g.game_status === "waiting").length + 
                   ludoGames.filter(g => g.game_status === "waiting").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-orange-400" />
            Game Management
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activeTab === "chess" ? "default" : "outline"}
              onClick={() => setActiveTab("chess")}
              className={activeTab === "chess" ? "bg-blue-600" : "text-slate-300 border-slate-600"}
            >
              <Crown className="h-4 w-4 mr-2" />
              Chess Games
            </Button>
            <Button
              size="sm"
              variant={activeTab === "ludo" ? "default" : "outline"}
              onClick={() => setActiveTab("ludo")}
              className={activeTab === "ludo" ? "bg-orange-600" : "text-slate-300 border-slate-600"}
            >
              <Dice6 className="h-4 w-4 mr-2" />
              Ludo Games
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTab === "chess" ? (
              chessGames.map((game) => (
                <Card key={game.id} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Crown className="h-6 w-6 text-blue-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {game.game_name || `Game ${game.id.slice(0, 8)}`}
                            </span>
                            <Badge className={getStatusColor(game.game_status || "waiting")}>
                              {game.game_status}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">
                            Entry Fee: ₹{Number(game.entry_fee).toFixed(2)} • 
                            Prize: ₹{Number(game.prize_amount).toFixed(2)}
                          </p>
                          <p className="text-slate-300 text-sm">
                            Current Turn: {game.current_turn} • 
                            Time Control: {game.time_control}s
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white text-sm">
                            Created: {new Date(game.created_at || '').toLocaleDateString()}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {game.id.slice(0, 8)}...
                          </p>
                        </div>

                        {game.game_status === "active" && (
                          <Button
                            size="sm"
                            onClick={() => endGame(game.id, "chess")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            End Game
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              ludoGames.map((game) => (
                <Card key={game.id} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Dice6 className="h-6 w-6 text-orange-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {game.game_name || `Ludo ${game.id.slice(0, 8)}`}
                            </span>
                            <Badge className={getStatusColor(game.game_status)}>
                              {game.game_status}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">
                            Entry Fee: ₹{Number(game.entry_fee).toFixed(2)} • 
                            Prize: ₹{Number(game.prize_amount).toFixed(2)}
                          </p>
                          <p className="text-slate-300 text-sm">
                            Players: {game.current_players}/{game.max_players} • 
                            Current Turn: {game.current_turn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white text-sm">
                            Created: {new Date(game.created_at || '').toLocaleDateString()}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {game.id.slice(0, 8)}...
                          </p>
                        </div>

                        {game.game_status === "active" && (
                          <Button
                            size="sm"
                            onClick={() => endGame(game.id, "ludo")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            End Game
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
