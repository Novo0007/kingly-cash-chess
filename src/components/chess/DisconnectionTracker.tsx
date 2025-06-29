
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface DisconnectionTrackerProps {
  gameId: string;
  currentUser: string | null;
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  gameStatus: string;
  onPlayerDisconnected: (playerId: string) => void;
}

export const DisconnectionTracker: React.FC<DisconnectionTrackerProps> = ({
  gameId,
  currentUser,
  whitePlayerId,
  blackPlayerId,
  gameStatus,
  onPlayerDisconnected
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [showDisconnectionWarning, setShowDisconnectionWarning] = useState(false);
  const [disconnectedPlayer, setDisconnectedPlayer] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!currentUser || gameStatus !== 'active') return;

    let presenceChannel: any = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let disconnectionTimer: NodeJS.Timeout | null = null;

    const setupPresenceTracking = () => {
      presenceChannel = supabase
        .channel(`presence-${gameId}`)
        .on('presence', { event: 'sync' }, () => {
          setConnectionStatus('connected');
          setShowDisconnectionWarning(false);
          
          if (disconnectionTimer) {
            clearTimeout(disconnectionTimer);
            disconnectionTimer = null;
          }
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('Player joined:', newPresences);
          setConnectionStatus('connected');
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          const leftUser = leftPresences[0];
          if (leftUser && (leftUser.user_id === whitePlayerId || leftUser.user_id === blackPlayerId)) {
            if (leftUser.user_id !== currentUser) {
              startDisconnectionTimer(leftUser.user_id);
            }
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
              user_id: currentUser,
              online_at: new Date().toISOString(),
              game_id: gameId
            });
          }
        });

      // Heartbeat to maintain connection
      heartbeatInterval = setInterval(async () => {
        if (presenceChannel) {
          await presenceChannel.track({
            user_id: currentUser,
            online_at: new Date().toISOString(),
            game_id: gameId,
            heartbeat: Date.now()
          });
        }
      }, 10000); // Every 10 seconds
    };

    const startDisconnectionTimer = (playerId: string) => {
      setShowDisconnectionWarning(true);
      setDisconnectedPlayer(playerId);
      setCountdown(30);

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      disconnectionTimer = setTimeout(() => {
        clearInterval(countdownInterval);
        setShowDisconnectionWarning(false);
        onPlayerDisconnected(playerId);
      }, 30000); // 30 seconds
    };

    // Check online status
    const handleOnline = () => {
      setConnectionStatus('connected');
      setupPresenceTracking();
    };

    const handleOffline = () => {
      setConnectionStatus('disconnected');
    };

    // Network status listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial setup
    if (navigator.onLine) {
      setupPresenceTracking();
    } else {
      setConnectionStatus('disconnected');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      if (disconnectionTimer) {
        clearTimeout(disconnectionTimer);
      }
    };
  }, [gameId, currentUser, gameStatus, whitePlayerId, blackPlayerId]);

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-1 text-xs">
        {connectionStatus === 'connected' ? (
          <><Wifi className="h-3 w-3 text-green-400" /><span className="text-green-400">Connected</span></>
        ) : connectionStatus === 'disconnected' ? (
          <><WifiOff className="h-3 w-3 text-red-400" /><span className="text-red-400">Disconnected</span></>
        ) : (
          <><Wifi className="h-3 w-3 text-yellow-400 animate-pulse" /><span className="text-yellow-400">Reconnecting...</span></>
        )}
      </div>

      {/* Disconnection Warning Dialog */}
      <Dialog open={showDisconnectionWarning} onOpenChange={() => {}}>
        <DialogContent className="text-center w-[95vw] max-w-sm mx-auto bg-gradient-to-br from-orange-900 to-red-900 border-2 border-orange-400">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl text-white font-bold">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
              Player Disconnected!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-orange-200 font-medium">
              Opponent has disconnected.
              <br />
              <span className="text-2xl font-bold text-orange-400">
                {countdown}
              </span>
              <br />
              seconds until forfeit...
            </div>
            <div className="w-full bg-orange-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
