import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Crown,
  Clock,
  Users,
  Coins,
  Trophy,
  Calendar,
  Target,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTournament: (data: any) => void;
  defaultGameType?: string;
}

export const CreateTournamentDialog: React.FC<CreateTournamentDialogProps> = ({
  open,
  onOpenChange,
  onCreateTournament,
  defaultGameType,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    game_type: defaultGameType || "",
    entry_fee: 5,
    prize_amount: 50,
    max_participants: 100,
    duration_hours: 3,
    start_delay_minutes: 60, // Start in 1 hour by default
  });

  const [loading, setLoading] = useState(false);

  const gameTypes = [
    { value: "chess", label: "Chess", icon: "♛" },
    { value: "ludo", label: "Ludo", icon: "🎲" },
    { value: "maze", label: "Maze", icon: "🧩" },
    { value: "game2048", label: "2048", icon: "🎯" },
    { value: "math", label: "Math", icon: "🧮" },
    { value: "wordsearch", label: "Word Search", icon: "📝" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Tournament title is required");
      return;
    }

    if (!formData.game_type) {
      toast.error("Please select a game type");
      return;
    }

    if (formData.entry_fee < 1 || formData.entry_fee > 1000) {
      toast.error("Entry fee must be between ₹1 and ₹1000");
      return;
    }

    if (formData.prize_amount < 1 || formData.prize_amount > 10000) {
      toast.error("Prize amount must be between ₹1 and ₹10,000");
      return;
    }

    if (formData.max_participants < 2 || formData.max_participants > 1000) {
      toast.error("Participants must be between 2 and 1000");
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const startTime = new Date(
        now.getTime() + formData.start_delay_minutes * 60000,
      );
      const endTime = new Date(
        startTime.getTime() + formData.duration_hours * 3600000,
      );
      const registrationDeadline = new Date(startTime.getTime() - 5 * 60000); // 5 minutes before start

      const tournamentData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        game_type: formData.game_type,
        entry_fee: formData.entry_fee,
        prize_amount: formData.prize_amount,
        max_participants: formData.max_participants,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        registration_deadline: registrationDeadline.toISOString(),
        status: "upcoming" as const,
      };

      await onCreateTournament(tournamentData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        game_type: defaultGameType || "",
        entry_fee: 5,
        prize_amount: 50,
        max_participants: 100,
        duration_hours: 3,
        start_delay_minutes: 60,
      });
    } catch (error) {
      console.error("Error creating tournament:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStartTime = () => {
    const now = new Date();
    const startTime = new Date(
      now.getTime() + formData.start_delay_minutes * 60000,
    );
    return startTime.toLocaleString();
  };

  const calculateEndTime = () => {
    const now = new Date();
    const startTime = new Date(
      now.getTime() + formData.start_delay_minutes * 60000,
    );
    const endTime = new Date(
      startTime.getTime() + formData.duration_hours * 3600000,
    );
    return endTime.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-6 w-6 text-purple-600" />
            Create New Tournament
          </DialogTitle>
          <DialogDescription>
            Set up a new tournament for players to compete in. Entry fee: ₹5,
            Winner prize: ₹50, Duration: 3 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tournament Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Morning Chess Championship"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description of the tournament..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="game_type">Game Type *</Label>
              <Select
                value={formData.game_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, game_type: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a game type" />
                </SelectTrigger>
                <SelectContent>
                  {gameTypes.map((game) => (
                    <SelectItem key={game.value} value={game.value}>
                      <div className="flex items-center gap-2">
                        <span>{game.icon}</span>
                        <span>{game.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tournament Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_fee">Entry Fee (₹)</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="entry_fee"
                  type="number"
                  value={formData.entry_fee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      entry_fee: Number(e.target.value),
                    })
                  }
                  className="pl-10"
                  min="1"
                  max="1000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="prize_amount">Winner Prize (₹)</Label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="prize_amount"
                  type="number"
                  value={formData.prize_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prize_amount: Number(e.target.value),
                    })
                  }
                  className="pl-10"
                  min="1"
                  max="10000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_participants">Max Participants</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_participants: Number(e.target.value),
                    })
                  }
                  className="pl-10"
                  min="2"
                  max="1000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration_hours">Duration (Hours)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_hours: Number(e.target.value),
                    })
                  }
                  className="pl-10"
                  min="1"
                  max="24"
                  required
                />
              </div>
            </div>
          </div>

          {/* Timing Settings */}
          <div>
            <Label htmlFor="start_delay_minutes">Start In (Minutes)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="start_delay_minutes"
                type="number"
                value={formData.start_delay_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    start_delay_minutes: Number(e.target.value),
                  })
                }
                className="pl-10"
                min="15"
                max="1440"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tournament will start in {formData.start_delay_minutes} minutes
              from now
            </p>
          </div>

          {/* Tournament Preview */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Tournament Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="font-medium">{calculateStartTime()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Time:</span>
                  <span className="font-medium">{calculateEndTime()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-medium">
                    {formData.duration_hours} hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prize Pool:</span>
                  <span className="font-medium text-green-600">
                    ₹{formData.prize_amount} (Winner takes all)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <strong>Note:</strong> Tournament settings cannot be changed after
              creation. Players will be charged the entry fee immediately upon
              joining.
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={loading}
            >
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Create Tournament
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
