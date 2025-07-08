import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Users,
  Clock,
  Trophy,
  Coins,
  Play,
  Star,
  RefreshCw,
  Crown,
  Lock,
  Globe,
} from "lucide-react";
import {
  getAvailableScrabbleGames,
  ScrabbleGameRecord,
} from "@/utils/scrabbleDbHelper";
import { toast } from "sonner";

interface ScrabbleLobbyProps {
  onCreateGame: (
    gameName: string,
    maxPlayers: number,
    entryFee: number,
    isPrivate: boolean,
    isSinglePlayer?: boolean,
  ) => void;
  onJoinGame: (gameId: string) => void;
  userCoins: number;
  isLoading: boolean;
}

export const ScrabbleLobby: React.FC<ScrabbleLobbyProps> = ({
  onCreateGame,
  onJoinGame,
  userCoins,
  isLoading,
}) => {
  const [availableGames, setAvailableGames] = useState<ScrabbleGameRecord[]>(
    [],
  );
  const [loadingGames, setLoadingGames] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Create game form state
  const [gameName, setGameName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [entryFee, setEntryFee] = useState<number>(0);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);

  // Load available games
  useEffect(() => {
    loadAvailableGames();

    // Refresh games every 10 seconds
    const interval = setInterval(loadAvailableGames, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAvailableGames = async () => {
    try {
      const result = await getAvailableScrabbleGames();
      if (result.success && result.games) {
        setAvailableGames(result.games);
      }
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setLoadingGames(false);
    }
  };

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      toast.error("Please enter a game name");
      return;
    }

    if (userCoins < entryFee) {
      toast.error("Insufficient coins!");
      return;
    }

    await onCreateGame(
      gameName.trim(),
      maxPlayers,
      entryFee,
      isPrivate,
      isSinglePlayer,
    );
    setCreateDialogOpen(false);

    // Reset form
    setGameName("");
    setMaxPlayers(2);
    setEntryFee(0);
    setIsPrivate(false);
    setIsSinglePlayer(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getPlayerText = (game: ScrabbleGameRecord) => {
    const playerIds = [
      game.player1_id,
      game.player2_id,
      game.player3_id,
      game.player4_id,
    ].filter(Boolean);
    return `${playerIds.length}/${game.max_players}`;
  };

  const canJoinGame = (game: ScrabbleGameRecord) => {
    return (
      game.game_status === "waiting" &&
      game.current_players < game.max_players &&
      userCoins >= game.entry_fee
    );
  };

  const quickGameOptions = [
    {
      name: "Single Player",
      players: 1,
      fee: 0,
      description: "Practice mode - play alone",
      isSinglePlayer: true,
    },
    {
      name: "Quick Match",
      players: 2,
      fee: 0,
      description: "Free 2-player game",
      isSinglePlayer: false,
    },
    {
      name: "Casual Game",
      players: 4,
      fee: 10,
      description: "4-player game, small stakes",
      isSinglePlayer: false,
    },
    {
      name: "Championship",
      players: 4,
      fee: 50,
      description: "High stakes tournament",
      isSinglePlayer: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userCoins}</div>
            <div className="text-sm opacity-90">Your Coins</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{availableGames.length}</div>
            <div className="text-sm opacity-90">Active Games</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {availableGames.reduce((sum, game) => sum + game.prize_amount, 0)}
            </div>
            <div className="text-sm opacity-90">Total Prizes</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="join" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="join">Join Game</TabsTrigger>
          <TabsTrigger value="create">Create Game</TabsTrigger>
        </TabsList>

        <TabsContent value="join" className="space-y-4">
          {/* Quick Games */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Quick Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickGameOptions.map((option, index) => (
                  <Card
                    key={index}
                    className="border-2 hover:border-blue-300 transition-colors"
                  >
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{option.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {option.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Players:</span>
                          <Badge variant="outline">{option.players}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Entry Fee:</span>
                          <Badge
                            variant={option.fee === 0 ? "secondary" : "default"}
                          >
                            {option.fee} coins
                          </Badge>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            disabled={userCoins < option.fee || isLoading}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Play Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create {option.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="quickGameName">Game Name</Label>
                              <Input
                                id="quickGameName"
                                placeholder={`${option.name} - ${new Date().toLocaleTimeString()}`}
                                defaultValue={`${option.name} - ${new Date().toLocaleTimeString()}`}
                                onChange={(e) => setGameName(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() => {
                                const name =
                                  gameName ||
                                  `${option.name} - ${new Date().toLocaleTimeString()}`;
                                onCreateGame(
                                  name,
                                  option.players,
                                  option.fee,
                                  false,
                                  option.isSinglePlayer,
                                );
                              }}
                              className="w-full"
                              disabled={isLoading}
                            >
                              Create Game
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Games */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Available Games
                </CardTitle>
                <Button
                  onClick={loadAvailableGames}
                  variant="outline"
                  size="sm"
                  disabled={loadingGames}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loadingGames ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingGames ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading games...</p>
                </div>
              ) : availableGames.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">
                    No games available right now
                  </p>
                  <p className="text-sm text-gray-400">
                    Be the first to create a game!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">
                            {game.game_name || "Unnamed Game"}
                          </h3>
                          {game.is_friend_challenge && (
                            <Lock className="h-4 w-4 text-gray-500" />
                          )}
                          {game.game_status === "active" && (
                            <Badge className="bg-green-100 text-green-800">
                              Live
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {getPlayerText(game)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            {game.entry_fee} coins
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {game.prize_amount} prize
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(game.created_at)}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => onJoinGame(game.id)}
                        disabled={!canJoinGame(game) || isLoading}
                        size="sm"
                      >
                        {game.game_status === "active" ? "Watch" : "Join"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Create New Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gameName">Game Name</Label>
                <Input
                  id="gameName"
                  placeholder="Enter game name..."
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maxPlayers">Maximum Players</Label>
                <Select
                  value={maxPlayers.toString()}
                  onValueChange={(value) => setMaxPlayers(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Players</SelectItem>
                    <SelectItem value="3">3 Players</SelectItem>
                    <SelectItem value="4">4 Players</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entryFee">Entry Fee (Coins)</Label>
                <Select
                  value={entryFee.toString()}
                  onValueChange={(value) => setEntryFee(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Free (0 coins)</SelectItem>
                    <SelectItem value="10">10 coins</SelectItem>
                    <SelectItem value="25">25 coins</SelectItem>
                    <SelectItem value="50">50 coins</SelectItem>
                    <SelectItem value="100">100 coins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="private">Private Game (Friends Only)</Label>
              </div>

              {entryFee > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Prize Pool:</strong> {entryFee * maxPlayers} coins
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Winner takes the entire prize pool!
                  </p>
                </div>
              )}

              {userCoins < entryFee && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    Insufficient coins! You need {entryFee} coins but only have{" "}
                    {userCoins}.
                  </p>
                </div>
              )}

              <Button
                onClick={handleCreateGame}
                className="w-full"
                disabled={isLoading || userCoins < entryFee || !gameName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Game
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
