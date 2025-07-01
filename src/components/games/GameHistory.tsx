
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Clock, 
  Calendar, 
  User, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Crown,
  Target
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface GameHistoryProps {
  userId: string;
  isOwnHistory?: boolean;
}

interface GameWithPlayers {
  id: string;
  game_name: string;
  game_status: string;
  game_result: string | null;
  winner_id: string | null;
  white_player_id: string | null;
  black_player_id: string | null;
  entry_fee: number;
  prize_amount: number;
  created_at: string;
  updated_at: string;
  white_player: { username: string; chess_rating: number } | null;
  black_player: { username: string; chess_rating: number } | null;
  move_history: string[];
  board_state: string;
}

export const GameHistory = ({ userId, isOwnHistory = true }: GameHistoryProps) => {
  const [games, setGames] = useState<GameWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGame, setSelectedGame] = useState<GameWithPlayers | null>(null);
  const gamesPerPage = 10;

  useEffect(() => {
    fetchGameHistory();
  }, [userId, currentPage]);

  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      
      const offset = (currentPage - 1) * gamesPerPage;
      
      let query = supabase
        .from("chess_games")
        .select(`
          id,
          game_name,
          game_status,
          game_result,
          winner_id,
          white_player_id,
          black_player_id,
          entry_fee,
          prize_amount,
          created_at,
          updated_at,
          move_history,
          board_state,
          white_player:profiles!chess_games_white_player_id_fkey(username, chess_rating),
          black_player:profiles!chess_games_black_player_id_fkey(username, chess_rating)
        `)
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
        .eq("game_status", "completed")
        .order("updated_at", { ascending: false })
        .range(offset, offset + gamesPerPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setGames(data || []);
      setTotalPages(Math.ceil((count || 0) / gamesPerPage));
    } catch (error) {
      console.error("Error fetching game history:", error);
      toast.error("Failed to load game history");
    } finally {
      setLoading(false);
    }
  };

  const getGameResult = (game: GameWithPlayers) => {
    if (!game.winner_id) return "Draw";
    
    const isUserWhite = game.white_player_id === userId;
    const isUserBlack = game.black_player_id === userId;
    const userWon = game.winner_id === userId;
    
    if (userWon) return "Won";
    if (isUserWhite || isUserBlack) return "Lost";
    return "Draw";
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "Won": return "bg-green-600 text-white";
      case "Lost": return "bg-red-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getOpponentInfo = (game: GameWithPlayers) => {
    const isUserWhite = game.white_player_id === userId;
    
    if (isUserWhite) {
      return {
        name: game.black_player?.username || "Unknown",
        rating: game.black_player?.chess_rating || 1200,
        color: "Black"
      };
    } else {
      return {
        name: game.white_player?.username || "Unknown", 
        rating: game.white_player?.chess_rating || 1200,
        color: "White"
      };
    }
  };

  if (loading) {
    return (
      <Card className="wood-card border-amber-600">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-900">Loading game history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="wood-card border-amber-600">
        <CardHeader>
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {isOwnHistory ? "Your Game History" : "Player Game History"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {games.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <p className="text-amber-800">No completed games found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => {
                const result = getGameResult(game);
                const opponent = getOpponentInfo(game);
                
                return (
                  <Card key={game.id} className="bg-amber-50/50 border border-amber-300 hover:bg-amber-100/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge className={getResultColor(result)}>
                            {result}
                          </Badge>
                          
                          <div>
                            <p className="font-medium text-amber-900">
                              vs {opponent.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-amber-700">
                              <User className="h-3 w-3" />
                              <span>Rating: {opponent.rating}</span>
                              <span>•</span>
                              <span>Playing as {game.white_player_id === userId ? "White" : "Black"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-amber-700 mb-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(game.updated_at).toLocaleDateString()}
                          </div>
                          
                          {game.entry_fee > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Crown className="h-3 w-3 text-yellow-600" />
                              <span className="text-amber-800">₹{game.entry_fee}</span>
                              {result === "Won" && (
                                <span className="text-green-700 font-medium">
                                  → ₹{game.prize_amount}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 border-amber-400 text-amber-800 hover:bg-amber-100"
                            onClick={() => setSelectedGame(game)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-amber-400 text-amber-800 hover:bg-amber-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="px-4 py-2 text-amber-900 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-amber-400 text-amber-800 hover:bg-amber-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
