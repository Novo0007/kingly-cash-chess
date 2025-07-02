import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Check,
  X,
  Gamepad2,
  Star,
  Crown,
  Clock,
  Trophy,
} from "lucide-react";
import { ChallengePopup } from "./ChallengePopup";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import type { Tables } from "@/integrations/supabase/types";
import { UserProfileDialog } from './UserProfileDialog';

type Profile = Tables<"profiles">;
type Friendship = Tables<"friendships">;

interface FriendshipWithProfile extends Friendship {
  friend?: Profile;
  isOnline?: boolean;
}

export const FriendsSystem = () => {
  const { isMobile, isTablet } = useDeviceType();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<
    (Friendship & { requester?: Profile })[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [challengePopup, setChallengePopup] = useState<{
    open: boolean;
    friendId: string;
    friendName: string;
    gameType: "chess" | "ludo";
  }>({
    open: false,
    friendId: "",
    friendName: "",
    gameType: "chess",
  });
  const [sentChallenges, setSentChallenges] = useState<any[]>([]);
  const [receivedChallenges, setReceivedChallenges] = useState<any[]>([]);
  const [profileDialog, setProfileDialog] = useState<{
    open: boolean;
    profile: Profile | null;
  }>({
    open: false,
    profile: null,
  });

  useEffect(() => {
    getCurrentUser();
    fetchAllUsers();
    fetchFriends();
    fetchPendingRequests();
    fetchSentChallenges();
    fetchReceivedChallenges();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const fetchAllUsers = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .order("username");

    setAllUsers(data || []);
  };

  const fetchFriends = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("friendships")
      .select("*")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (data) {
      const friendsWithProfiles = await Promise.all(
        data.map(async (friendship) => {
          const friendId =
            friendship.requester_id === user.id
              ? friendship.addressee_id
              : friendship.requester_id;

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", friendId)
            .single();

          // Simulate online status - in a real app, you'd track this properly
          const isOnline = Math.random() > 0.5; // Random for demo

          return {
            ...friendship,
            friend: profile,
            isOnline,
          };
        }),
      );

      setFriends(friendsWithProfiles);
    }
  };

  const fetchPendingRequests = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("friendships")
      .select("*")
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    if (data) {
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", request.requester_id)
            .single();

          return {
            ...request,
            requester: profile,
          };
        }),
      );

      setPendingRequests(requestsWithProfiles);
    }
  };

  const fetchSentChallenges = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("game_invitations")
      .select(
        `
        *,
        to_user:profiles!game_invitations_to_user_id_fkey(*),
        chess_game:chess_games(*),
        ludo_game:ludo_games(*)
      `,
      )
      .eq("from_user_id", user.id)
      .eq("status", "pending");

    setSentChallenges(data || []);
  };

  const fetchReceivedChallenges = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("game_invitations")
      .select(
        `
        *,
        from_user:profiles!game_invitations_from_user_id_fkey(*),
        chess_game:chess_games(*),
        ludo_game:ludo_games(*)
      `,
      )
      .eq("to_user_id", user.id)
      .eq("status", "pending");

    setReceivedChallenges(data || []);
  };

  const sendFriendRequest = async (addresseeId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to send friend request");
    } else {
      toast.success("Friend request sent!");
      fetchAllUsers();
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to accept friend request");
    } else {
      toast.success("Friend request accepted!");
      fetchFriends();
      fetchPendingRequests();
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to decline friend request");
    } else {
      toast.success("Friend request declined");
      fetchPendingRequests();
    }
  };

  const createGameInvitation = async (
    friendId: string,
    amount: number,
    gameType: "chess" | "ludo" = "chess",
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      console.log(
        "Creating challenge for friend:",
        friendId,
        "amount:",
        amount,
        "gameType:",
        gameType,
      );

      // Check user's wallet balance first
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (!wallet || wallet.balance < amount) {
        toast.error("Insufficient balance for this challenge");
        return;
      }

      // Deduct the entry fee from user's wallet
      const { error: walletError } = await supabase.rpc("increment_decimal", {
        table_name: "wallets",
        row_id: user.id,
        column_name: "balance",
        increment_value: -amount,
      });

      if (walletError) {
        console.error("Wallet update error:", walletError);
        toast.error("Failed to deduct entry fee");
        return;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          transaction_type: "game_entry",
          amount: amount,
          status: "completed",
          description: `Entry fee for ₹${amount} ${gameType} challenge`,
        });

      if (transactionError) {
        console.error("Transaction record error:", transactionError);
      }

      let gameData;

      if (gameType === "chess") {
        // Create a new chess game with is_friend_challenge flag
        const { data: chessGameData, error: gameError } = await supabase
          .from("chess_games")
          .insert({
            white_player_id: user.id,
            entry_fee: amount,
            prize_amount: amount * 2,
            game_status: "waiting",
            game_name: `Challenge - ₹${amount}`,
            is_friend_challenge: true,
          })
          .select()
          .single();

        if (gameError) {
          console.error("Chess game creation error:", gameError);
          toast.error("Failed to create challenge");
          return;
        }
        gameData = chessGameData;
      } else {
        // Create a new ludo game with is_friend_challenge flag
        const { data: ludoGameData, error: gameError } = await supabase
          .from("ludo_games")
          .insert({
            creator_id: user.id,
            player1_id: user.id,
            entry_fee: amount,
            prize_amount: amount * 2,
            game_status: "waiting",
            game_name: `Challenge - ₹${amount}`,
            is_friend_challenge: true,
            game_state: {},
          })
          .select()
          .single();

        if (gameError) {
          console.error("Ludo game creation error:", gameError);
          toast.error("Failed to create challenge");
          return;
        }
        gameData = ludoGameData;
      }

      console.log("Game created successfully:", gameData);

      // Create the game invitation
      const { error } = await supabase.from("game_invitations").insert({
        from_user_id: user.id,
        to_user_id: friendId,
        game_id: gameData.id,
        entry_fee: amount,
        game_type: gameType,
        status: "pending",
      });

      if (error) {
        console.error("Invitation creation error:", error);
        toast.error("Failed to send challenge");
      } else {
        console.log("Challenge sent successfully");
        toast.success(`₹${amount} ${gameType} challenge sent!`);
        fetchSentChallenges();
      }
    } catch (error) {
      console.error("Challenge creation error:", error);
      toast.error("Failed to create challenge");
    }
  };

  const cancelChallenge = async (
    invitationId: string,
    gameId: string,
    gameType: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get the challenge amount first for refund
    const { data: invitation } = await supabase
      .from("game_invitations")
      .select("entry_fee")
      .eq("id", invitationId)
      .single();

    if (invitation) {
      // Refund the entry fee
      const { error: refundError } = await supabase.rpc("increment_decimal", {
        table_name: "wallets",
        row_id: user.id,
        column_name: "balance",
        increment_value: invitation.entry_fee,
      });

      if (refundError) {
        console.error("Refund error:", refundError);
      }
    }

    // Cancel the invitation
    const { error: invitationError } = await supabase
      .from("game_invitations")
      .update({ status: "cancelled" })
      .eq("id", invitationId);

    // Cancel the game in the appropriate table
    const gameTable = gameType === "chess" ? "chess_games" : "ludo_games";
    const { error: gameError } = await supabase
      .from(gameTable)
      .update({ game_status: "cancelled" })
      .eq("id", gameId);

    if (invitationError || gameError) {
      toast.error("Failed to cancel challenge");
    } else {
      toast.success("Challenge cancelled and refunded");
      fetchSentChallenges();
    }
  };

  const acceptChallenge = async (
    invitationId: string,
    gameId: string,
    amount: number,
    gameType: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Check user's wallet balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!wallet || wallet.balance < amount) {
      toast.error("Insufficient balance for this challenge");
      return;
    }

    // Deduct entry fee
    const { error: walletError } = await supabase.rpc("increment_decimal", {
      table_name: "wallets",
      row_id: user.id,
      column_name: "balance",
      increment_value: -amount,
    });

    if (walletError) {
      toast.error("Failed to deduct entry fee");
      return;
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        transaction_type: "game_entry",
        amount: amount,
        status: "completed",
        description: `Entry fee for ₹${amount} ${gameType} challenge acceptance`,
      });

    if (transactionError) {
      console.error("Transaction record error:", transactionError);
    }

    // Update invitation
    const { error: invitationError } = await supabase
      .from("game_invitations")
      .update({ status: "accepted" })
      .eq("id", invitationId);

    // Update game in the appropriate table
    let gameError;
    if (gameType === "chess") {
      const { error } = await supabase
        .from("chess_games")
        .update({
          black_player_id: user.id,
          game_status: "active",
        })
        .eq("id", gameId);
      gameError = error;
    } else {
      const { error } = await supabase
        .from("ludo_games")
        .update({
          player2_id: user.id,
          current_players: 2,
          game_status: "active",
        })
        .eq("id", gameId);
      gameError = error;
    }

    if (invitationError || gameError) {
      toast.error("Failed to accept challenge");
    } else {
      toast.success("Challenge accepted! Game starting...");
      fetchReceivedChallenges();
    }
  };

  const declineChallenge = async (
    invitationId: string,
    gameId: string,
    gameType: string,
  ) => {
    // Get challenge details for refund
    const { data: invitation } = await supabase
      .from("game_invitations")
      .select("from_user_id, entry_fee")
      .eq("id", invitationId)
      .single();

    if (invitation) {
      // Refund the challenger
      const { error: refundError } = await supabase.rpc("increment_decimal", {
        table_name: "wallets",
        row_id: invitation.from_user_id,
        column_name: "balance",
        increment_value: invitation.entry_fee,
      });

      if (refundError) {
        console.error("Refund error:", refundError);
      }
    }

    // Update invitation status
    const { error } = await supabase
      .from("game_invitations")
      .update({ status: "declined" })
      .eq("id", invitationId);

    // Cancel the game in the appropriate table
    const gameTable = gameType === "chess" ? "chess_games" : "ludo_games";
    const { error: gameError } = await supabase
      .from(gameTable)
      .update({ game_status: "cancelled" })
      .eq("id", gameId);

    if (error || gameError) {
      toast.error("Failed to decline challenge");
    } else {
      toast.success("Challenge declined and refunded to challenger");
      fetchReceivedChallenges();
    }
  };

  const openChallengePopup = (
    friendId: string,
    friendName: string,
    gameType: "chess" | "ludo" = "chess",
  ) => {
    setChallengePopup({
      open: true,
      friendId,
      friendName,
      gameType,
    });
  };

  const openProfileDialog = (profile: Profile) => {
    setProfileDialog({
      open: true,
      profile,
    });
  };

  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Mobile-optimized styles
  const cardGradient = isMobile
    ? "bg-slate-800/80 border border-slate-600"
    : "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 shadow-lg";

  const animationClass = isMobile
    ? ""
    : "transition-all duration-300 hover:scale-105";

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        <ChallengePopup
          open={challengePopup.open}
          onOpenChange={(open) =>
            setChallengePopup((prev) => ({ ...prev, open }))
          }
          friendName={challengePopup.friendName}
          onChallenge={(amount) =>
            createGameInvitation(
              challengePopup.friendId,
              amount,
              challengePopup.gameType,
            )
          }
        />

        <UserProfileDialog
          profile={profileDialog.profile}
          open={profileDialog.open}
          onOpenChange={(open) =>
            setProfileDialog((prev) => ({ ...prev, open }))
          }
        />

        {/* Received Challenges */}
        {receivedChallenges.length > 0 && (
          <Card className="bg-gradient-to-br from-emerald-900/40 to-green-800/40 border-2 border-emerald-400/60 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-200 flex items-center gap-3 text-xl font-bold">
                <Trophy className="h-6 w-6 text-yellow-400" />
                🏆 Incoming Challenges ({receivedChallenges.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {receivedChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-emerald-300/30 space-y-3 sm:space-y-0"
                >
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">
                      {challenge.from_user?.username}
                    </p>
                    <p className="text-emerald-200 text-base font-medium">
                      💰 {challenge.game_type || "chess"} Challenge: ₹
                      {challenge.entry_fee}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      onClick={() =>
                        acceptChallenge(
                          challenge.id,
                          challenge.game_id,
                          challenge.entry_fee,
                          challenge.game_type || "chess",
                        )
                      }
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 font-bold px-4 py-2 rounded-lg flex-1 sm:flex-none"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() =>
                        declineChallenge(
                          challenge.id,
                          challenge.game_id,
                          challenge.game_type || "chess",
                        )
                      }
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 font-bold px-4 py-2 rounded-lg flex-1 sm:flex-none"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sent Challenges */}
        {sentChallenges.length > 0 && (
          <Card className="bg-gradient-to-br from-amber-900/40 to-orange-800/40 border-2 border-amber-400/60 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-3 text-xl font-bold">
                <Gamepad2 className="h-6 w-6 text-yellow-400" />⏳ Sent
                Challenges ({sentChallenges.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sentChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-amber-300/30 space-y-3 sm:space-y-0"
                >
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">
                      {challenge.to_user?.username}
                    </p>
                    <p className="text-amber-200 text-base font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      💰 {challenge.game_type || "chess"} Challenge: ₹
                      {challenge.entry_fee}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      cancelChallenge(
                        challenge.id,
                        challenge.game_id,
                        challenge.game_type || "chess",
                      )
                    }
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 font-bold px-4 py-2 rounded-lg w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Search Users */}
        <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-800/40 border-2 border-indigo-400/60 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-indigo-200 flex items-center gap-3 text-xl font-bold">
              <UserPlus className="h-6 w-6 text-purple-400" />
              🔍 Find Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-indigo-400 bg-black/30 text-white placeholder:text-gray-400 text-lg py-3 px-4 rounded-lg font-medium"
            />

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-indigo-300/30 hover:bg-white/15 transition-colors space-y-3 sm:space-y-0"
                >
                  <div className="flex-1">
                    <p 
                      className="text-white font-bold text-lg flex items-center gap-2 cursor-pointer hover:text-purple-300 transition-colors"
                      onClick={() => openProfileDialog(user)}
                    >
                      <Crown className="h-5 w-5 text-yellow-400" />
                      👤 {user.username}
                    </p>
                    <p className="text-indigo-200 text-base font-medium flex items-center gap-2">
                      <Star className="h-4 w-4" />⭐ Rating: {user.chess_rating}
                    </p>
                  </div>
                  <Button
                    onClick={() => sendFriendRequest(user.id)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 font-bold text-base px-4 py-2 rounded-lg w-full sm:w-auto"
                  >
                    ➕ Add Friend
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-800/40 border-2 border-blue-400/60 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-blue-200 flex items-center gap-3 text-xl font-bold">
                <Users className="h-6 w-6 text-blue-400" />
                📨 Friend Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-blue-300/30 space-y-3 sm:space-y-0"
                >
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">
                      👤 {request.requester?.username}
                    </p>
                    <p className="text-blue-200 text-base font-medium">
                      ⭐ Rating: {request.requester?.chess_rating}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      onClick={() => acceptFriendRequest(request.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 font-bold px-4 py-2 rounded-lg flex-1 sm:flex-none"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => declineFriendRequest(request.id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 font-bold px-4 py-2 rounded-lg flex-1 sm:flex-none"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Online Friends */}
        <Card className="bg-gradient-to-br from-teal-900/40 to-green-800/40 border-2 border-teal-400/60 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-teal-200 flex items-center gap-3 text-xl font-bold">
              <Users className="h-6 w-6 text-teal-400" />
              👥 My Friends ({friends.filter((f) => f.isOnline).length} online)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {friends.filter((f) => f.isOnline).length === 0 ? (
              <p className="text-gray-300 text-center py-8 text-lg font-medium">
                😴 No friends online. Send some friend requests!
              </p>
            ) : (
              friends
                .filter((f) => f.isOnline)
                .map((friendship) => (
                  <div
                    key={friendship.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-teal-300/30 hover:bg-white/15 transition-colors space-y-3 sm:space-y-0"
                  >
                    <div className="flex-1">
                      <p 
                        className="text-white font-bold text-lg flex items-center gap-2 cursor-pointer hover:text-teal-300 transition-colors"
                        onClick={() => friendship.friend && openProfileDialog(friendship.friend)}
                      >
                        <Crown className="h-5 w-5 text-yellow-400" />
                        👤 {friendship.friend?.username}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-base text-teal-200 font-medium">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />⭐ Rating:{" "}
                          {friendship.friend?.chess_rating}
                        </span>
                        <span>🏆 Games: {friendship.friend?.games_played}</span>
                        <Badge className="bg-green-500 text-white font-bold border border-green-600">
                          🟢 Online
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() =>
                          openChallengePopup(
                            friendship.friend?.id || "",
                            friendship.friend?.username || "",
                            "chess",
                          )
                        }
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1 flex-1 sm:flex-none"
                      >
                        <Gamepad2 className="h-3 w-3" />
                        Chess
                      </Button>
                      <Button
                        onClick={() =>
                          openChallengePopup(
                            friendship.friend?.id || "",
                            friendship.friend?.username || "",
                            "ludo",
                          )
                        }
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1 flex-1 sm:flex-none"
                      >
                        <Gamepad2 className="h-3 w-3" />
                        Ludo
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};