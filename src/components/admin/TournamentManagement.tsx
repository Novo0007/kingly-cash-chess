import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, Trophy, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { tournamentDbHelper } from "@/utils/tournamentDbHelper";
import type { Tournament } from "@/utils/tournamentDbHelper";

interface TournamentFormData {
  title: string;
  description: string;
  game_type: string;
  entry_fee: number;
  prize_amount: number;
  max_participants: number;
  start_time: string;
  end_time: string;
  registration_deadline: string;
}

const gameTypes = [
  { value: "chess", label: "Chess" },
  { value: "math", label: "Math" },
  { value: "wordsearch", label: "Word Search" },
  { value: "memory", label: "Memory" },
  { value: "hangman", label: "Hangman" },
];

export const TournamentManagement: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState<TournamentFormData>({
    title: "",
    description: "",
    game_type: "",
    entry_fee: 5,
    prize_amount: 50,
    max_participants: 100,
    start_time: "",
    end_time: "",
    registration_deadline: "",
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentDbHelper.getTournaments();
      setTournaments(data);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast.error("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to create tournaments");
        return;
      }

      const tournamentData = {
        ...formData,
        created_by: user.id,
        total_prize_pool: formData.entry_fee * formData.max_participants,
      };

      if (editingTournament) {
        const { error } = await supabase
          .from("tournaments")
          .update(tournamentData)
          .eq("id", editingTournament.id);

        if (error) throw error;
        toast.success("Tournament updated successfully");
      } else {
        const { error } = await supabase
          .from("tournaments")
          .insert([tournamentData]);

        if (error) throw error;
        toast.success("Tournament created successfully");
      }

      setIsDialogOpen(false);
      setEditingTournament(null);
      resetForm();
      fetchTournaments();
    } catch (error) {
      console.error("Error saving tournament:", error);
      toast.error("Failed to save tournament");
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      title: tournament.title,
      description: tournament.description || "",
      game_type: tournament.game_type,
      entry_fee: Number(tournament.entry_fee),
      prize_amount: Number(tournament.prize_amount),
      max_participants: tournament.max_participants,
      start_time: new Date(tournament.start_time).toISOString().slice(0, 16),
      end_time: new Date(tournament.end_time).toISOString().slice(0, 16),
      registration_deadline: tournament.registration_deadline 
        ? new Date(tournament.registration_deadline).toISOString().slice(0, 16)
        : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tournamentId: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;

    try {
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", tournamentId);

      if (error) throw error;
      toast.success("Tournament deleted successfully");
      fetchTournaments();
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast.error("Failed to delete tournament");
    }
  };

  const handleStatusChange = async (tournamentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status: newStatus })
        .eq("id", tournamentId);

      if (error) throw error;
      toast.success(`Tournament status updated to ${newStatus}`);
      fetchTournaments();
    } catch (error) {
      console.error("Error updating tournament status:", error);
      toast.error("Failed to update tournament status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      game_type: "",
      entry_fee: 5,
      prize_amount: 50,
      max_participants: 100,
      start_time: "",
      end_time: "",
      registration_deadline: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { color: "bg-blue-500", label: "Upcoming" },
      active: { color: "bg-green-500", label: "Active" },
      completed: { color: "bg-gray-500", label: "Completed" },
      cancelled: { color: "bg-red-500", label: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", label: status };
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tournament Management</h2>
          <p className="text-muted-foreground">Create and manage tournaments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingTournament(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTournament ? "Edit Tournament" : "Create New Tournament"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tournament Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="game_type">Game Type</Label>
                  <Select value={formData.game_type} onValueChange={(value) => setFormData({ ...formData, game_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select game type" />
                    </SelectTrigger>
                    <SelectContent>
                      {gameTypes.map((game) => (
                        <SelectItem key={game.value} value={game.value}>
                          {game.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry_fee">Entry Fee (₹)</Label>
                  <Input
                    id="entry_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prize_amount">Prize Amount (₹)</Label>
                  <Input
                    id="prize_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.prize_amount}
                    onChange={(e) => setFormData({ ...formData, prize_amount: Number(e.target.value) })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="2"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTournament ? "Update" : "Create"} Tournament
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {tournaments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Tournaments Created
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first tournament to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          tournaments.map((tournament) => (
            <Card key={tournament.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{tournament.title}</CardTitle>
                      {getStatusBadge(tournament.status)}
                    </div>
                    <p className="text-muted-foreground">{tournament.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(tournament)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(tournament.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div className="text-sm">
                      <div className="font-medium">
                        {tournament.current_participants}/{tournament.max_participants}
                      </div>
                      <div className="text-muted-foreground">Participants</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm">
                      <div className="font-medium">₹{tournament.prize_amount}</div>
                      <div className="text-muted-foreground">Prize</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(tournament.start_time).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">Start Date</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(tournament.end_time).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">End Date</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select 
                    value={tournament.status} 
                    onValueChange={(value) => handleStatusChange(tournament.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};